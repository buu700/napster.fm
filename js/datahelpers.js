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
	datastore.eventHandlers.syncGroup			= datastore.eventHandlers.syncGroup || {};
	datastore.eventHandlers.syncGroup[groupid]	= datastore.eventHandlers.syncGroup[groupid] || {};
	var eventHandlers	= datastore.eventHandlers.syncGroup[groupid];


	datastore.data.group[groupid]	= datastore.data.group[groupid] || {id: groupid, members: {}, messages: {}, name: ''};

	var members		= datastore.group(groupid).members.limit(100);
	var messages	= datastore.group(groupid).messages.limit(100);
	var name		= datastore.group(groupid).name;

	members.off('child_added', eventHandlers.members);
	messages.off('child_added', eventHandlers.messages);
	name.off('value', eventHandlers.name);

	if (!shouldStopSync) {
		eventHandlers.members	= members.on('child_added', self.onChildAdded(datastore.data.group[groupid].members, function (o, k) {
			var userid	= o[k];
			datastore.user(userid).username.once('value', function (data) {
				var username	= data.val();

				/* Exclude temp users from member list */
				if (username.startsWith('temporary-account')) {
					goog.object.remove(o, k);
					return;
				}

				o[k]	= {username: username};

				datastore.user(userid).nowPlayingChild.track.off('value', eventHandlers.memberTracks);
				eventHandlers.memberTracks	= datastore.user(userid).nowPlayingChild.track.on('value', function (data) {
					datastore.track(data.val()).title.once('value', function (data) {
						o[k].listeningTo	= data.val();
						ui.update();
					});
				});
			});
		}));
		
		eventHandlers.messages	= messages.on('child_added', self.onChildAdded(datastore.data.group[groupid].messages, function (o, k) {
			var userid	= o[k].author;
			datastore.user(userid).username.once('value', function (data) {
				o[k].author	= data.val();
				ui.update();
			});

			o[k].created	= new Date(o[k].created).toLocaleString();
			o[k].text		= o[k].text.compact().truncate(1000, undefined, undefined, '... [message truncated]');
		}));

		eventHandlers.name	= name.on('value', self.onValue(datastore.data.group[groupid], 'name'));
	}
	else {
		goog.object.remove(datastore.data.group, groupid);
	}
};

self.syncTrack	= function (trackid, shouldStopSync) {
	datastore.eventHandlers.syncTrackHelper	= datastore.eventHandlers.syncTrackHelper || {};

	datastore.data.track[trackid]	= datastore.data.track[trackid] || {id: trackid};

	var track	= datastore.track(trackid);

	track.off('value', datastore.eventHandlers.syncTrackHelper[trackid]);

	if (!shouldStopSync) {
		datastore.eventHandlers.syncTrackHelper[trackid]	= track.on('value', function (newData) {
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
