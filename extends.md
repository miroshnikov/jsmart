# {extends} #

{extends} tags are used in child templates in template inheritance for extending parent templates.
  * The {extends} tag must be on the first line of the template.
  * If a child template extends a parent template with the {extends} tag it may contain only [{block}](block.md) tags. Any other template content is **ignored**.

| **Attribute Name** | **Required** | **Default** | **Description** |
|:-------------------|:-------------|:------------|:----------------|
|file|Yes|n/a|The name of the template file which is extended|


see also [Template inheritance (extending) and overriding](Template_inheritance.md) and [{block}](block.md)