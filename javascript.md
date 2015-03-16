# {javascript} #
The {javascript} tags allow JavaScript code to be embedded directly into the template.

All the variables assigned to the template are available within {javascript}. To create a new variable, add it to the **$this** object (e.g. `$this.foo = 'bar'`)

```
{$foo = 'bar'}

{javascript}
   if (foo == 'bar')
   {
      foo = 'buh';
      $this.newVar = 'new';
   }
{/javascript}

foo: {$foo}
newVar: {$newVar}
```
```
foo: buh
newVar: new
```