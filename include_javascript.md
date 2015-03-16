# {include\_javascript} #

Loads and executes javascript code at run-time.

| **Attribute Name** | **Required** | **Default** | **Description** |
|:-------------------|:-------------|:------------|:----------------|
|file|Yes|n/a|The value of the file attribute is passed to [jSmart.prototype.getJavascript()](getJavascript.md) method to get code to execute.|
|once|No|true|whether or not to include the JavaScript code more than once if included multiple times|
|assign|No|n/a|The name of the variable that the output will be assigned to|

see also [jSmart.prototype.getJavascript](getJavascript.md)