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

goog.provide('napster.library');


var library	= new function () {




/**
* @namespace Library
*/
var self	= this;




/**
* @function
* @property {void} Adds user to Hot List
* @param {string} userid
*/
var addToHotlist;

/**
* @function
* @property {void} Processes input for addToHotlist
* @param {Element} elem
*/
var addToHotlistProcessor;

/**
* @function
* @property {void} Adds track to library
* @param {string} trackid
*/
var addTrack;

/**
* @function
* @property {void} Switches active Hot List member
* @param {string} userid
*/
var switchActiveHotlistMember;




self.addToHotlist	= function (userid) {
	datastore.user().hotlistMember(userid).set(userid);
	ui.update();
};

self.addToHotlistProcessor	= function (elem) {
	var username	= elem.value;

	datastore.username(username).once('value', function (data) {
		var userid	= data.val();

		if (userid != null) {
			self.addToHotlist(userid);
			ui.notify('Added {0} to Hot List'.assign({0: authentication.notificationUsername(username)}));
			elem.value	= null;
		}
		else {
			ui.notify('Invalid username');
		}
	});
};

self.addTrack	= function (trackid) {
	datastore.user().library.push(trackid);

	var wait		= new goog.async.ConditionalDelay(function () { return datastore.data.track[trackid]; });
	wait.onSuccess	= function () {
		ui.notify('Added "{0}" by {1}'.assign({0: datastore.data.track[trackid].title, 1: datastore.data.track[trackid].artist}));
	};
	wait.start(0, 60000);
};

self.switchActiveHotlistMember	= function (userid) {
	datastore.data.activeHotlistMember	= datastore.data.user.current.hotlist[userid];
	ui.update();
};


};
