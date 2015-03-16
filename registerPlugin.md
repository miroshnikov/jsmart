# jSmart.prototype.registerPlugin() #

```
   void jSmart.prototype.registerPlugin( type, 
                                         name, 
                                         callback)
```

This method registers functions or methods defined in your script as plugin. It uses the following parameters:

  * _type_ defines the type of the plugin. Valid values are "**function**", "**block**" or "**modifier**"
  * _name_ defines the name of the plugin.
  * _callback_ defines the JavaScript callback function

See [Extending jSmart With Plugins](CreatePlugin.md) for examples