# {continue} #

{continue} leaves the current iteration and begins with the next iteration.
It may be inside [{foreach}](foreach.md), [{section}](section.md), [{for}](for.md) and [{while}](while.md) tags.

```
{$colors = [white=>'#FFF', black=>'#000', blue=>'#00F', green=>'#0F0', red=>'#F00']}

{foreach $colors as $color_name => $color_code}
   {if $color_name == "white"}  {* skip this iteration *}
      {continue}
   {/if}
   <span style="color:{$color_code}">{$color_name}</span>
{/foreach}
```

see also [{continue} in PHP Smarty documentation](http://www.smarty.net/docs/en/language.function.foreach.tpl#foreach.construct.continue)