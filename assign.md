# {assign} #

{assign} is used for assigning template variables during the execution of a template.

| **Attribute** | **Required** | **Description** |
|:--------------|:-------------|:----------------|
|var|Yes|The name of the variable being assigned|
|value|Yes|The value being assigned|

```
{assign var="name" value="Bob"} {* or *} {assign "name" "Bob"} 

The value of name is {$name}.

{assign "foo" "foo is [{'bar'|upper}]"} 
{$foo}
```

Output:
```
The value of name is Bob. 
foo is [BAR]
```