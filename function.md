# {functon} #

{function} is used to create functions within a template and call them just like a plugin function. Instead of writing a plugin that generates presentational content, keeping it in the template is often a more manageable choice. It also simplifies data traversal, such as deeply nested menus.

  * The {function} tag must have the name attribute which contains the the name of the template function. A tag with this name can be used to call the template function.
  * Default values for variables can be passed to the template function as attributes. The default values can be overwritten when the template function is being called.
  * You can use all variables from the calling template inside the template function. Changes to variables or new created variables inside the template function have local scope and are not visible inside the calling template after the template function is executed.

| **Attribute Name** | **Required** | **Default** | **Description** |
|:-------------------|:-------------|:------------|:----------------|
|name|Yes|n/a|The name of the template function|
|var ...|No|n/a|default variable value to pass local to the template function|

```
{function name="testFunc" parStr='test' parNum=777}
   this is function with params: [{$parStr}] [{$parNum}]
{/function}

{testFunc parStr='new str'}
```

Output:
```
   this is function with params: [new str] [777]
```

see also [{function} in PHP Smarty documentation](http://www.smarty.net/docs/en/language.function.function.tpl)