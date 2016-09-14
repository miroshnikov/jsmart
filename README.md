# ![Logo](https://raw.githubusercontent.com/miroshnikov/jsmart/master/jsmartlogo.gif) Smarty for JavaScript Templates

jSmart is a port of the Smarty Template Engine to Javascript, a JavaScript template library that supports the template [syntax](https://github.com/miroshnikov/jsmart/blob/wiki/syntax.md) and all the features (functions, variable modifiers, etc.) of the well-known PHP template engine [Smarty] (http://www.smarty.net). 

jSmart is written entirely in JavaScript, does not have any DOM/DHTML/browser or third-party JavaScript library dependencies and can be run in a web browser as well as a standalone JavaScript interpreter or [CommonJS](http://www.commonjs.org) environments like [node.js] (http://nodejs.org).

jSmart supports plugin architecture, you can [extend it with custom plugins](https://github.com/miroshnikov/jsmart/blob/wiki/CreatePlugin.md): functions, blocks and variable modifiers, [templates inclusion](https://github.com/miroshnikov/jsmart/blob/wiki/IncludeTemplates.md), [templates inheritance and overriding](https://github.com/miroshnikov/jsmart/blob/wiki/Template_inheritance.md), [caching](https://github.com/miroshnikov/jsmart/blob/wiki/caching.md), [escape HTML](https://github.com/miroshnikov/jsmart/blob/wiki/escape_html.md).

jSmart has some limited support of the PHP syntax and allows you to [use the same Smarty templates on both server and client side](https://github.com/miroshnikov/jsmart/blob/wiki/Smarty_template_in_javascript.md), for both PHP and Javascript.

See the overview of the basic syntax of jSmart templates [here](https://github.com/miroshnikov/jsmart/blob/wiki/syntax.md)

[**Demo page**](https://jsfiddle.net/miroshnikov/6tfz9p3z/1/) play with it at JsFiddle

[**Discussion board**](http://groups.google.com/group/jsmartdiscussion) feel free to ask questions, share your ideas, etc.

##Installation
* Browser
```html
<script type="text/javascript" src="smart.min.js"></script>
```
* Node.js
```
npm install smarty.js
```
* Require.js
```javascript
    require(['smart'], function(jSmart){
    	var compiled = new jSmart("Hello {$who}!");
	    var res = compiled.fetch({who:'world'});
	    document.write(res);
	});
```
* Bower
```
bower install smarty
```

##A Quick Introduction
Using in browser
* Create template, use ```PHP Smarty syntax```. Put the template's text in ```<script>``` with the ```type="text/x-jsmart-tmpl"``` so a browser will not try to parse it and mess it up.
```smarty
<script id="test_tpl" type="text/x-jsmart-tmpl">
 
   <h1>{$greeting}</h1>

   {foreach $books as $i => $book}
      <div style="background-color: {cycle values="cyan,yellow"};">
         [{$i+1}] {$book.title|upper} by {$book.author} 
            {if $book.price}                                
               Price: <span style="color:red">${$book.price}</span>
            {/if}                                           
      </div>
   {foreachelse}
      No books
   {/foreach}

   Total: {$book@total}

</script>
```

* Create JavaScript data object with variables to assign to the template
```javascript
<script>

    var data = {
       greeting: 'Hi, there are some JScript books you may find interesting:',
       books : [
          {
             title  : 'JavaScript: The Definitive Guide',          
             author : 'David Flanagan',                            
             price  : '31.18'
          },
          {
             title  : 'Murach JavaScript and DOM Scripting',
             author : 'Ray Harris',
          },
          {
             title  : 'Head First JavaScript',
             author : 'Michael Morrison',
             price  : '29.54'
          }
       ]      
    };

</script>
```

* Create new object of ```jSmart``` class, passing the template's text as it's constructor's argument than call ```fetch(data)```, where ```data``` is an JavaScript object with variables to assign to the template
```javascript
<script>
   var tplText = document.getElementById('test_tpl').innerHTML;
   var tpl = new jSmart( tplText );
   var res = tpl.fetch( data );

   document.write( res );
</script>
```

* The result would be
```html
<h1>Hi, there are some JScript books you may find interesting:</h1>

<div style="background-color: cyan;">
   [1] JAVASCRIPT: THE DEFINITIVE GUIDE by David Flanagan 
   <span style="color:red">$31.18</span>
</div>

<div style="background-color: yellow;">
   [2] MURACH JAVASCRIPT AND DOM SCRIPTING by Ray Harris 
</div>

<div style="background-color: cyan;">
   [3] HEAD FIRST JAVASCRIPT by Michael Morrison 
   <span style="color:red">$29.54</span>
</div>

Total: 3
```

* The template's text is compiled in the ```jSmart``` constructor, so it's fast to call ```fetch()``` with different assigned variables many times.
```javascript
   var tpl = new jSmart( '{$greeting}, {$name}!' );
   tpl.fetch( {greeting:'Hello', name:'John'} ); //returns: Hello, John!
   tpl.fetch( {greeting:'Hi', name:'Jane'} );    //returns: Hi, Jane!
```
