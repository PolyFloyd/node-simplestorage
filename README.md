SimpleStorage for Node.js
==========================

## Install

Install with NPM: `npm install simplestorage`.


## Usage

The package exports a single type which must be used to intialize the storage.
The simplest way to make a disk backed object is like this:

```js
var SimpleStorage = require('simplestorage');

var importantThings = new SimpleStorage('keepThis');

importantThings.canWeFixIt = 'Yes we can!';
importantThings.groceries = [
  'Butter',
  'Cheese',
  'Eggs'
];
```


## Documentation

### SimpleStorage.defaults

An object containing the default options used when constructing a new instance.

 *  directory `string` = './storage'

 *  filemode `number` = 0644

 *  interval `number` = 10 minutes

    If an interval of 0 is specified, disk synchonization will not be started automatically.
    The interval is specified in seconds.

 *  pretty `boolean` = `NODE_ENV == 'development'`

    Causes the contents of the associated file to be indented by a tab when set to true.

 *  replacer `function(k, v)` = null

    Used by `JSON.stringify()` to serialize individual properties ([MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_native_JSON#The_replacer_parameter)).

 *  reviver `function(k, v)` = null

    Used by `JSON.parse()` to deserialize individual properties ([MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#Example.3A_Using_the_reviver_parameter)).

### SimpleStorage(name \[, options\] \[, callback\])

 *  name `string`

 *  options `object`

    Please refer to [SimpleStorage.defaults](#simplestoragedefaults) for a list of all available options.

 *  callback `function(Error, SimpleStorage)`

This function constructs a new SimpleStorage object.
Any property added to an instance of this object will be flushed to disk.
If no callback is specified, this function will run synchronous.

### SimpleStorage.$flush(\[callback\])

 *  callback `function(Error)`

Flushes the object to disk, replacing any existing file.
If no callback is specified, this function will run synchronous.

### SimpleStorage.$read(\[callback\])

 *  callback `function(Error)`

Reads the associated JSON file into memory, replacing all conflicting properties with the ones read.
If no callback is specified, this function will run synchronous.

### SimpleStorage.$start(interval)

 *  interval `number`

Starts disk synchronization, first stopping any existing synchronizations.
`interval` is the time in seconds between disk flushes.

### SimpleStorage.$stop()

Stops disk synchronization.
