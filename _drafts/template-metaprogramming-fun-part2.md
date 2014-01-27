---
layout: post
title:  "Fun with C++ template metaprogramming, part II"
tags: c++ 
---

In [part I][part I] we discussed some basic constructs that could be built using C++ template metaprogramming. 

This time, we're going to build up to doing more complicated things - building lists and operating on them.

How can we build a list in a C++ template? I decided to borrow a common idea from Lisp, a [cons list](http://wikipedia.org/wiki/Cons)

The idea is to essentially build a recursive structure so that each element of the list contains two values - the value at that point in the list, and the remaining list. Each list node holds a `head` and a `tail`, (or in Lisp jargon, `car` and `cdr`). In pseudo-code:

```
list a (list b (list c (list d ...)))
```

But then the question arises of how to terminate the list. The best way to do this is with some terminal marker or sentinel to indicate the last element, or the empty list. In Lisp, this could be `nil`, or in Haskell a special constructor for the empty list `[]`. Again, in pseudo code, this is something like:

```
list a (list b (list c (list d (emptylist))))
```

Then to transate this to a C++ template, we can do the following:

{% highlight cpp linenos %}
// list.hpp
struct EmptyList {};

template< int a, typename L > struct LIST {
	static const int HEAD = a;
	typedef L TAIL;
};

typedef LIST<'a', LIST<'b', LIST<'c', LIST<'d', EmptyList> > > > myList;
{% endhighlight %}

So here we have a _type_ that contains a list of `int`. When we build the list, `myList`, we're building a type that _represents_ the list `[a, b, c, d]`. Not a runtime series of `structs`, but a type that we can operate on at compile. For example, pulling the `HEAD` of the list out can be achieved with:

{% highlight cpp linenos %}
#include <iostream>
#include "list.hpp"
int main(int argc, char **argv) {
	std::cout << "head = " << myList::HEAD << std::endl;
}
{% endhighlight %}

Remember in [part I][part I], we built _functions_ out of templates whose input were types. Now that we have a list in a type, we can write functions that operate on it, at compile.

To run a function over the list, say to calculate the sum:
{% highlight cpp linenos %}
template< class L>
struct SUM {
        static const int RESULT = 0;
}; 

//include all the template parameters that are used here for 
//a template specialisation
template< int a, class TAIL>
struct SUM< LIST< a, TAIL> > { 
        static const int RESULT =  a + SUM<TAIL>::RESULT;
};

//And you can pull the sum out with SUM< myList >::RESULT
{% endhighlight %}

Note again how I've used the pattern matching in template specialisation to define the different implementations for the recursive case and the base case in the `SUM` definitions.

For something more interesting, how about map-reduce!
{% highlight cpp linenos %}
// map reduce over lists
template< class L, template <int> class F , template <int, int> class R, int BASE>
struct MAP_REDUCE {
    static const int RESULT = BASE;
};

template< int a, class TAIL, template <int> class F, template <int, int> class R , int BASE>
struct MAP_REDUCE< LIST< a, TAIL>, F , R, BASE> {
    static const int RESULT = R< F< a >::VALUE, MAP_REDUCE< TAIL, F, R, BASE >::RESULT >::VALUE;
};
{% endhighlight %}

Here, `MAP_REDUCE` is a function (_template_) that takes a `LIST`, a unary function `F` (again, a template) to map over the list and a binary function `R` (also a template) to reduce the list to a single value (e.g. addition or minimum).

There are toy examples showing map reduce in action (such as summing the squares of a list, finding the minimum) in the git repository at [tmp-play].

In the next section, I'll be talking about more advanced operations, building up to what I originally set out to do - sort a list at compile time!

[tmp-play]: {{ site.author.github }}/tmp-play
[part I]: {% post_url 2014-01-24-template-metaprogramming-fun %}
