# How to include one template in another #

You can include one template in another using [{include}](include.md) and [{extends)](extends.md) tags. Although it may be useful if you want to port an existing set of Smarty templates in Javascript, you may be better off using [{function}](function.md) or [{capture}](capture.md). You may also consider creating [a custom plugin](CreatePlugin.md).

Whenever jSmart come across either of template inclusion tags it calls [jSmart.prototype.getTemplate()](getTemplate.md) method and passes it a value of tag's **file** parameter. The method must return the template's text.

The default implementation of getTemplate() throws an exception. So, it is up to a jSmart user to override this method and provide template's text.

```
<script>
   jSmart.prototype.getTemplate = function(name) {
      return document.getElementById(name).innerHTML;
   }
</script>
```

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
<script>
   var tpl = new jSmart(document.getElementById('main_tpl').innerHTML);
   var res = tpl.fetch({});
</script>
```

The result would be
```
  This template includes another template
  Hello from included!
```