# Syntax #

## Comments ##
```
{* this is comment *}
```

## Variables ##
```
{$foo = 'bar'}                   {* create/assign variable *}
{$foo}
{$foo|upper|replace:'B':'G'}     {* variable with modifiers *}
```

```
bar
GAR
```
see also [modifiers](modifiers.md)

## Objects and arrays ##
```
{$person = [name=>[first=>'John'],age=>36]}  {* create object *}
{$person.name.last = 'Doe'}                  {* add/set object property *}
{$person['favorite gadget'] = 'iPad'}        {* object property name can have spaces *}

I am {$person.name.first} {$person.name.last} and I like my {$person['favorite gadget']}


{$days = ['Sun','Mon','Tue']}               {* create array *}
{$days[] = 'Wed'}                           {* add to array *}

Today is {$days[3]}
```

```
I am John Doe and I like my iPad
                
Today is Wed
```

## Double-quoted strings ##
Variable names will be expanded in double-quoted strings.
```
{$bar = "value of foo is '$foo'"}
{$bar}
```
```
value of foo is 'bar'
```

If a variable contain any other character than `[0-9a-zA-Z_]`, it must be surrounded by ```backticks```.
```
{$foo = "`$person.name.first` has `$person['favorite gadget']`"} 
{$foo}
```
```
John has iPad
```

Any Smarty tag will also be expanded in double quotes.
```
{$dayNames = "{foreach $days as $dayName} {$dayName@index+1}:'{$dayName|upper}'{if !$dayName@last},{/if} {/foreach}"} 
Days of the week are: {$dayNames}
```
```
Days of the week are:  1:'SUN',  2:'MON',  3:'TUE',  4:'WED'
```

## Functions ##
```
{function 'sayHello' to=''}
   Hello {$to}!
{/function}

{sayHello to="whole `'world'|replace:w:W`"}
```
```
Hello whole World!
```

Any Javascript function can be called
```
function hello(to) { return 'Hello '+to; }

(new jSmart(...)).fetch({ 
   helloAgain: function(to){ return hello(to) + ' again'; } 
});
```
```
{hello('world')|replace:'world':'World'}
{helloAgain('world')}
```
```
Hello World
Hello world again
```
see also [function](function.md)

## Javascript objects ##
```
Person = function() {
   this.name = {
      first: 'John',
      last: 'Doe'
   };
   this.age = 36;
}

Person.prototype.getName = function(nameType) {
   return nameType=='last' ? this.name.last : this.name.first;
}

(new jSmart(...)).fetch({ 
   human: new Person()
});
```
```
{$human->getName('first')} {$human->getName('last')} of age {$human->age}
```
```
John Doe of age 36
```

## Operators ##
Operators in order of precedence, with the highest-precedence ones at the top.
| **Operator** | **Alternates** | **Syntax Example** | **Meaning** | **JavaScript Equivalent** |
|:-------------|:---------------|:-------------------|:------------|:--------------------------|
|++ --|  |`++a b--`|(pre/post)increment/decrement|`++ --`|
|! |not|`not a`|negation (unary)|`!`|
|`*` `/`|  |`a*b`|multiply, divide|`* /`|
|% |mod|`a mod b`|modulous|`%`|
|+ -|  |`a+b-c`|addition, subtraction|`+ -`|
|> |gt|`a gt b`|greater than|`>`|
|< |lt|`a lt b`|less than|`<`|
|>=|gte, ge|`a ge b`|greater than or equal|`>=`|
|<=|lte, le|`a le b`|less than or equal|`<=`|
|==|eq|`a eq b`|equals|`==`|
|!=|ne, neq|`a neq b`|not equals|`!=`|
|=== !==|  |`a === b`|check for identity|`=== !==`|
|is [not](not.md) div by|  |`a is not div by 4`|divisible by|`a % b == 0`|
|is [not](not.md) even|  |`a is not even`|[not](not.md) an even number (unary)|`a % 2 == 0`|
|is [not](not.md) even by|  |`a is not even by b`|grouping level [not](not.md) even|`(a / b) % 2 == 0`|
|is [not](not.md) odd|  |a is not odd|[not](not.md) an odd number (unary)|`a % 2 != 0`|
|is [not](not.md) odd by|  |a is not odd by b|[not](not.md) an odd grouping|`(a / b) % 2 != 0`|
|&&|and|a && b|true if both a and b are true|`&&`|
| `|``|` |or|a`|``|`b|true if either a or b is true|`|``|`|
|xor|  |a xor b|exclusive or|(a`|``|`b) && !(a&&b)|

