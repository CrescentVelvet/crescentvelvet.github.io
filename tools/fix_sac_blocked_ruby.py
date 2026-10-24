#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
fix_sac_blocked_ruby.py
修复 Windows 智能应用控制（SAC / Smart App Control）拦截 Ruby C 扩展的问题。

背景：SAC 会把「某个完整路径下的某个文件」记入阻止清单，导致 .so 加载时
返回 WinError 4551「应用程序控制策略已阻止此文件」。Ruby 内部对加载失败处理
有缺陷，会直接 rb_bug 崩溃（[BUG] vm_call_super / vm_call_cfunc）。

解决：原地重建文件（备份 -> 删除 -> 写回）。新写入的文件不在旧路径哈希清单里，
SAC 重新评估后放行。经验证有效，且不需要重装 Ruby、不需要改注册表。

用法：
    python fix_sac_blocked_ruby.py            # 扫描并修复 D:\\Ruby34-x64
    python fix_sac_blocked_ruby.py --dry-run  # 只扫描不修改
    python fix_sac_blocked_ruby.py --root <RUBY_ROOT>
"""
import argparse
import ctypes
import os
import shutil
import sys
import tempfile

DEFAULT_ROOT = r"D:\Ruby34-x64"


def load_ok(path):
    """尝试加载 .so，返回 (是否成功, 描述)"""
    try:
        ctypes.WinDLL(path)
        return True, "OK"
    except OSError as e:
        w = getattr(e, "winerror", None)
        return False, f"winerror={w} {e}"


def scan(root):
    """扫描 root 下所有 .so，返回被 SAC 拦截的清单"""
    libdir = os.path.join(root, "lib")
    if not os.path.isdir(libdir):
        sys.exit(f"找不到目录: {libdir}")
    bindir = os.path.join(root, "bin")
    if os.path.isdir(bindir):
        os.add_dll_directory(bindir)

    blocked, total = [], 0
    for dirpath, _dirnames, filenames in os.walk(libdir):
        for f in filenames:
            if not f.lower().endswith(".so"):
                continue
            total += 1
            p = os.path.join(dirpath, f)
            ok, desc = load_ok(p)
            if not ok:
                blocked.append((p, desc))
    return total, blocked


def rebuild(path, bakdir):
    """原地重建文件：备份 -> 删除 -> 写回"""
    bak = os.path.join(bakdir, os.path.basename(path))
    n = 1
    while os.path.exists(bak):
        bak = os.path.join(bakdir, f"{os.path.basename(path)}.{n}")
        n += 1
    shutil.copy2(path, bak)
    size = os.path.getsize(path)
    os.remove(path)
    shutil.copy2(bak, path)
    assert os.path.getsize(path) == size, "大小不一致，已中止"
    return bak


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=DEFAULT_ROOT, help="Ruby 安装根目录")
    ap.add_argument("--dry-run", action="store_true", help="只扫描不修改")
    args = ap.parse_args()

    print(f"Ruby 根目录: {args.root}")
    total, blocked = scan(args.root)
    print(f"扫描 .so 共 {total} 个，被拦截 {len(blocked)} 个\n")

    if not blocked:
        print("没有发现被拦截的文件，无需修复。")
        return 0

    print("=== 被拦截清单 ===")
    for p, desc in blocked:
        print(f"  {p}\n      {desc}")
    print()

    if args.dry_run:
        print("[dry-run] 未做任何修改。去掉 --dry-run 执行修复。")
        return 0

    bakdir = tempfile.mkdtemp(prefix="ruby_sac_backup_")
    print(f"备份目录: {bakdir}\n")

    fixed, failed = [], []
    for p, _ in blocked:
        try:
            rebuild(p, bakdir)
            ok, desc = load_ok(p)
            if ok:
                fixed.append(p)
                print(f"  [修复] {p}")
            else:
                failed.append((p, desc))
                print(f"  [失败] {p} -> {desc}")
        except Exception as e:
            failed.append((p, str(e)))
            print(f"  [异常] {p} -> {e}")

    print()
    print(f"修复成功 {len(fixed)}/{len(blocked)}")
    if failed:
        print("仍失败：")
        for p, d in failed:
            print(f"  {p}  {d}")
        print("\n若仍失败，请改用「关闭智能应用控制」或「重装 Ruby 到新路径」方案。")
    else:
        print("全部修复完成。")
        print("建议立刻验证： bundle exec jekyll serve --config _config.yml,_config.dev.yml")
    return 0 if not failed else 1


if __name__ == "__main__":
    sys.exit(main())
