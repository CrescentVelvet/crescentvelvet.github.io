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
3. 访问 [RubyInstaller 官方下载页面](https://rubyinstaller.org/downloads/) 下载并安装 Ruby+Devkit，安装时勾选 “Run ridk install”
4. 打开命令提示符或 PowerShell，运行 `gem install bundler` 安装 Bundler
5. 运行 `bundle install` 来安装 Ruby 依赖包
6. 如果使用 Ruby 3.4 或更高版本，`wdm` 可能无法编译。当前 Gemfile 已限制 `wdm` 只在 Ruby 3.4 以下启用，因此直接重新运行 `bundle install` 即可
7. 如果 Ruby 安装在 `D:\Program Files\Ruby34-x64` 这类带空格的目录下，`bundle exec jekyll serve` 可能会因为路径被拆分而失败。可以改用下面的命令启动：

   ```powershell
   ruby -rbundler/setup "D:/Program Files/Ruby34-x64/lib/ruby/gems/3.4.0/gems/jekyll-3.10.0/exe/jekyll" serve --host 127.0.0.1 --port 4000
   ```

8. 打开浏览器，访问 [http://127.0.0.1:4000](http://127.0.0.1:4000) 查看网页
9. 修改代码保存后，可以实时预览网页，无需重复运行上述命令
10. 如果需要停止本地服务，在 PowerShell 中查找并结束占用 4000 端口的进程：

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
