# {fetch} #

{fetch} is used to retrieve files from the local file system, http, or ftp and display the contents.

The value of the file attribute is passed to [jSmart.prototype.getFile()](getFile.md) method to get contents of included template. It is up to jSmart user to override this method and provide file's text.

| **Attribute Name** | **Required** | **Default** | **Description** |
|:-------------------|:-------------|:------------|:----------------|
|file|Yes|n/a|The file, http or ftp site to fetch|
|assign|No|n/a|The template variable the output will be assigned to|

see also [{fetch} in PHP Smarty documentation](http://www.smarty.net/docs/en/language.function.fetch.tpl)