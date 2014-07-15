/*
 *  Copyright (c) 2013 PolyFloyd
 */

'use strict';

var fs     = require('fs');
var path   = require('path');
var mkdirp = require('mkdirp');

var SimpleStorage = module.exports = function(name, options, callback) {
  if (typeof options === 'function') { callback = options; }
  if (typeof options !== 'object')   { options  = {}; }
  options.name = name;

  for (var k in SimpleStorage.defaults) {
    if (typeof options[k] === 'undefined') {
      options[k] = SimpleStorage.defaults[k];
    }
  }

  mkdirp.sync(options.directory);

  this.$options = function() {
    return options;
  }

  if (callback) {
    var cb = function(err) {
      if (options.interval > 0) {
        this.$start(options.interval);
      }
      callback(err, this);
    };
    var storage = this;
    fs.exists(storage.$file(), function(exists) {
      if (exists) {
        storage.$read(cb);
      } else {
        storage.$flush(cb);
      }
    });

  } else {
    if (fs.existsSync(this.$file())) {
      this.$read();
    } else {
      this.$flush();
    }
    if (options.interval > 0) {
      this.$start(options.interval);
    }
  }
};

SimpleStorage.defaults = {
  directory: './storage',
  filemode:  6<<6 | 4<<3 | 4,
  interval:  10 * 60,
  pretty:    process.env.NODE_ENV === 'development',
  replacer:  null,
  reviver:   null,
};

SimpleStorage.prototype.$file = function() {
  return path.join(this.$options().directory, this.$options().name+'.json');
};

SimpleStorage.prototype.$flush = function(callback) {
  var space = this.$options().pretty ? '\t' : null;
  var string = JSON.stringify(this, this.$options().replacer, space);
  if (callback) {
    var storage = this;
    fs.writeFile(this.$file(), string, {
      mode: storage.$options().filemode,
    }, callback);

  } else {
    fs.writeFileSync(this.$file(), string, {
      mode: this.$options().filemode,
    });
  }
};

SimpleStorage.prototype.$read = function(callback) {
  if (callback) {
    var storage = this;
    fs.readFile(this.$file(), function(err, data) {
      if (!err) {
        var newData = JSON.parse(data, this.$options().reviver);
        for (var key in newData) {
          storage[key] = newData[key];
        }
      }
      callback(err);
    });

  } else {
    var data = JSON.parse(fs.readFileSync(this.$file()), this.$options().reviver);
    for (var key in data) {
      this[key] = data[key];
    }
  }
};

SimpleStorage.prototype.$start = function(interval) {
  if (this.$intervalID) {
    this.$stop();
  }

  var storage = this;
  var intervalID = setInterval(function() {
    storage.$flush();
  }, interval * 1000);
  this.$intervalID = function() { return intervalID; };
};

SimpleStorage.prototype.$stop = function() {
  clearInterval(this.$intervalID());
  delete this.$intervalID;
};
