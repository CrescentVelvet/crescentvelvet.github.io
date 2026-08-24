# GitHub Pages

## 云端运行

1. 修改网站设置_config.yml，页面设置_data\navigation.yml
2. 在_pages\about.md中撰写Markdown格式的网页内容
3. 打开浏览器，访问 [crescentvelvet.github.io](crescentvelvet.github.io) 查看网页

## Ubuntu本地运行

1. Ubuntu本地下载本仓库
2. 安装ruby-dev, bundler, nodejs: `sudo apt install ruby-dev ruby-bundler nodejs`
3. 运行 `bundle clean` 来清理目录 (无需运行`--force`)
4. 运行 `bundle install` 来安装 Ruby 依赖包，如果报错，删除 `Gemfile.lock` 后重新安装：`Remove-Item Gemfile.lock; bundle install`
5. 运行 `bundle exec jekyll serve`来生成HTML
6. 打开浏览器，访问 [http://localhost:4000](http://localhost:4000) 查看网页
7. 修改代码保存后，可以实时预览网页，无需重复运行上述命令

## Windows本地运行

1. Windows本地下载本仓库
2. 访问 [Git 官方下载页面](https://git-scm.com/downloads) 下载并安装 Git
3. 访问 [RubyInstaller 官方下载页面](https://rubyinstaller.org/downloads/) 下载并安装 Ruby 3.4.x + Devkit，安装时勾选 “Run ridk install”（本仓库在 Ruby 3.4.10 上验证通过）
4. 打开命令提示符或 PowerShell，运行 `gem install bundler -v 2.6.8 --no-document` 安装与 Gemfile.lock 中 `BUNDLED WITH` 一致的 Bundler 版本
   1. Gemfile.lock 锁定了 Bundler 版本。若用 `gem install bundler`（不带 `-v`）安装的是最新版（如 4.x），运行 `bundle install` 时会触发 "Installing Bundler 2.6.8 and restarting" 的自动安装，在国内网络下容易卡住，因此推荐直接安装锁定版本
5. 运行 `bundle install` 来安装 Ruby 依赖包。执行前先 `cd` 进入仓库根目录（如 `cd C:\code\crescentvelvet.github.io`），后续 `bundle config --local`、`bundle install`、`jekyll serve` 都依赖当前目录（`bundle config --local` 写入本目录 `.bundle/config`，`jekyll serve` 从当前目录查找 `_config.yml`）
   1. 国内访问 `rubygems.org` 及 compact index 主机 `index.rubygems.org` 常超时；`gems.ruby-china.com` 镜像存在 SSL 握手失败（alert 40）问题。推荐换用 USTC 镜像，不改 Gemfile，两条配置都加（compact index 在独立的 `index.rubygems.org` 主机上，只配 `rubygems.org` 的镜像不会覆盖它）：
      ```powershell
      bundle config set --local mirror.https://rubygems.org https://mirrors.ustc.edu.cn/rubygems
      bundle config set --local mirror.https://index.rubygems.org https://mirrors.ustc.edu.cn/rubygems
      ```
   2. 配好镜像后 `bundle install` 仍可能报 `Errno::ECONNREFUSED ... mirrors.ustc.edu.cn:443`。根因：USTC/TUNA 等镜像只直接代理静态文件（`/versions`、`/specs.4.8.gz`、`/quick/*.gemspec.rz`），却把动态接口 `/info/<gem>` 与 `/api/v1/dependencies` 302 重定向到 `rubygems.org`/`api.rubygems.org`，而这两个源在国内连不上（Ruby net/http 直接超时）。bundler 默认走 compact index（依赖 `/info/`）与依赖 API，于是连不上。解决：加 `--full-index` 强制使用镜像能直连的旧式 `specs.4.8.gz` 全量索引，绕开被重定向的接口：
      ```powershell
      bundle install --full-index
      ```
      可持久化以免每次都带：`bundle config set --local full_index true`
   3. 若镜像仍不稳定，最可靠的方式是临时将 Gemfile 首行改为 `source "https://mirrors.ustc.edu.cn/rubygems"` 后再 `bundle install --full-index`，安装完成后改回即可（gem 已缓存在本地，后续 `bundle exec` 无需联网）。注意：仅换 Gemfile 源不能绕过上条的重定向问题，`--full-index` 仍需带上。
   4. 如果仍报错，删除 `Gemfile.lock` 后重新安装：`Remove-Item Gemfile.lock; bundle install`
   5. `wdm` gem（旧版 Jekyll 用于 Windows 文件监听）在 Ruby 3.x 上无法编译，报 `implicit declaration of function 'rb_thread_call_without_gvl'`，因其调用的 API 已被移除。现代 Jekyll 通过 `listen` gem 在 Windows 上即可监听文件变化，无需 `wdm`，当前 Gemfile 已将其注释掉，正常情况下不会触发编译。
6. 运行启动命令
   ```powershell
   bundle exec jekyll serve
   ```
   1. 推荐加载本地开发配置（使站内链接指向 localhost 而非生产域名）：`bundle exec jekyll serve --config _config.yml,_config.dev.yml`
   2. 如果 Ruby 安装在 `D:\Program Files\Ruby34-x64` 这类带空格的目录下，`bundle exec jekyll serve` 可能会因为路径被拆分而失败。可以改用下面的命令启动：
      ```powershell
      ruby -rbundler/setup "D:/Program Files/Ruby34-x64/lib/ruby/gems/3.4.0/gems/jekyll-3.10.0/exe/jekyll" serve --host 127.0.0.1 --port 4000
      ```
   3. 启动后 stderr 可能输出几条无害告警，均可忽略：`To use retry middleware with Faraday v2.0+...`（缺 `faraday-retry` gem，不影响构建）、`GitHub Metadata: No GitHub API authentication could be found...`（未配 GitHub token，仅 `jekyll-github-metadata` 部分字段缺失，不影响本地预览）、`Please add 'gem "wdm"...'`（见 5.5，Ruby 3.x 下无需 wdm）
7. 打开浏览器，访问 [http://127.0.0.1:4000](http://127.0.0.1:4000) 查看网页
   1. 修改代码保存后，可以实时预览网页，无需重复运行上述命令
   2. 如果需要停止本地服务，在 PowerShell 中查找并结束占用 4000 端口的进程：
      ```powershell
      netstat -ano | Select-String ":4000"
      Stop-Process -Id <PID>
      ```

## MacOS本地运行

1. MacOS本地下载本仓库
2. 安装包管理器Homebrew `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`，如果网络连接失败改为国内镜像源 `/bin/zsh -c "$(curl -fsSL https://gitee.com/cunkai/HomebrewCN/raw/master/Homebrew.sh)"`
3. 安装Ruby和Jekyll依赖 `brew install ruby`， `echo 'export PATH="$(brew --prefix ruby)/bin:$PATH"' >> ~/.zshrc`， `source ~/.zshrc`
4. 安装Bundler `gem install bundler`， `bundle install`
5. 运行 `bundle exec jekyll serve`来生成HTML
6. 打开浏览器，访问 [http://localhost:4000](http://localhost:4000) 查看网页
7. 修改代码保存后，可以实时预览网页，无需重复运行上述命令

## Git 配置与 SSH 密钥

首次使用 Git 提交代码前，需要配置用户信息并设置 SSH 密钥，以便通过 SSH 协议与 GitHub 通信（免输密码、token）。

1. 配置 Git 用户名和邮箱（提交记录会使用这些信息，需与 GitHub 账号邮箱一致以正确关联提交）：
   ```powershell
   git config --global user.name "你的GitHub用户名"
   git config --global user.email "你的GitHub邮箱"
   ```
   1. 仅给当前仓库配置可去掉 `--global`，配置会写入 `.git/config` 而非 `~/.gitconfig`
   2. 查看当前配置：`git config --list`
2. 生成 SSH 密钥（推荐 Ed25519，更短更快更安全；老系统不支持时可用 RSA）：
   ```powershell
   ssh-keygen -t ed25519 -C "你的GitHub邮箱"
   ```
   1. 提示输入保存路径时直接回车，使用默认路径：Windows 为 `C:\Users\你的用户名\.ssh\id_ed25519`，Linux/Mac 为 `~/.ssh/id_ed25519`
   2. 提示输入 passphrase 时可留空回车（方便免密），也可设置密码增加安全性
   3. 生成后会得到两个文件：私钥 `id_ed25519`（不可泄露）和公钥 `id_ed25519.pub`
3. 启动 ssh-agent 并将私钥加入管理器，避免每次连接重复输入密码：
   1. Windows（需以管理员身份运行 PowerShell，因为 ssh-agent 是服务）：
      ```powershell
      Get-Service ssh-agent | Set-Service -StartupType Automatic
      Start-Service ssh-agent
      ssh-add $env:USERPROFILE\.ssh\id_ed25519
      ```
   2. Linux/Mac：
      ```bash
      eval "$(ssh-agent -s)"
      ssh-add ~/.ssh/id_ed25519
      ```
4. 将公钥添加到 GitHub 账号
   1. 复制公钥内容：Windows 运行 `Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub | Set-Clipboard`；Linux/Mac 运行 `cat ~/.ssh/id_ed25519.pub` 后手动复制
   2. 打开 GitHub → 右上角头像 → Settings → SSH and GPG keys → New SSH key
   3. Title 填一个便于区分的名称（如 "Windows 笔记本"），Key 粘贴公钥内容，保存
5. 测试 SSH 连接，首次连接会提示是否信任主机指纹，输入 `yes`：
   ```powershell
   ssh -T git@github.com
   ```
   成功会返回：`Hi 你的用户名! You've successfully authenticated, but GitHub does not provide shell access.`
6. 将仓库远程地址切换为 SSH（本仓库已默认 SSH，可跳过；若是从 HTTPS 克隆的需要切换）：
   ```powershell
   git remote set-url origin git@github.com:CrescentVelvet/crescentvelvet.github.io.git
   ```
   查看当前远程地址确认已切换：`git remote -v`

## 错误记录
- 在GitHub Pages上部署的静态网页没有后端服务器，无法直接保存数据，需要保存在浏览器的localStorage中，在Console面板查看报错信息
- 在localhost或127.0.0.1上部署的本地网页，会遇到浏览器的CORS限制，无法通过URL和API调用大模型
- 浏览器中的JavaScript受到严格的安全限制，不允许直接向不同源的网站发起请求并获取数据，只能在本地运行脚本实现爬虫功能
- 本地运行Python脚本需要创建虚拟环境，安装依赖包，/Users/velvet/Documents/code/crescentvelvet.github.i
o/.venv/bin/python -m pip install requests，运行脚本，/Users/velvet/Documents/code/crescentvelvet.github.io/.venv/bin/python ./scipt/scrape_papers.py
