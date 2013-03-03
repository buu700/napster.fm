goog.require('goog.async.ConditionalDelay');
goog.require('goog.async.Deferred');
goog.require('goog.async.DeferredList');
goog.require('goog.crypt.Hmac');
goog.require('goog.crypt.Sha256');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.dom.query');
goog.require('goog.events');
goog.require('goog.events.KeyCodes');
goog.require('goog.events.KeyHandler');
goog.require('goog.net.cookies');
goog.require('goog.net.Jsonp');
goog.require('goog.object');
goog.require('goog.ui.Component');
goog.require('goog.ui.Slider');
goog.require('goog.ui.TableSorter');

goog.provide('napster.debug');


var debug	= new function () {




/**
* @namespace Debug
*/
var self	= this;




/**
* @function
* @property {void} Logs message
* @param {string} message
*/
var log;

/**
* @function
* @property {void} Logs 'foo'
*/
var logFoo;

/**
* @function
* @property {void} Logs value of Firebase object
* @param {string} message
*/
var logVal;

/**
* @function
* @property {void} Adds first search result to library
* @param {string} results
*/
var lucky;




self.log	= function (message) {
	console.log(message);
};

self.logFoo	= function () {
	console.log('foo');
};

self.logVal	= function (message) {
	console.log(message.val());
};

self.lucky	= function (results) {
	datastore.user().library.push(results[0].id);
};




};
