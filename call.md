# {call} #

is used to call a template function defined by the [{function}](function.md) tag just like a [plugin function](CreatePlugin.md).

| **Attribute** | **Required** | **Description** |
|:--------------|:-------------|:----------------|
| name | Yes | The name of the template function |
| assign | No | The name of the variable that the output of called template function will be assigned to |

```
{function hello}
   Hello {$to}!
{/function}

{$fname = 'hello'}
{call $fname to='world'}
```
```
Hello world!
```