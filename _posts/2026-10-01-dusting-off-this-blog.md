---
layout: post
title: "Dusting off this blog"
date: 2026-10-01 16:40:00 +1000
tags: [blog, jekyll, ci, github]
---

I set this blog up in 2014. In my [post about the setup](/2014/blogging-with-jekyll.html), I wrote about Jekyll, custom permalinks, a Makefile, and getting Travis to build it.

Coming back to it twelve years later, the Markdown and templates were still pretty easy to follow. The Ruby dependencies were showing their age.

I’ve been writing again, so it seemed like a good time to tidy things up. I also wanted a bit more confidence that changing a dependency or fiddling with a template wouldn’t break the live site.

## Getting it building again

We started with GitHub Actions, updating Ruby and Bundler and getting a working lockfile committed.

There was some housekeeping along the way. The Travis configuration went, as did the reference to it on the About page. Dependabot had been complaining that it couldn’t update its own pull requests because the Bundler version was too old. Updating the lockfile sorted that out.

The Makefile is still there. The reason I gave for it in 2014 was that I’m not a Ruby or web developer and would forget the commands. I don’t think that needs revising.

## Does it actually render?

A successful Jekyll build is useful, but it doesn’t tell you much about the result.

We added a Playwright test that opens the generated site in Chromium at desktop and phone sizes. It visits the posts, the About and Archive pages, pagination, and the 404 page. It checks that there’s content, the CSS loads, and the internal links work.

It also saves screenshots from each page as a build artifact. Those are handy when a test says everything is fine but you’d still like to have a look.

The link checks found that some navigation links used extensionless URLs while the generated files ended in `.html`. Jekyll was quite happy to build that. The browser test was less impressed.

## Putting the tests in front of publishing

GitHub Pages now publishes through the Actions workflow.

The workflow builds the site, runs the tests, then uploads the tested output for deployment. Pull requests get checked without being published. A failed build or test leaves the existing site in place.

That required switching the Pages publishing source in the repository settings as well. Adding a workflow alone wouldn’t have stopped the old publishing path.

This is probably the change I care about most. Dependency updates can come through as pull requests, get tested, and be reviewed before they affect the blog.

## A few things I’d missed

We also checked keyboard navigation and contrast.

The viewport settings contained `maximum-scale=1`, which restricted zoom. That went. Dates and some syntax highlighting colours needed more contrast. Long code blocks could scroll sideways, but you couldn’t reach them with the keyboard.

There’s now a skip link, visible keyboard focus, and focusable code blocks. Links in the body text are underlined too.

The CI checks include these things now, though they’re still automated checks of the local site. The map and Disqus are external services, and those requests are blocked during testing.

## Fewer gems

Once Actions was handling the build, we could stop using the `github-pages` gem bundle.

This site keeps its Hyde templates and CSS in the repository. It generates the feed and sitemap from templates too. Pagination is the only plugin it needs.

We moved to Jekyll 4 with that plugin and regenerated the lockfile. The dependency count dropped from 98 gems to 36. Comparing the generated output with the old build showed the same published file paths, so the existing post URLs survived the upgrade.

I did this with an AI agent connected to GitHub. It inspected the files, prepared pull requests, checked Actions results, and downloaded screenshots for review. There were a few rounds of fixing things the new tests found.

It was a useful job for an agent: an existing repository, fairly small changes, and a way to check the result. Having it open the pages in a browser was particularly worthwhile.

The blog hasn’t had a redesign. It’s still Markdown, Jekyll, and much the same layout I picked in 2014. I’ve just brought the build up to date and made it harder to publish something broken.
