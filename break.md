# {break} #

{break} aborts the iteration.
It may be inside [{foreach}](foreach.md), [{section}](section.md), [{for}](for.md) and [{while}](while.md) tags.

```
{$colors = [black=>'#000', blue=>'#00F', green=>'#0F0', red=>'#F00', white=>'#FFF']}

{foreach $colors as $color_name => $color_code}
   {if $color_code@index == 3}    {* abort iterating - show only first 3 items *}
      {break}
   {/if}
   <span style="color:{$color_code}">{$color_name}</span>
{/foreach}
```

see also [{break} in PHP Smarty documentation](http://www.smarty.net/docs/en/language.function.foreach.tpl#foreach.construct.break)