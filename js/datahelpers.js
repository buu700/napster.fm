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
goog.require('goog.ui.TableSorter');goog.provide('napster.datahelpers');


var datahelpers	= new function () {




/**
* @namespace Datahelpers
*/
var self	= this;




/**
* @function
* @property {function} Returns generic handler for Firebase child_added event
* @param {object} dataLocation
*/
var onChildAdded;

/**
* @function
* @property {function} Returns generic handler for Firebase child_removed event
* @param {object} dataLocation
*/
var onChildRemoved;

/**
* @function
* @property {function} Returns generic handler for Firebase value event
* @param {object} dataLocation
* @param {string} key
*/
var onValue;

/**
* @function
* @property {void} Processes track
* @param {string} trackid
* @param {function} callback
*/
var processTrack;

/**
* @function
* @property {void} Syncs local data for specified group
* @param {string} groupid
*/
var syncGroup;

/**
* @function
* @property {void} Syncs local data for specified track
* @param {string} trackid
*/
var syncTrack;




self.onChildAdded	= function (dataLocation) {
	return function (newData) {
		dataLocation[newData.name()]	= newData.val();
		ui.update();
	};
};

self.onChildRemoved	= function (dataLocation) {
	return function (newData) {
		if (dataLocation[newData.name()]) {
			goog.object.remove(dataLocation, newData.name());
		}
		else {
			goog.object.remove(dataLocation, newData.val());
		}
		ui.update();
	};
};

self.onValue	= function (dataLocation, key) {
	return function (newData) {
		dataLocation[key]	= newData.val();
		ui.update();
	};
};

self.processTrack	= function (track, callback) {
	track.length	= stream.processTime(track.length);

	/* Will equal epoch if not yet played */
	track.lastPlayed	= new Date(track.lastPlayed || 0).format('{12hr}{tt}, {yyyy}-{MM}-{dd}');

	datastore.user(track.lastPlayedBy).username.once('value', function (username) {
		track.lastPlayedBy	= username.val();
		callback(track);
	});
};

self.syncGroup	= function (groupid, shouldStopSync) {
	datastore.data.group[groupid]	= datastore.data.group[groupid] || {id: groupid, members: {}, messages: {}, name: ''};

	var members		= datastore.group(groupid).members.limit(500);
	var messages	= datastore.group(groupid).messages.limit(500);
	var name		= datastore.group(groupid).name;

	members.off('child_added');
	messages.off('child_added');
	name.off('value');

	if (!shouldStopSync) {
		members.on('child_added', self.onChildAdded(datastore.data.group[groupid].members));
		messages.on('child_added', self.onChildAdded(datastore.data.group[groupid].messages));
		name.on('value', self.onValue(datastore.data.group[groupid], 'name'));
	}
	else {
		goog.object.remove(datastore.data.group, groupid);
	}
};

self.syncTrack	= function (trackid, shouldStopSync) {
	datastore.data.track[trackid]	= datastore.data.track[trackid] || {id: trackid};

	var track	= datastore.track(trackid);

	track.off('value');

	if (!shouldStopSync) {
		track.on('value', function (newData) {
			self.processTrack(newData.val(), function (processedTrack) {
				goog.object.forEach(processedTrack, function (value, key) {
					datastore.data.track[trackid][key]	= value;
				});
				ui.update();
			});
		});
	}
	else {
		goog.object.remove(datastore.data.track, trackid);
	}
};


};
