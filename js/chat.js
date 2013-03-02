goog.provide('napster.chat');


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
