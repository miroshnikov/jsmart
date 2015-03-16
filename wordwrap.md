# |wordwrap #

Wraps a string to a column width, the default is 80. As an optional second parameter, you can specify a string of text to wrap the text to the next line, the default is a carriage return "\n". By default, wordwrap will attempt to wrap at a word boundary. If you want to cut off at the exact character length, pass the optional third parameter as TRUE.

| **Parameter Position** | **Required** | **Default** | **Description** |
|:-----------------------|:-------------|:------------|:----------------|
|1 |No|80|This determines how many columns to wrap to.|
|2 |No|\n|This is the string used to wrap words with.|
|3 |No|FALSE|This determines whether or not to wrap at a word boundary (FALSE), or at the exact character (TRUE).|

see also [wordwrap in PHP Smarty documentation](http://www.smarty.net/docs/en/language.modifier.wordwrap.tpl)