# |count #

Count all elements in an array or own properties in an object.

| **Parameter Position** | **Required** | **Default** | **Description** |
|:-----------------------|:-------------|:------------|:----------------|
|1 |No|false|If this parameter is set to true, |count will recursively count all the elements of a multidimensional array/object.|

```
{$a = ['a','b','c','d']}
{$a|count}               //== 4

{$person = [name=>[first=>'John',last=>'Doe'], age=>36]}
{$person|count}          //== 2
{$person|count:1}        //== 4
```