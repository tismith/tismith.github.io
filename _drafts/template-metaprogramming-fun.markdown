---
layout: post
title:  "Template metaprogramming fun"
---

This is a basic fibonacci generator that runs at compile time.

{% highlight cpp linenos %}
template< int i > struct FIB {
    static const int RESULT = FIB< i - 1 >::RESULT + FIB< i - 2 >::RESULT;
};

template< > struct FIB< 1 > {
    static const int RESULT = 1;
};

template< > struct FIB< 2 > {
    static const int RESULT = 1;
};
{% endhighlight %}

Available on [GitHub][tmp-play]

[tmp-play]: https://github.com/tismith/tmp-play
