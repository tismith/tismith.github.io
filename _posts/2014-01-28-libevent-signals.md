---
layout: post
title:  "Libevent, signals and children"
tags: libevent c linux
---

[Libevent][libevent] is a library to allow for callbacks to be run when specific events occur on file descriptors, after a timeout has occured, when a POSIX-style signal is raised, or at user defined points. I've been using it to write a single threaded program to start and control network processes. It works well, but I ran into a problem when combining libevent with `fork`, `exec` and children processes.

When you trap a POSIX-style signal, libevent documentation [mentions that](http://www.wangafu.net/~nickm/libevent-book/Ref4_event.html):

> Note that signal callbacks are run in the event loop after the signal occurs,
> so it is safe for them to call functions that you are not supposed to call 
> from a regular POSIX signal handler.

This is excellent! This means we can call `printf`, `malloc` and all the other asynchronous-unsafe functions that you can't call from an ordinary signal handler. 

However, the caveat I discovered, arose in libevent's implementation of how this is achieved. 

My program would start other programs after timeouts, catch their SIGCHILD and potentially restart them. These child programs are arbitrary executables that other parts of our code base could configure and some of these children would need to catch signals of their own. I was finding that any signals that I installed handlers for (using libevent) in the parent program were being ignored in my children process.

After some head scratching, I looked at my parent process's signal statuses at `/proc/<pid>/status`. 

```
... 
SigQ:   0/479
SigPnd: 0000000000000000
ShdPnd: 0000000000000000
SigBlk: 0000000000000000
SigIgn: 0000000000000000
SigCgt: 0000000380010a01
...
```

And then I looked at one of the child process's signal status:

```
... 
SigQ:   0/479
SigPnd: 0000000000000000
ShdPnd: 0000000000000000
SigBlk: 0000000380010a01
SigIgn: 0000000000000000
SigCgt: 0000000000000000
...
```

All the signals that I was catching in my parent process were being blocked in my child process! No wonder they were ignoring signals!

So, what was going on? Well, the way libevent manages to run it's signal callbacks in the main event loop, sometime after the actual signal was caught, is by not running the callback _directly_ from the signal handler. All the signal handler needs to do is to mark the callback event as active, and then exit. Then when the main libevent loop next runs it will see that the signal callback is active and execute it from the main context, not from an asynchronous signal handler context. 

When the main libevent loop is running a callback, it uses `sigprocmask(SIG_BLOCK...` to mask out the signals so the asynchronous handlers can't interrupt the callbacks. To start my children, I was calling `fork` and `exec` from libevent callbacks and so my child processes were inheriting their parent's block mask (signal block masks are inherited across a `fork` and aren't cleared by an `exec`). And so my child processes had their block masks set to be the mask of what was being caught by my parent process.

To fix this, I added the following code after my call to `fork` but before my `exec`:
{% highlight c %}
/* This needs signal.h */

/* unblock signals */
sigset_t sigs;
sigfillset(&sigs);
sigprocmask(SIG_UNBLOCK, &sigs, 0);
{% endhighlight %}

This could also be run from a child atfork handler registered with `pthread_atfork`.

This ensured that my child processes started life with a clean signal block mask, letting my arbitrary processes continue to catch and handle signals without needed modification.

[libevent]: http://libevent.org
