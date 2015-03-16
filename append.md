# {append} #

{append} is used for creating or appending template variable arrays during the execution of a template.

| **Attribute** | **Required** | **Description** |
|:--------------|:-------------|:----------------|
|var|Yes|The name of the variable being assigned|
|value|Yes|The value being assigned|
|index|No|The index for the new array element. If not specified the value is append to the end of the array.|

```
{append var='arr' value='a'}
{append var='arr' value='b'}
{append var='arr' value='c'} 

{foreach $arr as $i => $v}
   [{$i}]:{$v}
{/foreach} 


{append 'name' 'Bob'   index='first'}
{append 'name' 'Meyer' index='last'}

The first name is {$name.first}.
The last name is {$name.last}.
```

output:
```
[0]:a 
[1]:b 
[2]:c

The first name is Bob. 
The last name is Meyer.
```