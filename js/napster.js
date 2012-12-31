var napster	= new function () {




/**
* @namespace Napster
* @requires Firebase		: Real-time frontend-driven data store; http://firebase.com/
* @requires Sugar			: Extends prototypes with helper functions (cf. Underscore) and adds JS 1.6 support to ancient browsers; http://sugarjs.com/api
* @requires AngularJS		: Declarative MVC framework; http://angularjs.org/
* @requires Closure Library	: JS standard library; https://developers.google.com/closure/library/
*/
var self	= this;




/**
* @function
* @property {void} Initialises this namespace
*/
var init;

/**
* @function
* @property {string} Hashes specified text
* @param {string} text
*/
var hash;




self.init	= function () {
	authentication.init();
	stream.init();
};


self.hash	= function (text) {
	return new goog.crypt.Hmac(new goog.crypt.Sha256(), 'napster').getHmac(text).map(function (n) { return n.toString(36); }).join('');
};




};
