# GitHub Pages

## 云端运行

1. 建立GitHub账户
2. Fork [本仓库](https://github.com/academicpages/academicpages.github.io) 
3. 在设置中将本仓库重命名为 "crescentvelvet.github.io", 这将成为你的个人主页的URL.
4. 修改网站设置_config.yaml，页面设置_data\navigation.yml
5. 在_pages\about.md中撰写Markdown页面内容
6. 在浏览器中打开[crescentvelvet.github.io](crescentvelvet.github.io)即可查看网页

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
9. 修改代码可以实时预览网页