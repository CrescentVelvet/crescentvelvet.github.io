### Note: 请删除Gemfile.lock 

# Instructions

1. 建立GitHub账户
1. Fork [本仓库](https://github.com/academicpages/academicpages.github.io) 
1. 在设置中将本仓库重命名为 "[你的名字].github.io", 这将成为你的个人主页的URL.
1. 修改网站设置
1. Upload any files (like PDFs, .zip files, etc.) to the files/ directory. They will appear at https://[your GitHub username].github.io/files/example.pdf.  
1. Check status by going to the repository settings, in the "GitHub pages" section
1. (Optional) Use the Jupyter notebooks or python scripts in the `markdown_generator` folder to generate markdown files for publications and talks from a TSV file.

参见https://academicpages.github.io/

## 在本地运行

1. 本地下载本仓库
1. 安装ruby-dev, bundler, nodejs: `sudo apt install ruby-dev ruby-bundler nodejs`
1. 运行 `bundle clean` 来清理目录(无需运行`--force`)
1. 运行 `bundle install`来安装Ruby依赖包，如果报错，删除Gemfile.lock
1. 运行 `bundle exec jekyll liveserve`来生成HTML，在浏览器中打开`localhost:4000`即可查看个人网页