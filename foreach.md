# {foreach},{foreachelse} #

{foreach} is used for looping over arrays of data. {foreach} has a simpler and cleaner syntax than the {section} loop, and can also loop over associative arrays.

```
{foreach $arrayvar as $itemvar}

{foreach $arrayvar as $keyvar=>$itemvar} 
```

**Smarty 2.x obsolete syntax  is also supported.
```
{foreach from=$myarray key="mykey" item="myitem"}
```**

## @key ##
> Although you can retrieve the array key with the syntax `{foreach $myArray as $myKey => $myValue}`, the key is always available as `$myValue@key` within the {foreach} loop.

## @index ##
contains the current array index, starting with zero

## @iteration ##
contains the current loop iteration and always starts at one

## @first ##
is TRUE if the current {foreach} iteration is the first one

## @last ##
is TRUE if the current {foreach} iteration is the last one

## @show ##
This property can be used after the execution of a {foreach} loop to detect if data has been displayed or not.

## @total ##
contains the number of iterations that this {foreach} will loop. This can be used inside or after the {foreach}.


---


```
{$colors = [black=>'#000', blue=>'#00F', green=>'#0F0', red=>'#F00', white=>'#FFF']}

{foreach $colors as $name=>$color}
   {if $color@first}
      <div id=colors>
   {/if}
   <span style="color:{$color}">[{$color@index}] [{$color@iteration}] {$name}</span>
   {if $color@last}
      </div>
   {/if}
{foreachelse}
   'colors' array is empty
{/foreach}

{if $color@show}
   num of colors: {$color@total}
{/if}
```
```
<div id=colors>
<span style="color:#000">[0][1] black</span>
<span style="color:#00F">[1][2] blue</span>
<span style="color:#0F0">[2][3] green</span>
<span style="color:#F00">[3][4] red</span>
<span style="color:#FFF">[4][5] white</span>
</div>
num of colors: 5
```

see also [{for}](for.md), [{section}](section.md), [{while}](while.md), [{continue}](continue.md), [{break}](break.md), [{foreach} in PHP Smarty documentation](http://www.smarty.net/docs/en/language.function.foreach.tpl)