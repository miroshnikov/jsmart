# registerFilter #

```
registerFilter(type,callback)
```
Register filters to operate on a templates.
  * `type`      valid values are **'pre'**, **'variable'** and **'post'**
  * `callback`  JavaScript? callback function

> ## 'pre' filters ##
Applied to the template source before it gets compiled. They can be used to e.g. remove unwanted comments.
Only global (prototype.registerFilter) 'pre' filters can be registered.

```
jSmart.prototype.registerFilter('pre', function(s){ //only global 'pre' filters allowed
   return s.replace(/<!--.*-->/g,'');
});
```

> ## 'variable' filters ##
Applied to every variable, function, etc. in the template, unless a the `nofilter` flag is provided. Both global and local 'variable' filters can be registered.
```
jSmart.prototype.registerFilter('variable', function(s){   //global, for every instance of jSmart
   return s.toUpperCase();
});

var t = new jSmart(...);
t.registerFilter('variable',function(s){  //for this instance only, applied AFTER all global filters	
   return s.replace(/BAR/,'BUH');
}); 
```
```
{$foo = 'bar'}
{$foo}
{$foo nofilter}
```
```
BUH
bar
```

> ## 'post' filters ##
Applied to the compiled output of the template. Both global and local 'post' filters can be registered.
```
jSmart.prototype.registerFilter('post', function(s){ //global, for every instance of jSmart
   return s + '<p>Powered by jSmart</p>'
});

var t = new jSmart(...);
t.registerFilter('post', function(s){  //for this instance only, applied AFTER all global filters
   return s + 'jSmart is the best!'
});
```