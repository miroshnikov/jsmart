# Modifiers #

Variable modifiers can be applied to variables, functions or strings. To apply a modifier, specify the value followed by a `|` (pipe) and the modifier name. A modifier may accept additional parameters that affect its behavior. These parameters follow the modifier name and are separated by a `:` (colon). Also, all javascript functions can be used as modifiers implicitly and modifiers can be combined.
```
{$foo = 'bar'}

{$foo|upper}
{$foo|upper|replace:'B':'G'}
{'foobar'|upper}

{javascript}
   hello = function(to) {
      return 'Hello '+to+'!';
   }
{/javascript}

{hello('world')|upper}
```
```
BAR 
GAR 
FOOBAR 
HELLO WORLD!
```