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
goog.require('goog.net.cookies');
goog.require('goog.net.Jsonp');
goog.require('goog.object');
goog.require('goog.ui.Component');
goog.require('goog.ui.Slider');
goog.require('goog.ui.TableSorter');

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
* @property {void} Accepts invite to group
* @param {string} groupinviteid
*/
var acceptInvite;

/**
* @function
* @property {void} Adds user to group
* @param {string} groupid
*/
var addToGroup;

/**
* @function
* @property {void} Creates new group
* @param {string} opt_name
*/
var createGroup;

/**
* @function
* @property {void} Invites other user to group
* @param {string} userid
* @param {string} groupid
*/
var inviteToGroup;

/**
* @function
* @property {void} Processes input for inviteToGroup
* @param {Element} elem
*/
var inviteToGroupProcessor;

/**
* @function
* @property {void} Rejects invite to group
* @param {string} groupinviteid
*/
var rejectInvite;

/**
* @function
* @property {void} Removes user from group
* @param {string} groupid
*/
var removeFromGroup;

/**
* @function
* @property {void} Switches active group to specified
* @param {string} groupid
*/
var switchToGroup;

/**
* @function
* @property {void} Sends message
* @param {string} message
* @param {string} opt_groupid
*/
var sendMessage;




self.init	= function () {
	/* For now, adding/switching all users to default group upon login */
	self.switchToGroup('0');
};

self.acceptInvite	= function (groupinviteid) {
	self.switchToGroup(datastore.data.user.current.groupinvites[groupinviteid].groupid);
	datastore.user().groupinvite(groupinviteid).remove();
};

self.addToGroup	= function (groupid) {
	datastore.group(groupid).member(authentication.userid).set(authentication.userid);
	datastore.user().group(groupid).set(groupid);
	ui.update();
};

self.createGroup	= function (opt_name) {
	var name	= opt_name || 'Chat {0}'.assign({0: Date.now().toString().slice(-3)});
	var group	= datastore.groupRoot.push({name: name});

	self.switchToGroup(group.name());
	ui.notify('Created group {0}'.assign({0: name}));
};

self.inviteToGroup	= function (userid, groupid) {
	datastore.user(userid).groupinvites.push({from: authentication.userid, group: groupid});
	ui.update();
};

self.inviteToGroupProcessor	= function (elem) {
	var username	= elem.value;

	datastore.username(username).once('value', function (data) {
		var userid	= data.val();

		if (userid != null) {
			self.inviteToGroup(userid, datastore.data.activeGroup.id);
			ui.notify('Invited {0} to {1}'.assign({0: authentication.notificationUsername(username), 1: datastore.data.activeGroup.name}));
			elem.value	= null;
		}
		else {
			ui.notify('Invalid username');
		}
	});
};

self.rejectInvite	= function (groupinviteid) {
	datastore.user().groupinvite(groupinviteid).remove();
};

self.removeFromGroup	= function (groupid) {
	datastore.group(groupid).member(authentication.userid).set(null);
	datastore.user().group(groupid).set(null);

	/* Switch to arbitrary remaining group after removal when applicable */
	var newGroup	= goog.object.getKeys(datastore.data.user.current.groups).remove(groupid)[0];
	newGroup ? self.switchToGroup(newGroup) : ui.update();
};

self.switchToGroup	= function (groupid) {
	self.addToGroup(groupid);

	var wait		= new goog.async.ConditionalDelay(function () { return datastore.data.group[groupid]; });
	wait.onSuccess	= function () {
		datastore.data.activeGroup	= datastore.data.group[groupid];
		ui.update();
	};
	wait.start(0, 60000);
};

self.sendMessage	= function (message, opt_groupid) {
	datastore.group(opt_groupid).messages.push({author: authentication.userid, created: Date.now(), text: message});
	ui.update();
};




};
