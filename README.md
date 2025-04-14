# GitHub Pages

## 云端运行

1. 建立GitHub账户
1. Fork [本仓库](https://github.com/academicpages/academicpages.github.io) 
1. 在设置中将本仓库重命名为 "crescentvelvet.github.io", 这将成为你的个人主页的URL.
1. 修改网站设置_config.yaml，页面设置_data\navigation.yml
1. 在_pages\about.md中撰写Markdown页面内容
1. 在浏览器中打开[crescentvelvet.github.io](crescentvelvet.github.io)即可查看网页

## 本地运行

1. Ubuntu本地下载本仓库
1. 安装ruby-dev, bundler, nodejs: `sudo apt install ruby-dev ruby-bundler nodejs`
1. 运行 `bundle clean` 来清理目录(无需运行`--force`)
1. 运行 `bundle install`来安装Ruby依赖包，如果报错，删除Gemfile.lock
1. 运行 `bundle exec jekyll liveserve`来生成HTML，在浏览器中打开[localhost:4000](localhost:4000)即可查看网页