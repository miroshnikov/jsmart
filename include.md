# {include} #

{include} tags are used for including other templates in the current template. Any variables available in the current template are also available within the included template.

  * The value of the file attribute is passed to [jSmart.prototype.getTemplate()](getTemplate.md) method to get text of included template.

  * Setting the optional assign attribute specifies the template variable that the output of {include} is assigned to, instead of being displayed. Similar to {assign}.

  * Variables can be passed to included templates as attributes. Any variables explicitly passed to an included template are only available within the scope of the included file. Attribute variables override current template variables, in the case when they are named the same.

  * You can use all variables from the including template inside the included template. But changes to variables or new created variables inside the included template have local scope and are not visible inside the including template after the {include} statement.


| **Attribute Name** | **Required** | **Default** | **Description** |
|:-------------------|:-------------|:------------|:----------------|
|file|Yes|n/a|The name of the template to include|
|assign|No|n/a|The name of the variable that the output of include will be assigned to|

|nocache|Disables caching of this subtemplate|
|:------|:-----------------------------------|


```
<script id="included_tpl" type="text/x-jsmart-tmpl">
   Hello from included!
</script>

<script id="main_tpl" type="text/x-jsmart-tmpl">
   This template includes another template
   {include file='included_tpl'}
</script>
```

```
jSmart.prototype.getTemplate = function(name) {
   return document.getElementById(name).innerHTML;
}

var t = new jSmart( document.getElementById('main_tpl').innerHTML );
var res = t.fetch();
```

Output:
```
  This template includes another template
  Hello from included!
```

see also [{include} in PHP Smarty documentation](http://www.smarty.net/docs/en/language.function.include.tpl)