# jSmart.prototype.auto\_literal #

The Smarty delimiters (default ` { and } `) will be ignored so long as there are one or more whitespace symbols after left delimiter or one or more whitespace symbols before right delimiter. This behavior can be disabled by setting **jSmart.prototype.auto\_literal** to false.

```
<script>

   jSmart.prototype.auto_literal = false;

   var tpl = new jSmart(' { $foo } ');

   tpl.fetch({foo:'bar'});  //will return ' bar '

</script>
```

see also [Escaping Smarty Parsing in PHP Smarty documentation](http://www.smarty.net/docs/en/language.escaping.tpl)