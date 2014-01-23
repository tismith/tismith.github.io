---
layout: post
title:  "Fun with C++ template metaprogramming, part II"
tags: c++ 
---

In [part I]({% post_url 2014-01-24-template-metaprogramming-fun %}) we discussed some basic constructs that could be built using C++ template metaprogramming. 

Template metaprogramming in C++ is neat!

It lets you write programs that you can get the compiler to execute at compile time. Here's a basic example showing how to get the compiler to calculate the greatest common divisor of two numbers:

{% highlight cpp linenos %}
#include <iostream>

template< int a, int b > struct GCD {
	static const int RESULT = GCD< b, a % b >::RESULT;
};

template< int a > struct GCD< a, 0 > {
	static const int RESULT = a;
};

int main(int argc, char **argv) {
    std::cout << "GCD (25,50) == " << GCD<25, 50>::RESULT << std::endl;
}
{% endhighlight %}

At first glance, this isn't anything too interesting, until you realise the the value "GCD<25, 60>" on line 12 is replaced with the calculated result and ends up as a "static const int" with a value of 25.

Moving on, this is a basic fibonacci generator that runs at compile time.

{% highlight cpp linenos %}
#include <iostream>

template< int i > struct FIB {
    static const int RESULT = FIB< i - 1 >::RESULT + FIB< i - 2 >::RESULT;
};

template< > struct FIB< 1 > {
    static const int RESULT = 1;
};

template< > struct FIB< 2 > {
    static const int RESULT = 1;
};

int main(int argc, char **argv) {
    std::cout << "Fib 5:" << FIB<5>::RESULT << std::endl;
}
{% endhighlight %}

If you squint, it looks like templates can be used as functions, types as function arguments and fields (or typedefs) in the templated structure as your result.

With this in mind, think of the following Haskell code snippet:

{% highlight haskell linenos %}
module Main where
fib 1 = 1
fib 2 = 1
fib n = fib (n-1) + fib (n-2)
main = putStrLn $ "Fib 5:" ++ (show $ fib 5)
{% endhighlight %}

The key to writing recursive templates like this is to use template specialisation as your base case to terminate the recursion. It's like pattern matching in Haskell to determine which function definition to use. 

Normally, you'd write the templates in a separate C++ header and then include them into the main program, so I'll do that in the following examples.

Here's a definition for an IF function in C++ templates:

{% highlight cpp linenos %}
//conditional.hpp
#ifndef _CONDITIONAL_H
#define _CONDITIONAL_H

template< bool CONDITION, class THEN, class ELSE > struct IF {};

template<class THEN, class ELSE> struct IF< false, THEN, ELSE > {
	typedef ELSE TEST;
};

template<class THEN, class ELSE> struct IF< true, THEN, ELSE > {
	typedef THEN TEST;
};

#endif
{% endhighlight %}

Here, we've built a template with two specialisations, one for the IF clause and one for the ELSE clause. We've used typedefs to pick out the supplied clauses from the template arguments to determine the result.

{% highlight cpp linenos %}
//conditional.cpp
#include <iostream>
#include "conditional.hpp"

struct A {
    static const int RESULT = 1;
};

struct B {
    static const int RESULT = 0;
};

struct A1 {
    static inline void EXEC(void) {
        std::cout << "TRUE!";
    }
};

struct B1 {
    static inline void EXEC(void) {
        std::cout << "FALSE!";
    }
};

int main(int argc, char **argv) {
    std::cout << "true = " << IF<true, A, B>::TEST::RESULT << std::endl;
    std::cout << "true = " << IF<false, A, B>::TEST::RESULT << std::endl;

    std::cout << "true = ";
    IF<true, A1, B1>::TEST::EXEC();
    std::cout << std::endl;
}
{% endhighlight %}

In the next post in this series, I'll extend these ideas into building lists with templates, and then doing interesting operations (map, reduce and sort) on them, all at compile time.

Full code for the above is available on [GitHub][tmp-play]

[tmp-play]: {{ site.author.github }}/tmp-play
