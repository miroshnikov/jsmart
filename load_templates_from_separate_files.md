# How to load templates from separate external files #

For PHP Smarty applications see [How to use Smarty template in Javascript](Smarty_template_in_javascript.md).

If your application is pure HTML and doesn't use any of the server side script languages (like PHP) or Apache Server Side Includes, there are still several ways to keep your templates in separate external files and load them dynamically.


  * Load a file from the server using Ajax
`my.tpl.html file`
```
{$greeting}, {$name}!
```

`main.html file`
```
...
<script>
   //use jQuery .get() function
   $.get(
      'path/to/templates/my.tpl.html',
      function(tplText) { 
         var t = new jSmart(tplText);
         document.write( t.fetch({greeting:'Hello',name:'world'}) ); 
      }
   );
</script>
...
```



  * Load a file into IFRAME, then get template contents by ID
`my.tpl.html file`
```
<html>
<body>

<script id="myTpl" type="text/x-jsmart-tmpl"> 
{$greeting}, {$name}!
</script>

</body>
</html>
```

`main.html file`
```
...
<iframe src='path/to/templates/my.tpl.html' style='display:none;' onload='onTplLoad(this)'></iframe>
<script>
   function onTplLoad(iframe) {
      var t = new jSmart( $(iframe).contents().find('#myTpl').html() );
      document.write( t.fetch({greeting:'Hello',name:'world'}) );
   }
</script>
...
```