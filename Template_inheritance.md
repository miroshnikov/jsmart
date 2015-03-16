# Template inheritance (extending) and overriding #

Template inheritance is an approach to managing templates that resembles object-oriented programming techniques.

You can inherit the contents of one template to another (like extending a class) and change blocks of content (like overriding methods of a class).

```
<script id="parent_tpl" type="text/x-jsmart-tmpl">
   <h1> Hello from {block name="hello"}parent{/block}! </h1>
   <hr>
   {block 'hello_again'}{/block}
</script>
```

```
<script id="child_tpl" type="text/x-jsmart-tmpl">
   {extends file="parent_tpl"} 

   {block name="hello"}child{/block}
</script>
```

```
<script id="grandchild_tpl" type="text/x-jsmart-tmpl">
   {extends file="child_tpl"} 

   {block name="hello"}grandchild{/block}
   {block 'hello_again'}Hello again!{/block}
</script>
```

```
jSmart.prototype.getTemplate = function(name) {
   return document.getElementById(name).innerHTML;
}

var tpl = new jSmart( document.getElementById('grandchild_tpl').innerHTML );
var res = tpl.fetch();
document.write( res );
```

Output:
```
<h1>Hello from grandchild!</h1>
<hr>
Hello again!
```

see also [Template Inheritance in PHP Smarty documentation](http://www.smarty.net/inheritance), [{extends}](extends.md),  [{block}](block.md)