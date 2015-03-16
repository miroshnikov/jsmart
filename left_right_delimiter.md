# jSmart.prototype.left\_delimiter / jSmart.prototype.right\_delimiter #

You can change default delimiters ` { and } ` assigning **jSmart.prototype.left\_delimiter** and **jSmart.prototype.right\_delimiter**

```
<script>

   jSmart.prototype.left_delimiter = '<!--{';
   jSmart.prototype.right_delimiter = '}-->';

   var tpl = new jSmart('{$foo}:<!--{$foo}-->');

   tpl.fetch({foo:'bar'});  //will return '{$foo}:bar'

</script>
```

see also [Escaping Smarty Parsing in PHP Smarty documentation](http://www.smarty.net/docs/en/language.escaping.tpl) and [jSmart.prototype.auto\_literal](auto_literal.md)