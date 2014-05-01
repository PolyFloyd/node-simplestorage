/*
 *  Copyright (c) 2013 PolyFloyd
 */

'use strict';

var fs     = require('fs');
var path   = require('path');
var mkdirp = require('mkdirp');

var SimpleStorage = module.exports = function(name, options, callback) {
  if (typeof options  === 'function') { callback = options; }
  if (typeof options  !== 'object')   { options  = {}; }
  if (typeof callback !== 'function') { callback = exports.defaultCallback; }

  options.directory = options.directory || './storage';
  options.filemode  = options.filemode  || (6<<6 | 4<<3 | 4);
  options.interval  = options.interval  || (10 * 60);
  mkdirp.sync(options.directory);

  this.$file = function() {
    return path.join(options.directory, name+'.json');
  };
  this.$filemode = function() {
    return options.filemode;
  };

  var storage = this;
  var cb = function(err) {
    if (callback) {
      callback(err, storage);
    } else {
      exports.defaultCallback(err);
    }
  };

  if (callback) {
    fs.exists(storage.$file(), function(exists) {
      if (exists) {
        storage.$read(cb);
      } else {
        storage.$flush(cb);
      }
    });
    this.$start(options.interval);
  } else {
    if (fs.existsSync(storage.$file())) {
      storage.$readSync();
    } else {
      storage.$flushSync();
    }
    this.$start(options.interval);
  }
};

SimpleStorage.prototype.$flush = function(callback) {
  var storage = this;
  callback = callback || exports.defaultCallback;
  fs.writeFile(this.$file(), JSON.stringify(this), {
    mode: storage.$filemode()
  }, callback);
};

SimpleStorage.prototype.$flushSync = function(callback) {
  var err = fs.writeFileSync(this.$file(), JSON.stringify(this), {
    mode: this.$filemode()
  });
  (callback || exports.defaultCallback)(err);
};

SimpleStorage.prototype.$read = function(callback) {
  var storage = this;
  callback = callback || exports.defaultCallback;
  fs.readFile(this.$file(), function(err, data) {
    if (!err) {
      var newData = JSON.parse(data);
      for (var key in newData) {
        storage[key] = newData[key];
      }
    }
    callback(err);
  });
};

SimpleStorage.prototype.$readSync = function(callback) {
  var data = fs.readFileSync(this.$file());
  var newData = JSON.parse(data);
  for (var key in newData) {
    this[key] = newData[key];
  }
  (callback || exports.defaultCallback)(null);
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

exports.defaultCallback = function(err) {
  if (err) throw err;
};
