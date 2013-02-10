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
