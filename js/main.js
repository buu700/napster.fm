var napster	= (new function () {




/**
* @namespace Napster
* @requires Firebase			: Real-time frontend-driven data store; http://firebase.com/
* @requires Sugar				: Extends prototypes with helper functions (cf. Underscore) and adds JS 1.6 support to ancient browsers; http://sugarjs.com/api
* @requires AngularJS			: Declarative MVC framework; http://angularjs.org/
* @requires Closure Library		: JS standard library; https://developers.google.com/closure/library/
*/
var self	= this;




/**
* @field
* @property {string} description
*/
var foo;

/**
* @field
* @property {bool} description
*/
var bar;




/**
* @function
* @property {void} Does stuff
*/
var init;

/**
* @function
* @property {string} Returns stuff
* @param {string} type HTTP verb to use
* @param {string} route URL route
* @param {string} input
* @param {function} callback
* @example -> 'stuff'
*/
var balls;




self.init	= function () {
	self.foo								= 'foo';
	self.bar								= false;
	self.datastore							= {};
	self.datastore.page						= function (value, recover) { return self.balls('page', value, recover) || ''; };
};


self.balls	= function (type, route, input, callback) {
	return 'stuff';
};




}());
