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

  for (var k in SimpleStorage.defaults) {
    if (typeof options[k] === 'undefined') {
      options[k] = SimpleStorage.defaults[k];
    }
  }

  mkdirp.sync(options.directory);

  this.$file = function() {
    return path.join(options.directory, name+'.json');
  };
  this.$filemode = function() {
    return options.filemode;
  };

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
};

SimpleStorage.prototype.$flush = function(callback) {
  if (callback) {
    var storage = this;
    fs.writeFile(this.$file(), JSON.stringify(this), {
      mode: storage.$filemode()
    }, callback);

  } else {
    fs.writeFileSync(this.$file(), JSON.stringify(this), {
      mode: this.$filemode()
    });
  }
};

SimpleStorage.prototype.$read = function(callback) {
  if (callback) {
    var storage = this;
    fs.readFile(this.$file(), function(err, data) {
      if (!err) {
        var newData = JSON.parse(data);
        for (var key in newData) {
          storage[key] = newData[key];
        }
      }
      callback(err);
    });

  } else {
    var data = JSON.parse(fs.readFileSync(this.$file()));
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
