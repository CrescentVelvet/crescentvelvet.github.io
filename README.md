# GitHub Pages

## 云端运行

1. 修改网站设置_config.yaml，页面设置_data\navigation.yml
2. 在_pages\about.md中撰写Markdown格式的网页内容
3. 在浏览器中打开[crescentvelvet.github.io](crescentvelvet.github.io)即可查看网页

## Ubuntu本地运行

1. Ubuntu本地下载本仓库
2. 安装ruby-dev, bundler, nodejs: `sudo apt install ruby-dev ruby-bundler nodejs`
3. 运行 `bundle clean` 来清理目录(无需运行`--force`)
4. 运行 `bundle install`来安装Ruby依赖包，如果报错，删除Gemfile.lock后重新安装，`Remove-Item Gemfile.lock; bundle install
5. 运行 `bundle exec jekyll liveserve`来生成HTML
6. 打开浏览器，访问 [http://localhost:4000](http://localhost:4000) 查看网页

## Windows本地运行

1. Windows本地下载本仓库
2. 访问 [Git 官方下载页面](https://git-scm.com/downloads) 下载并安装 Git
3. 访问 [RubyInstaller 官方下载页面](https://rubyinstaller.org/downloads/) 下载并安装 Ruby+Devkit，安装时勾选 “Run ridk install”
4. 打开命令提示符或 PowerShell，运行 `gem install bundler` 安装 Bundler
5. 运行 `bundle install`来安装Ruby依赖包，如果报错，删除Gemfile.lock后重新安装，`Remove-Item Gemfile.lock; bundle install`
6. 运行 `gem install tzinfo-data`来安装宝石解决时区信息缺失
7. 运行 `bundle exec jekyll serve`来生成HTML
8. 打开浏览器，访问 [http://localhost:4000](http://localhost:4000) 查看网页
9. 修改代码保存后，可以实时预览网页，无需重复运行上述命令

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