## Condition ##
```
{if $foo == 'bar'}
   bar
{elseif $foo eq 'buh'}
   buh
{else}
   smth else
{/if}
```
see also [if](if.md)

## Iterate over arrays and objects ##
### [{foreach}](foreach.md) ###
```
{$colors = [red=>'#f00', green=>'#0f0', blue=>'#00f']}

{foreach $colors as $name => $code}
   <p style='color:{$code}'>{$code@index}: {$name}</p>
{foreachelse}
   no colors
{/foreach}
```
```
<p style='color:#f00'>0: red</p>
<p style='color:#0f0'>1: green</p>
<p style='color:#00f'>2: blue</p>
```

### [{section}](section.md) ###
```
{$colorNames = [red,green,blue]}
{$colorCodes = ['#f00','#0f0','#00f']}

{section name='color' loop=$colorNames}
   <p style='color:{$colorCodes[color]}'>{$smarty.section.color.index}: {$colorNames[color]}</p>
{sectionelse}
   no colors
{/section}
```
```
<p style='color:#f00'>0: red</p>
<p style='color:#0f0'>1: green</p>
<p style='color:#00f'>2: blue</p>
```

### [{for}](for.md) ###
```
{for $i=0 to $colorNames|count-1}
   <p style='color:{$colorCodes[$i]}'>{$i}: {$colorNames[$i]}</p>
{/for}
```
```
<p style='color:#f00'>0: red</p>
<p style='color:#0f0'>1: green</p>
<p style='color:#00f'>2: blue</p>
```

### [{while}](while.md) ###
```
{$j = $colorNames|count}
{while --$j>=0}
   <p style='color:{$colorCodes[$j]}'>{$j}: {$colorNames[$j]}</p>
{/while}
```
```
<p style='color:#00f'>2: blue</p>
<p style='color:#0f0'>1: green</p>
<p style='color:#f00'>0: red</p>
```

see also [break](break.md), [continue](continue.md)

## Escape HTML ##
```
{$foo = '<b>bar</b>'}
{setfilter escape}
{$foo}
{/setfilter}
```
```
&lt;b&gt;bar&lt;/b&gt;
```
see also [escape\_html](escape_html.md)

## Filters ##
```
{$foo = 'b a r'}
1: {$foo}

{setfilter replace:' ':'_'|upper}    {* any modifier(s) or/and function(s) *}
  2: {$foo}
  3: {$foo nofilter}
{/setfilter}
```
```
1: b a r
2: B_A_R
3: b a r
```
see also [addDefaultModifier](addDefaultModifier.md), [registerFilter](registerFilter.md)

## Template inclusion ##
main:
```
this is main,
{include incl}
```
incl:
```
this is included
```
```
this is main,
this is included
```
see also [Include Templates](IncludeTemplates.md), [include](include.md), [getTemplate](getTemplate.md)
## Template inheritance and overriding ##
parent:
```
Hello from {block hello}parent{/block}!
```
child:
```
{extends parent}
{block hello}child{/block}
```
```
Hello from child!
```
see also [Template inheritance](Template_inheritance.md), [extends](extends.md), [block](block.md), [getTemplate](getTemplate.md)

## Default delimiters ##
```
jSmart.prototype.auto_literal = false;
jSmart.prototype.left_delimiter = '<%=';
jSmart.prototype.right_delimiter = '%>';
```
```
<%= $foo='bar' %>
foo = <%= $foo %>
```
```
foo = bar
```
see also [left\_right\_delimiter](left_right_delimiter.md), [auto\_literal](auto_literal.md)