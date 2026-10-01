This is the git repo for Toby Smith's <toby@tismith.id.au> blog site.

[![Jekyll CI](https://github.com/tismith/tismith.github.io/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/tismith/tismith.github.io/actions/workflows/ci.yml)

GitHub Actions installs the dependencies from `Gemfile.lock`, builds the site in
production mode, and checks that a homepage was generated. A Chromium smoke test
then verifies the homepage at desktop and mobile sizes: visible post content,
loaded stylesheets, applied typography, and no JavaScript errors. Screenshots are
saved as the homepage-screenshots Actions artifact for seven days. External fonts,
analytics and Disqus requests are blocked to keep the test deterministic. It runs on pull
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

## Publishing

Set Settings > Pages > Build and deployment > Source to **GitHub Actions**.
This replaces independent branch publishing with this workflow's deployment.

After a successful build and browser test, CI packages the same `_site/` directory
as a Pages artifact. The deployment job requires the build job to succeed and
only runs on `master` pushes or manual runs on `master`. Pull requests run the
tests and artifact packaging but never deploy. A failed build or rendering test
leaves the previously deployed site in place.

Keep the existing custom domain configured in Pages settings. Successful CI alone
does not gate the old branch publisher: switching the Source setting is required.
