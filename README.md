This is the git repo for Toby Smith's <toby@tismith.id.au> blog site.

[![Jekyll CI](https://github.com/tismith/tismith.github.io/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/tismith/tismith.github.io/actions/workflows/ci.yml)

GitHub Actions installs the dependencies from `Gemfile.lock`, builds the site in
production mode, and checks that a homepage was generated. A Chromium smoke test checks every generated page using the site layout at desktop
and mobile sizes: Home, About, Archive, posts, pagination and the 404 page. It
checks visible content, local stylesheets, applied typography, HTTPS canonical
URLs, insecure resource URLs and JavaScript/resource errors. It also checks zoom
settings, keyboard access to the skip link and navigation, visible focus, and
axe-core WCAG 2.1 A/AA rules (including contrast). Automated checks cover the
local site; external map, analytics and comments integrations need separate
manual review. Internal links,
images, feed links and fragment targets are checked locally. Screenshots for each
page are saved as the site-screenshots Actions artifact for seven days. External
fonts, analytics and Disqus requests are blocked to keep the test deterministic.
It runs on pull requests to `master`, pushes to `master`, and manual workflow dispatches.

CI uses Ruby 3.4 (from `.ruby-version`), Jekyll 4.4 and `jekyll-paginate`,
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

## Dependency maintenance

Dependabot checks Bundler dependencies (including indirect gems) and GitHub
Actions every Monday at 06:00 Australia/Brisbane. Minor and patch updates are
grouped by ecosystem; major updates remain separate for review. All dependency
PRs run the same CI checks before they can be deployed.

The site keeps its Hyde templates and CSS in this repository. Only pagination
needs a plugin; feeds and sitemaps use the existing templates. The `github-pages`
bundle and its unused themes and plugins are no longer required for Actions
publishing. `jekyll serve` remains available through Jekyll's WEBrick dependency.
