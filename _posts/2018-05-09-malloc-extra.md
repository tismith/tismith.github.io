---
layout: post
title:  "Easily fix buffer overruns!"
tags: malloc
---

Has your project ever been bitten by hard-to-track down buffer overruns?

Have you ever wanted to be able to just ignore buffer overruns and make them a thing of the past?

Are you ok with wasting memory to work around this problem? [^1]

Well, your wish has now been answered, thanks to [malloc-extra][malloc-extra]!

This handy little shared library will allocate a trailing amount of buffer space for every allocation, ensuring that your pesky buffer overruns will just land in safely unused and reserved space.

`malloc-extra` simply uses some dynamic library magic to intercept every `malloc`, `calloc`, and `realloc` your program will call, and just request slightly more space than the original requester was chasing. From the point of view of the caller of these functions - they don't know this extra space exists, meaning that it can be a transparent fix to already compiled programs!

```MALLOC_EXTRA_DEBUG=1 MALLOC_EXTRA=100 LD_PRELOAD=./malloc-extra.so ./test```

[^1]: NB: This is a joke, obviously, while this library does do what is says on the tin, please don't use this to actually 'fix' anything in production.

[malloc-extra]: https://github.com/tismith/malloc-extra
