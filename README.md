# ![Logo](https://raw.githubusercontent.com/miroshnikov/jsmart/master/jsmartlogo.gif) Smarty for JavaScript Templates

jSmart is a port of the Smarty Template Engine to Javascript, a JavaScript template library that supports the template [syntax](https://github.com/miroshnikov/jsmart/blob/wiki/syntax.md) and all the features (functions, variable modifiers, etc.) of the well-known PHP template engine [Smarty] (http://www.smarty.net). 

jSmart is written entirely in JavaScript, does not have any DOM/DHTML/browser or third-party JavaScript library dependencies and can be run in a web browser as well as Node.js.

jSmart supports plugin architecture, you can [extend it with custom plugins](https://github.com/miroshnikov/jsmart/blob/wiki/CreatePlugin.md): functions, blocks and variable modifiers, [templates inclusion](https://github.com/miroshnikov/jsmart/blob/wiki/IncludeTemplates.md), [templates inheritance and overriding](https://github.com/miroshnikov/jsmart/blob/wiki/Template_inheritance.md), [caching](https://github.com/miroshnikov/jsmart/blob/wiki/caching.md), [escape HTML](https://github.com/miroshnikov/jsmart/blob/wiki/escape_html.md).

jSmart has some limited support of the PHP syntax and allows you to [use the same Smarty templates on both server and client side](https://github.com/miroshnikov/jsmart/blob/wiki/Smarty_template_in_javascript.md), for both PHP and Javascript.

See the overview of the basic syntax of jSmart templates [here](https://github.com/miroshnikov/jsmart/blob/wiki/syntax.md)

[**Demo page**](https://jsfiddle.net/miroshnikov/6tfz9p3z/1/) play with it at JsFiddle

[**Discussion board**](http://groups.google.com/group/jsmartdiscussion) feel free to ask questions, share your ideas, etc.

##Usage

* Browser
```html
<script type="text/javascript" src="smart.min.js"></script>
```
```javascript
<script id="tpl" type="text/x-smarty-tmpl">
   Hello {$who}!
</script>

<script>
   var tplText = document.getElementById('tpl').innerHTML;
   var compiled = new jSmart( tplText );
   var res = compiled.fetch( { who:'world' } );  //res = Hello world!
</script>
```

* Node.js
```
npm install smarty.js
```
```javascript
var Smarty = require('smarty.js');
var fs = require('fs');

Smarty.prototype.getTemplate = function(name) {
    return fs.readFileSync('./templates/'+name, {encoding: 'utf-8'});
}

var tplText = fs.readFileSync('./templates/main.tpl', {encoding: 'utf-8'});
var compiled = new Smarty(tplText);
var res = compiled1.fetch({...});
```

* Require.js
```javascript
    require(['smart'], function(Smarty){
        var compiled = new Smarty("Hello {$who}!");
	var res = compiled.fetch({who:'world'});
    });
```

* Bower
```
bower install smarty
```

* The template's text is compiled in the constructor, so it's fast to call ```fetch()``` with different assigned variables many times.
```javascript
   var compiled = new jSmart( '{$greeting}, {$name}!' );
   compiled.fetch( {greeting:'Hello', name:'John'} ); //Hello, John!
   compiled.fetch( {greeting:'Hi', name:'Jane'} );    //Hi, Jane!
```
