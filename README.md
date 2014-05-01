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

### SimpleStorage(name \[, options\] \[, callback\])

 *  name `string`
 *  options `object`
     *  directory `string` default = './storage'
     *  filemode `number` default = 0644
     *  interval `number` default = 10 minutes
 *  callback `function(Error, SimpleStorage)`

This function constructs a new SimpleStorage object.
If an interval of 0 is specified in options, disk synchonization will not be started automatically.
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
