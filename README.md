# GitHub Pages

## 云端运行

1. 修改网站设置_config.yaml，页面设置_data\navigation.yml
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
5. 运行 `bundle install` 来安装 Ruby 依赖包
   1. 国内访问 `rubygems.org` 及 compact index 主机 `index.rubygems.org` 常超时；`gems.ruby-china.com` 镜像存在 SSL 握手失败（alert 40）问题。推荐换用 USTC 镜像，不改 Gemfile，两条配置都加（compact index 在独立的 `index.rubygems.org` 主机上，只配 `rubygems.org` 的镜像不会覆盖它）：
      ```powershell
      bundle config set --local mirror.https://rubygems.org https://mirrors.ustc.edu.cn/rubygems
      bundle config set --local mirror.https://index.rubygems.org https://mirrors.ustc.edu.cn/rubygems
      ```
   2. 若镜像仍不稳定，最可靠的方式是临时将 Gemfile 首行改为 `source "https://mirrors.ustc.edu.cn/rubygems"` 后再 `bundle install`，安装完成后改回即可（gem 已缓存在本地，后续 `bundle exec` 无需联网）
   3. 如果仍报错，删除 `Gemfile.lock` 后重新安装：`Remove-Item Gemfile.lock; bundle install`
   4. `wdm` gem（旧版 Jekyll 用于 Windows 文件监听）在 Ruby 3.x 上无法编译，报 `implicit declaration of function 'rb_thread_call_without_gvl'`，因其调用的 API 已被移除。现代 Jekyll 通过 `listen` gem 在 Windows 上即可监听文件变化，无需 `wdm`，当前 Gemfile 已将其注释掉，正常情况下不会触发编译。
6. 运行启动命令
   ```powershell
   bundle exec jekyll serve
   ```
   1. 推荐加载本地开发配置（使站内链接指向 localhost 而非生产域名）：`bundle exec jekyll serve --config _config.yml,_config.dev.yml`
   2. 如果 Ruby 安装在 `D:\Program Files\Ruby34-x64` 这类带空格的目录下，`bundle exec jekyll serve` 可能会因为路径被拆分而失败。可以改用下面的命令启动：
      ```powershell
      ruby -rbundler/setup "D:/Program Files/Ruby34-x64/lib/ruby/gems/3.4.0/gems/jekyll-3.10.0/exe/jekyll" serve --host 127.0.0.1 --port 4000
      ```
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

## 错误记录
- 在GitHub Pages上部署的静态网页没有后端服务器，无法直接保存数据，需要保存在浏览器的localStorage中，在Console面板查看报错信息
- 在localhost或127.0.0.1上部署的本地网页，会遇到浏览器的CORS限制，无法通过URL和API调用大模型
- 浏览器中的JavaScript受到严格的安全限制，不允许直接向不同源的网站发起请求并获取数据，只能在本地运行脚本实现爬虫功能
- 本地运行Python脚本需要创建虚拟环境，安装依赖包，/Users/velvet/Documents/code/crescentvelvet.github.i
o/.venv/bin/python -m pip install requests，运行脚本，/Users/velvet/Documents/code/crescentvelvet.github.io/.venv/bin/python ./scipt/scrape_papers.py
