# {capture} #

{capture} is used to collect the output of the template between the tags into a variable instead of displaying it. Any content between {capture name='foo'} and {/capture} is collected into the variable specified in the name attribute.

The captured content can be used in the template from the variable **$smarty.capture.foo** where 'foo' is the value passed in the name attribute. If you do not supply the name attribute, then 'default' will be used as the name ie **$smarty.capture.default**.

{capture}'s can be nested.

| **Attribute Name** | **Required** | **Default** | **Description** |
|:-------------------|:-------------|:------------|:----------------|
| name             | Yes        | n/a       | The name of the captured block |
| assign           | No         | n/a       | The variable name where to assign the captured output to |
| append           | No         | n/a       | The name of an array variable where to append the captured output to |

```
{capture name='testCapture1'}
this will be captured
{for $i=1 to 10}
   {$i}
{/for}
{/capture}

[{$smarty.capture.testCapture1}]
```

Output:
```
[this will be captured
   1
   2
   3
   4
   5
   6
   7
   8
   9
   10
]
```

see also [{capture} in PHP Smarty documentation](http://www.smarty.net/docs/en/language.function.capture.tpl)