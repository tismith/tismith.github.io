---
layout: post
title:  "Blogging with Jekyll"
tags: jekyll
---

In [my first post]({% post_url 2014-01-23-first %}) I mentioned that I've used [Jekyll](http://jekyllrb.com) to create this blog.

This has been relatively straightforward, especially once I got the hang of what Jekyll provided, and what it did not. 

Most of the framework on this site has been fleshed out from [Hyde](http://hyde.getpoole.com) and from [Mike Greiling's articles at PixelCog](http://pixelcog.com/blog/2013/jekyll-from-scratch-introduction/). 

There were a couple of places I got caught up reading other people's setups and seeing how they did things that didn't necessarily work for me.

### Custom 404 pages and permalinks

I was having trouble creating the 404.html at the root of my site, as per [GitHub's notes for a custom error page](https://help.github.com/articles/custom-404-pages). Jekyll was converting my ``404.html`` source file into ``_site/404/index.html``. 

This wasn't working. In the end, I tracked it down to my use of a ``permalink`` setting of ``pretty`` in Jekyll's ``_config.yml``. 

I fixed this by changing to a custom ``permalink`` setting of ``/:categories/:year/:title.html`` which I think is nicer anyway. 

### Makefile

I'm not a ruby or web dev guy by trade, and so I knew I'd forget what the commands were to do a test build of the blog. However, I do know ``Make``. I've put the basic commands into a ``Makefile`` so they're easy to run (and I'll know where to look if I forget them).

{% highlight make %}
run:
	bundle exec jekyll serve --watch --drafts --trace

all:
	bundle exec jekyll build

install:
	bundle install

update:
	bundle update
{% endhighlight %}

### Travis integration

I wanted to use [Travis](http://travis-ci.org) for continuous integration to get notified when the blog fails to build. 

This is pretty easy, it's just a matter of linking Travis to your GitHub profile, enabling your repo and then making the following changes to your repo.

Add the following file to your site repo in a file called ``.travis.yml``:
{% highlight yaml %}
language: ruby
script: "bundle exec jekyll build"
{% endhighlight %}

This is enough to get Travis to try and build your site. However, it will likely not build. Travis will likely complain about errors (since it installs ruby gems into a custom `vendor` directory). The error I was seeing was:

```
ERROR: YOUR SITE COULD NOT BE BUILT:
------------------------------------
Post 0000-00-00-welcome-to-jekyll.markdown.erb does not have a valid date.
```

To fix this add the following line to your ``_config.yml``:
{% highlight yaml %}
exclude: [vendor]
{% endhighlight %}

Done! You can then embedded neat build notifiers around the place, like so:

[![Build Status](https://travis-ci.org/tismith/tismith.github.io.png?branch=master)](https://travis-ci.org/tismith/tismith.github.io)


