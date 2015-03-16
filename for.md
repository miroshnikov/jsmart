# {for} {forelse} #

The `{for} {forelse}` tag is used to create simple loops. The following different formarts are supported:

  * `{for $var=$start to $end}` simple loop with step size of 1.
  * `{for $var=$start to $end step $step}` loop with individual step size.

`{forelse}` is executed when the loop is not iterated.

| **Attribute** | **Required** | **Description** |
|:--------------|:-------------|:----------------|
| max | No | Limit the number of iterations |

```
{for $i=1 to 5}
   {if $i == 3}
      {continue}
   {/if}
   {$i}
{/for}

{for $i=-5 to -1}
   {$i}
{/for}

{$num=10}
{for $i=$num to 1 step -2}
   {$i}
{/for}

{$ar = ['a','b','c','d']}
{for $i=0 to $ar|count-1 max=3}
   {$ar[$i]}
{/for}

{$empty = []}
{for $i=0 to $empty|count-1}
   {$ar[$i]}
{forelse}
   array is empty
{/for}
```
```
1 2 4 5
-5 -4 -3 -2 -1
10 8 6 4 2 
a b c 
array is empty
```

see also [foreach](foreach.md), [section](section.md), [while](while.md)