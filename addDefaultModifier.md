# addDefaultModifier(modifiers) #

Add a modifier to implicitly apply to every variable in a template unless a variable has the `nofilter` flag.

`modifiers` is a string or array of strings

```
jSmart.prototype.addDefaultModifier('escape');  //global modifier for every instance of jSmart

var t = new jSmart(...);

t.addDefaultModifier(["regex_replace:'/bar/':'buh'", 'upper']);
            //modifiers for this instance only (applied AFTER global modifiers)

t.fetch(...);
```

```
{$foo = '<b>bar</b>'}
{$foo}
{$foo nofilter}
```
```
&LT;B&GT;BUH&LT;/B&GT;
<b>bar</b>
```

see also [registerFilter](registerFilter.md)