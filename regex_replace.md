# |regex\_replace #

Only modifiers (flags) 'i' and 'm' are supported

Backslashes should be escaped e.g. \\s

```
{$foo = bar}
{$foo|regex_replace:'/b/':'z'}   //zar
```