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
goog.require('goog.ui.TableSorter');goog.provide('napster.chat');


var chat	= new function () {




/**
* @namespace Chat
*/
var self	= this;




/**
* @function
* @property {void} Initialises this namespace
*/
var init;

/**
* @function
* @property {void} Adds user to group
* @param {string} groupid
* @param {string} opt_userid
*/
var addToGroup;

/**
* @function
* @property {void} Removes user from group
* @param {string} groupid
* @param {string} opt_userid
*/
var removeFromGroup;

/**
* @function
* @property {void} Sends message
* @param {string} message
* @param {string} opt_groupid
*/
var sendMessage;




self.init	= function () {
	/* For now, adding all users to default group upon login */
	chat.addToGroup('0');
};

self.addToGroup	= function (groupid, opt_userid) {
	var userid	= opt_userid || authentication.userid;

	datastore.group(groupid).member(userid).set(userid);
	datastore.user().group(groupid).set(groupid);
	ui.update();
};

self.removeFromGroup	= function (groupid, opt_userid) {
	var userid	= opt_userid || authentication.userid;

	datastore.group(groupid).member(userid).set(null);
	datastore.user().group(groupid).set(null);
	ui.update();
};

self.sendMessage	= function (message, opt_groupid) {
	datastore.group(opt_groupid).messages.push({author: authentication.userid, created: Date.now(), text: message});
	ui.update();
};




};
