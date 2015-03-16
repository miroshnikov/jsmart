# |date\_format #

> <font color='darkred'>
</li></ul><blockquote>This modifier uses Javascript port of PHP function        [strftime()](http://docs.php.net/manual/en/function.strftime.php).
> You can find one at [phpjs.org](http://phpjs.org/)
> </font></blockquote>

This formats a date and time into the given strftime() format. Dates can be passed to Smarty as unix timestamps, mysql timestamps or any string made up of month day year, parsable by php's strtotime().<br>
<br>
<table><thead><th> <b>Parameter Position</b> </th><th> <b>Required</b> </th><th> <b>Default</b> </th><th> <b>Description</b> </th></thead><tbody>
|:--------------------------|:----------------|:---------------|:-------------------|
|1 |No|%b %e, %Y|This is the format for the outputted date.|
|2 |No|n/a|This is the default date if the input is empty.|

see also [date\_format in PHP Smarty documentation](http://www.smarty.net/docs/en/language.modifier.date.format.tpl)