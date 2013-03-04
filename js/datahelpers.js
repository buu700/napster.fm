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

goog.provide('napster.datahelpers');


var datahelpers	= new function () {




/**
* @namespace Datahelpers
*/
var self	= this;




/**
* @function
* @property {function} Returns generic handler for Firebase child_added event
* @param {object} dataLocation
* @param {function} opt_callback
*/
var onChildAdded;

/**
* @function
* @property {function} Returns generic handler for Firebase child_removed event
* @param {object} dataLocation
* @param {function} opt_callback
*/
var onChildRemoved;

/**
* @function
* @property {function} Returns generic handler for Firebase value event
* @param {object} dataLocation
* @param {string} key
* @param {function} opt_callback
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




self.onChildAdded	= function (dataLocation, opt_callback) {
	return function (newData) {
		var key	= newData.name();
		dataLocation[key]	= newData.val();
		opt_callback && opt_callback(dataLocation, key, newData);
		ui.update();
	};
};

self.onChildRemoved	= function (dataLocation, opt_callback) {
	return function (newData) {
		var key	= newData.name();
		if (dataLocation[key]) {
			goog.object.remove(dataLocation, key);
		}
		else {
			goog.object.remove(dataLocation, newData.val());
		}
		opt_callback && opt_callback(dataLocation, key, newData);
		ui.update();
	};
};

self.onValue	= function (dataLocation, key, opt_callback) {
	return function (newData) {
		dataLocation[key]	= newData.val();
		opt_callback && opt_callback(dataLocation, key, newData);
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
		members.on('child_added', self.onChildAdded(datastore.data.group[groupid].members, function (o, k) {
			var userid	= o[k];
			datastore.user(userid).username.once('value', function (data) {
				o[k]	= data.val();
				ui.update();
			});
		}));
		
		messages.on('child_added', self.onChildAdded(datastore.data.group[groupid].messages, function (o, k) {
			var userid	= o[k].author;
			datastore.user(userid).username.once('value', function (data) {
				o[k].author	= data.val();
				ui.update();
			});

			o[k].created	= new Date(o[k].created).toLocaleString();
			o[k].text		= o[k].text.compact().truncate(1000);
		}));

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
