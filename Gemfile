source "https://rubygems.org"

# Hello! This is where you manage which Jekyll version is used to run.
# When you want to use a different version, change it below, save the
# file and run `bundle install`. Run Jekyll with `bundle exec`, like so:
#
#     bundle exec jekyll serve
#
# This will help ensure the proper Jekyll version is running.
# Happy Jekylling!

gem "github-pages", group: :jekyll_plugins

# 添加 tzinfo-data 宝石
gem 'tzinfo-data', platforms: [:mingw, :mswin, :x64_mingw, :jruby]

# If you want to use Jekyll native, uncomment the line below.
# To upgrade, run `bundle update`.

# gem "jekyll"

# wdm 在 Ruby 3.x 上无法编译(已移除 API),Jekyll 通过 listen gem 在 Windows 上即可监听文件变化。
# gem "wdm", "~> 0.1.0" if Gem.win_platform? && Gem::Version.new(RUBY_VERSION) < Gem::Version.new("3.4.0")

# 以下插件已由 github-pages gem 自带并锁定兼容版本，
# 单独列出（且不锁版本）会与 github-pages 冲突，触发
# "The github-pages gem can't satisfy your Gemfile's dependencies" 警告。
# _config.yml 的 plugins: 数组照常引用即可。
group :jekyll_plugins do
  # gem "jekyll-archives"
end
