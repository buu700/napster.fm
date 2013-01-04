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
* @property {void} Logs message
* @param {string} message
*/
var logVal;




self.log	= function (message) {
	console.log(message);
};

self.logVal	= function (message) {
	console.log(message.val());
};




};
