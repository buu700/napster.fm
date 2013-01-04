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




self.log	= function (message) {
	console.log(message);
};

self.logFoo	= function () {
	console.log('foo');
};

self.logVal	= function (message) {
	console.log(message.val());
};




};
