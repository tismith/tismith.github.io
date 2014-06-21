---
layout: post
title:  "Fast tab-switching in vim"
tags: vim
---

Working with a lot of different code bases means working with a lot
of different coding styles. When code uses tab characters for indenting
it makes things a lot easier - it lets the user decide how deep they would
like each indent level to be. With the following macro I can change the display
with of tab characters from the file's default (often set with a vim modeline) 
to 1 character. This helps massively with deeply nested code and fitting everything
on to one screen.

This code snippet maps the `F8` key to a function, `s:ToggleTabs()` that toggles tabs in the current vim 
buffer between being the default width and being one character wide. The `s:` makes sure the function
is local to the current script to avoid clashing with other plugins.

It sets the vim variables `tabstop`, `shiftwidth` and `softtabstop` to ensure that tabs
behave consistently in display, when shift and when in insert mode. They're set in a buffer-local context
(that's the `b:` prefix) to ensure they only affect the current buffer.

{% highlight vim linenos %}
"map <F8> to toggle small/normal tabs
noremap <F8> :call <SID>ToggleTabs()<CR>

"Toggles tab size between the default width and 1 character width
"b: buffer-local variables
"&l: buffer-local options
"see :help internal-variables
function! s:ToggleTabs  ()
	if !exists("b:tab_toggler_large")
		let b:tab_toggler_large = 1
	endif
	if b:tab_toggler_large == 0 
		let b:tab_toggler_large = 1	
		let &l:ts = b:tab_toggler_ts
		let &l:sw = b:tab_toggler_sw
		let &l:sts = b:tab_toggler_sts
	else
		"save the previous tab settings
		let b:tab_toggler_large = 0
		let b:tab_toggler_ts = &ts
		let b:tab_toggler_sw = &sw
		let b:tab_toggler_sts = &sts
		let &l:ts = 1
		let &l:sw = 1
		let &l:sts = 1
	endif
endfunction
{% endhighlight %}


