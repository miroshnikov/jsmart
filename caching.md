# Caching #

Caching is used for subtemplates by default - any template loaded from [{include}](include.md) or [{extends}](extends.md) through [getTemplate](getTemplate.md) function stored in the global internal cache, unless `nocache` flag is provided.

Also you can store a parsed tree of any template to speed up subsequent loads:
```
var cache = {};

var tpl;
if ('mytpl' in cache) {
   tpl = new jSmart;     //no template text in ctor
   tpl.tree = cache['mytpl'];
}
else {
   tpl = new jSmart('...template text...');
   cache['mytpl'] = tpl.tree;    //store parse tree
}

tpl.fetch(...);
```