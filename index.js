var Emitter = require('emitter');
var global = require('global');

// support for XMLHttpRequest2 objects with proper CORS features
// https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cors.js
var k_hasCors = 'XMLHttpRequest' in global && 'withCredentials' in new global.XMLHttpRequest();

// create the request object
var create = function(xdomain) {
  if (xdomain && 'undefined' != typeof XDomainRequest && !k_hasCors) {
    return new XDomainRequest();
  }

  // XMLHttpRequest can be disabled on IE
  try {
    if ('undefined' != typeof XMLHttpRequest && (!xdomain || k_hasCors)) {
      return new XMLHttpRequest();
    }
  } catch (e) { }

  throw new Error('cannot create XMLHttpRequest object');
};

// detect if cross domain or not
var isXD = function(uri) {
  var location = global.location;
  var a =  document.createElement('a');
  a.href = uri;

  return (a.protocol !== location.protocol || a.hostname !== location.hostname ||
      a.port !== location.port);
}

/**
 * Request constructor
 *
 * @param {Object} options
 * @api public
 */

function Request(opts) {
  var self = this;

  // figure out if request needs to be xdomain
  self.method = opts.method || 'GET';
  self.uri = opts.uri;
  self.xd = !!opts.xd || isXD(self.uri);
  self.async = false !== opts.async;
  self.withCredentials = !!opts.withCredentials;
  self.data = undefined != opts.data ? opts.data : null;
  self.create();
}

Emitter(Request.prototype);

/**
 * Creates the XHR object and sends the request.
 *
 * @api private
 */

Request.prototype.create = function() {
  var self = this;
  var xhr = create(self.xd);

  xhr.open(self.method, self.uri, self.async);

  if ('POST' == self.method) {
    try {
      if (xhr.setRequestHeader) {
        // xmlhttprequest
        xhr.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
      } else {
        // xdomainrequest
        xhr.contentType = 'text/plain';
      }
    } catch (e) {}
  }

  if (self.xd && global.XDomainRequest && xhr instanceof XDomainRequest) {
    xhr.onerror = function(e){
      self.onError(e);
    };
    xhr.onload = function(){
      self.onData(xhr.responseText);
    };
    xhr.onprogress = empty;
  } else {
    // ie6 check
    if ('withCredentials' in xhr) {
      xhr.withCredentials = self.withCredentials;
    }

    xhr.onreadystatechange = function(){
      var data;

      try {
        if (4 != xhr.readyState) return;
        if (200 == xhr.status || 1223 == xhr.status) {
          data = xhr.responseText;
        } else {
          self.onError(xhr.status);
        }
      } catch (e) {
        self.onError(e);
      }

      if (undefined !== data) {
        self.onData(data);
      }
    };
  }

  xhr.send(self.data);
};

/**
 * Called upon successful response.
 *
 * @api private
 */

Request.prototype.onSuccess = function(){
  this.emit('success');
  this.cleanup();
};

/**
 * Called if we have data.
 *
 * @api private
 */

Request.prototype.onData = function(data){
  this.emit('data', data);
  this.onSuccess();
};

/**
 * Called upon error.
 *
 * @api private
 */

Request.prototype.onError = function(err){
  this.emit('error', err);
  this.cleanup();
};

/**
 * Cleans up house.
 *
 * @api private
 */

Request.prototype.cleanup = function(){
  if ('undefined' == typeof this.xhr ) {
    return;
  }
  // xmlhttprequest
  this.xhr.onreadystatechange = empty;

  // xdomainrequest
  this.xhr.onload = this.xhr.onerror = empty;

  try {
    this.xhr.abort();
  } catch(e) {}

  this.xhr = null;
};

/**
 * Aborts the request.
 *
 * @api public
 */

Request.prototype.abort = function(){
  this.cleanup();
};

module.exports = Request;
