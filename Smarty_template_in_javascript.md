# How to use a Smarty template in Javascript #

Suppose you have a PHP Smarty application and you want to move some part of it on the client side, fetching data with Ajax and showing them "at run time" in client's browser.

Use Smarty [{fetch}](http://www.smarty.net/docs/en/language.function.fetch.tpl) function to get the contents of a template **without parsing** and put them on a page inside a 

&lt;script type="text/x-jsmart-tmpl"&gt;

 with unique id.
```
<script type="text/x-jsmart-tmpl" id='myTemplate'>
   {fetch file="path/to/templates/myTemplate.tpl"}
</script>
```

Now you can get the template's content through ` document.getElementById('myTemplate').innerHTML; `

```
var myTpl = new jSmart( document.getElementById('myTemplate').innerHTML );

var res = tpl.fetch( {} );

document.getElementById('result').innerHTML = res;
```