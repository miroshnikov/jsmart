# {block} #

The {block} contents of a child template will replace the contents of {block}-s with the same name in the parent template(s).

Optionally {block} areas of child and parent templates can be merged into each other. You can append or prepend the parent {block} content by using the append or prepend option flag with the childs {block} definition. With the {$smarty.block.parent} the {block} content of the parent template can be inserted at any location of the child {block} content. {$smarty.block.child} inserts the {block} content of the child template at any location of the parent {block}.

{blocks}'s can be nested.

| **Attribute Name** | **Required** | **Description** |
|:-------------------|:-------------|:----------------|
|name|Yes|The name of the template block|

Option Flags (in child templates only):
| **Name** | **Description** |
|:---------|:----------------|
|append|The {block} content will be be appended to the content of the parent template {block}|
|prepend|The {block} content will be prepended to the content of the parent template {block}|
|hide|Ignore the block content if no child block of same name is existing.|

parent\_tpl:
```
<h1>{block 'title1'}Title - {/block}</h1>
<h2>{block 'title2'} - is the title{/block}</h2>
<h3>{block 'title3'}Title is "{$smarty.block.child}" {/block}</h3>
<h4>{block 'title4'}Title{/block}</h4>
{block 'ignore_me' hide}no child block for this{/block}
```

child\_tpl:
```
{extends file="parent_tpl"} 

{block 'title1' append}child page{/block}
{block 'title2' prepend}Child page{/block}
{block 'title3'}child page{/block}
{block 'title4'}The "{$smarty.block.parent}" is "child page"{/block}
```

output:
```
<h1>Title - child page</h1>
<h2>Child page - is the title</h2>
<h3>Title is "child page"</h3>
<h4>The "Title" is "child page"</h4>
```

see also [Template inheritance (extending) and overriding](Template_inheritance.md), [{extends}](extends.md), [jSmart.prototype.getTemplate](getTemplate.md)