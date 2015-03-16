# jSmart.prototype.escape\_html #

Escape HTML markup in template variables. By default is **false** (don't escape HTML).

```
jSmart.prototype.escape_html = true;  //set global for all jSmart instances

var t = new jSmart('{$bold}');

t.escape_html = true;  //... or set for this instance only, overrides jSmart.prototype.escape_html

t.fetch({bold: '<b>test</b>'});
```

Output:
```
&lt;b&gt;test&lt;/b&gt;
```