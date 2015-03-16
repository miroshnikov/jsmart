# Extending jSmart With Plugins #

It is possible to register your own custom plugins.
See [registerPlugin()](registerPlugin.md) API method.

There are several types of plugins:
  * [Function](CreatePlugin#Function_plugin.md)
  * [Block](CreatePlugin#Block_plugin.md)
  * [Modifier](CreatePlugin#Variable_Modifier_plugin.md)


---

## Function plugin ##
All attributes passed to template functions from the template are contained in the **params** object.

**data** is an object passed to [fetch()](fetch.md).

**Register plugin**
```
   jSmart.prototype.registerPlugin(
      'function', 
      'sayHello', 
      function(params, data)
         {
            var s = 'Hello ';
            if ('to' in params)
            {
               s += params['to'];
            }
            return s;
          }
      );
```

**In the template**
```
   {sayHello to='Everybody'}
```

**The result would be**
```
   Hello Everybody
```



---


## Block plugin ##
Block functions are functions of the form: {func} .. {/func}. In other words, they enclose a template block and operate on the contents of this block. Block functions take precedence over custom functions of the same name, that is, you cannot have both custom function {func} and block function {func}..{/func}.

By default your function implementation is called twice by jSmart: once for the opening tag, and once for the closing tag. (See **repeat** below on how to change this.)

Only the opening tag of the block function may have attributes. All attributes passed to template functions from the template are contained in the **params** object. The opening tag attributes are also accessible to your function when processing the closing tag.

The value of the **content** variable depends on whether your function is called for the opening or closing tag. In case of the opening tag, it will be NULL, and in case of the closing tag it will be the contents of the template block. Note that the template block will have already been processed by jSmart, so all you will receive is the template output, not the template source.

**data** is an object passed to [fetch()](fetch.md).

The parameter **repeat** is an Object with one property **value** and provides a possibility for it to control how many times the block is displayed. By default **repeat.value** is TRUE at the first call of the block-function (the opening tag) and FALSE on all subsequent calls to the block function (the block's closing tag). Each time the function implementation returns with **repeat.value** being TRUE, the contents between {func}...{/func} are evaluated and the function implementation is called again with the new block contents in the parameter **content**.

**Register plugin**
```
   jSmart.prototype.registerPlugin(
      'block', 
      'replaceStr', 
      function(params, content, data, repeat)
      {
	return content.replace(
            new RegExp(params['from'],'g'), params['to']
        );
      }
   );
```

**In the template**
```
   {replaceStr from=' ' to='_'}all whitespaces will be relaced{/replaceStr}
```

**The result would be**
```
   all_whitespaces_will_be_relaced
```

---


## Variable Modifier plugin ##
Modifiers are little functions that are applied to a variable in the template before it is displayed or used in some other context. Modifiers can be chained together.

The first parameter to the modifier plugin is the value on which the modifier is to operate. The rest of the parameters are optional, depending on what kind of operation is to be performed.

The modifier has to return the result of its processing.

**Register plugin**
```
   jSmart.prototype.registerPlugin(
      'modifier', 
      'upper', 
      function(s)
      {
         return s.toUpperCase();
      }
   );
```

**In the template**
```
   {$foo = 'bar'}
   {$foo} {$foo|upper}
```

**The result would be**
```
   bar BAR
```