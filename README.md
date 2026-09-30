This is the git repo for Toby Smith's <toby@tismith.id.au> blog site.

[![Jekyll CI](https://github.com/tismith/tismith.github.io/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/tismith/tismith.github.io/actions/workflows/ci.yml)

GitHub Actions installs the dependencies from `Gemfile.lock`, builds the site in
production mode, and checks that a homepage was generated. It runs on pull
requests to `master`, pushes to `master`, and manual workflow dispatches.

CI temporarily uses Ruby 2.6 to match the legacy GitHub Pages 175 / Jekyll 3.6
dependency stack. Ruby 2.6 is end of life; upgrade it together with the dependencies.
In particular, Nokogiri 1.14 requires Ruby 2.7 or newer.

To run the same build locally with a compatible Ruby and Bundler:

```sh
bundle install
JEKYLL_ENV=production bundle exec jekyll build --trace
test -s _site/index.html
```
