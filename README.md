=Download jSmart Latest Stable Release 2.11=

Download the compressed jSmart 2.11: https://drive.google.com/open?id=0B8l3ZqyDglIRMGVManJFNUwwUlk&authuser=0

Download the uncompressed jSmart 2.11: https://drive.google.com/open?id=0B8l3ZqyDglIRbXVzbGRsQUwxM1U&authuser=0

Download the usage example file: https://drive.google.com/open?id=0B8l3ZqyDglIRVkh0TUlHamJBV0U&authuser=0

Download the compressed file with phpjs functions]  you may need them if you use certain modifiers (e.g. date_format, string_format, escape, etc.): https://drive.google.com/open?id=0B8l3ZqyDglIReERCSHFwUXUtYU0&authuser=0

List of all available downloads: https://drive.google.com/open?id=0B8l3ZqyDglIRSXYwUURJSENjMk0&authuser=0

The files are hosted on Google Drive. To download a file to your computer from Google Drive click the button with an arrow at the top of the page._

----

=Smarty for JavaScript Templates=

jSmart is a port of the Smarty Template Engine to Javascript, a JavaScript template library that supports the template [syntax] and all the features (functions, variable modifiers, etc.) of the well-known PHP template engine [http://www.smarty.net Smarty]. 

jSmart is written entirely in JavaScript, does not have any DOM/DHTML/browser or third-party JavaScript library dependencies and can be run in a web browser as well as a standalone JavaScript interpreter or [http://www.commonjs.org CommonJS] environments like [http://nodejs.org node.js].

jSmart supports plugin architecture, you can [CreatePlugin extend it with custom plugins]: functions, blocks and variable modifiers, [IncludeTemplates templates inclusion], [Template_inheritance templates inheritance and overriding], [caching], [escape_html escape HTML].

jSmart has some limited support of the PHP syntax and allows you to [Smarty_template_in_javascript use the same Smarty templates on both server and client side], for both PHP and Javascript.

==A Quick Introduction==
 * Include jSmart library Javascript file in your header (get the current release from [http://code.google.com/p/jsmart/downloads/list the download page])
{{{
<html>
    <head>
      <script language="javascript" src="smart-2.9.min.js"></script>
    </head>
}}}

 * Create template, use [syntax PHP Smarty syntax]. Put the template's text in {{{<script>}}} with the {{{type="text/x-jsmart-tmpl"}}} so a browser will not try to parse it and mess it up.
{{{
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
}}}

 * Create JavaScript data object with variables to assign to the template
{{{
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
}}}

 * Create new object of {{{jSmart}}} class, passing the template's text as it's constructor's argument than call {{{fetch(data)}}}, where {{{data}}} is an JavaScript object with variables to assign to the template
{{{
<script>

   var tplText = document.getElementById('test_tpl').innerHTML;

   var tpl = new jSmart( tplText );

   var res = tpl.fetch( data );

   /*
    or fetch straigth from JavaScript string
   var res = document.getElementById('test_tpl').innerHTML.fetch(data);
   */

   document.write( res );

</script>
}}}

 * The result would be
{{{
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
}}}

 * The template's text is compiled in the {{{jSmart}}} constructor, so it's fast to call {{{fetch()}}} with different assigned variables many times.
{{{
   var tpl = new jSmart( '{$greeting}, {$name}!' );

   tpl.fetch( {greeting:'Hello', name:'John'} ); //returns: Hello, John!

   tpl.fetch( {greeting:'Hi', name:'Jane'} );    //returns: Hi, Jane!
}}}


<p>
<g:plusone size="medium"></g:plusone>

<wiki:gadget url="http://www.ohloh.net/p/584702/widgets/project_users_logo.xml" height="43" border="0"/>
</p>
