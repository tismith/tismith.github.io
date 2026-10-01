This is the git repo for Toby Smith's <toby@tismith.id.au> blog site.

[![Jekyll CI](https://github.com/tismith/tismith.github.io/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/tismith/tismith.github.io/actions/workflows/ci.yml)

GitHub Actions installs the dependencies from `Gemfile.lock`, builds the site in
production mode, and checks that a homepage was generated. A Chromium smoke test
then verifies the homepage at desktop and mobile sizes: visible post content,
loaded stylesheets, applied typography, and no JavaScript errors. Screenshots are
saved as the homepage-screenshots Actions artifact for seven days. External fonts,
analytics and Disqus requests are blocked to keep the test deterministic. It runs on pull
requests to `master`, pushes to `master`, and manual workflow dispatches.

CI uses Ruby 3.4 (from `.ruby-version`), GitHub Pages 232 / Jekyll 3.10,
and the Bundler version recorded in `Gemfile.lock`. Keep the lockfile committed
so local builds and CI install the same dependency versions.

To run the same build locally with Ruby 3.4 and Bundler 2.4.22:

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
