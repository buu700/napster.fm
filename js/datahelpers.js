var datahelpers	= new function () {




/**
* @namespace Datahelpers
*/
var self	= this;




/**
* @function
* @property {void} Deprecated before it was even committed
* @param {object} tracks
* @param {function} callback
*/
var processTrackList;




self.processTrackList	= function (tracks, callback) {
	var defers	= [];

	for (var i in tracks) {
		var trackid	= tracks[i];
		defers.add(new goog.async.Deferred());
		datastore.track(trackid).once('value', function (track) { defers.last().callback(track.val()); });
	}

	goog.async.DeferredList.gatherResults(defers).addCallback(callback);
};




};
