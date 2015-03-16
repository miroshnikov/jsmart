# jSmart.prototype.getTemplate(name) #

Whenever there is [{include}](include.md) or [{extends}](extends.md) tag in a template, jSmart.prototype.getTemplate() method called and receives the tag's file parameter as an argument. The method must return the template's text.

The default implementation of getTemplate() throws an exception. So, it is up to a jSmart user to override this method and provide template's text.

```
/* browser example */
jSmart.prototype.getTemplate = function(id) {
   return document.getElementById(id).innerHTML;
}
```

```
/* CommonJS example: */
var fs = require('fs');

jSmart.prototype.getTemplate = function(name) {
   return fs.readFileSync('path/to/templates/'+name, 'utf8');
}
```