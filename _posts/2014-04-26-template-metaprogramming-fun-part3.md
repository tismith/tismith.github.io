---
layout: post
title:  "Fun with C++ template metaprogramming, part III"
tags: c++ 
---

In [part I][part I] and [part II][part II] we played around with different constructs inside C++ templates. Now we're ready to tackling something a bit meatier - sorting a list at compile time!

Recall from the previous sections that when working with template meta-programming that we're dealing with programs whose functions take the form of templates and values take the form of types. 

As a result, remember that that our lists are of the form:

{% highlight cpp %}
// list.hpp
struct EmptyList {};

template< int a, typename L > struct LIST {
	static const int HEAD = a;
	typedef L TAIL;
};

typedef LIST<8, LIST<2, LIST<1, LIST<7, EmptyList> > > > myList;
{% endhighlight %}

Now to sort this list, we're going to use a [merge sort][merge sort]. The variant of this that we're going to implement works as follows:

> 1. Divide the unsorted list into n sublists, each containing 1 element (a list of 1 element is considered sorted).
> 2. Repeatedly merge sublists to produce new sorted sublists until there is only 1 sublist remaining. This will be the sorted list.

To write the first part, splitting the list into smaller parts, we'll need a `PAIR` data type so we can split a list in to two parts. It's tempting to create a struct with values for this, but remember, we want to allow the data type to hold arbitrary values from meta-programming, so it needs contain types (i.e. typedefs).

{% highlight cpp %}
template <typename A, typename B> struct PAIR {
	typedef A FST;
	typedef B SND;
};
{% endhighlight %}

Now're we're able to write the first part of the mergesort algorithm, the split routine.

{% highlight cpp %}
template < class L > struct SPLIT {};

template <> struct SPLIT <EmptyList> {
	typedef PAIR<EmptyList, EmptyList> TYPE;
};

template <int a> struct SPLIT <LIST<a,EmptyList> > {
	typedef PAIR<LIST<a,EmptyList>, EmptyList> TYPE;
};

template <int a, int b, typename TAIL> 
struct SPLIT<LIST<a, LIST<b, TAIL> > > {
private:
	typedef typename SPLIT<TAIL>::TYPE _SPLIT_REC;
public:
	typedef PAIR<
		 LIST<a, typename _SPLIT_REC::FST>, 
		 LIST<b, typename _SPLIT_REC::SND>
		 > TYPE;
};
{% endhighlight %}

Note how we've used `private` typedefs to hold temporary values that are used to generate the `public` result type. 

To write the second part, we'll need to be able to merge two sorted lists together to make a single sorted list. This will require a conditional, an `IF`.

{% highlight cpp %}
// conditional.hpp
template< bool CONDITION, class THEN, class ELSE > struct IF {};

template<class THEN, class ELSE> struct IF< false, THEN, ELSE > {
	typedef ELSE TEST;
};

template<class THEN, class ELSE> struct IF< true, THEN, ELSE > {
	typedef THEN TEST;
};
{% endhighlight %}

Here, we now have a `IF` template that we can use to generate conditionals. We've defined the general template at the top, and then in two 
template specialisations we've defined the `ELSE` and `THEN` cases. To use it, we call it like so:

{% highlight cpp %}
#include "conditional.hpp"

struct A {
	static const int RESULT = 1;
};

struct B {
	static const int RESULT = 0;
};

int result = IF<true, A, B>::TEST::RESULT;
//result becomes 1
{% endhighlight %}

We can now write our `MERGE` template.

{% highlight cpp %}
//merge - take two sorted lists and return a sorted merged list -- needs an IF
template < template <int, int> class P, class L1, class L2> struct MERGE {};

template < template <int, int> class P, class L2> 
struct MERGE< P, EmptyList, L2> {
	typedef L2 TYPE;
};

template < template <int, int> class P, class L1> 
struct MERGE< P, L1, EmptyList > {
	typedef L1 TYPE;
};

template < template <int, int> class P, int A1, class TAIL1, int A2, class TAIL2> 
struct MERGE< P, LIST<A1, TAIL1>, LIST<A2, TAIL2> > {
	typedef typename IF< P < A1, A2 >::VALUE, 
		LIST< A1, typename MERGE <P, TAIL1, LIST<A2, TAIL2> >::TYPE >, 
		LIST< A2, typename MERGE <P, LIST<A2, TAIL1>, TAIL2>::TYPE > 
		>::TEST TYPE;
};
{% endhighlight %}

And finally, putting it all together, we can write a `SORT` that recurisively splits a list into smaller and smaller parts, and then merges them back together into a single sorted list.

{% highlight cpp %}
template < template <int, int> class P, class L >
struct SORT {
private:
	typedef typename SPLIT<L>::TYPE _SPLIT_LIST;
	typedef typename SORT<P, typename _SPLIT_LIST::FST>::TYPE _L1;
	typedef typename SORT<P, typename _SPLIT_LIST::SND>::TYPE _L2;
public:
	typedef typename MERGE<P,_L1,_L2>::TYPE TYPE;
};

template < template <int, int> class P > struct SORT<P, EmptyList> {
	typedef EmptyList TYPE;
};

template < template <int, int> class P, int a> 
struct SORT<P, LIST<a, EmptyList> > {
	typedef LIST<a, EmptyList> TYPE;
};
{% endhighlight %}

And there we go - we've defined a list and sorted it, all at compile time. 

Code for the examples in this post (and more!) are in the git repository at [tmp-play].

[merge sort]: http://en.wikipedia.org/wiki/Merge_sort
[tmp-play]: {{ site.author.github }}/tmp-play
[part I]: {% post_url 2014-01-24-template-metaprogramming-fun %}
[part II]: {% post_url 2014-01-27-template-metaprogramming-fun-part2 %}
