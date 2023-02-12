# GitHub Pages

1. 建立GitHub账户
1. Fork [本仓库](https://github.com/academicpages/academicpages.github.io) 
1. 在设置中将本仓库重命名为 "crescentvelvet.github.io", 这将成为你的个人主页的URL.
1. 修改网站设置_config.yaml
1. 把PDF文件放进files文件夹中，就会出现在https://crescentvelvet.github.io/files/example.pdf
参见https://academicpages.github.io/

## 本地运行

1. Windows本地下载本仓库
1. 安装ruby-dev, bundler, nodejs: `sudo apt install ruby-dev ruby-bundler nodejs`
1. 运行 `bundle clean` 来清理目录(无需运行`--force`)
1. 运行 `bundle install`来安装Ruby依赖包，如果报错，删除Gemfile.lock
1. 运行 `bundle exec jekyll liveserve`来生成HTML，在浏览器中打开`localhost:4000`即可查看个人网页