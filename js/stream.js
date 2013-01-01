var stream	= new function () {




/**
* @namespace Player
*/
var self	= this;




/**
* @field
* @property {Node}
*/
var player;




/**
* @function
* @property {void} Initialises this namespace
*/
var init;

/**
* @function
* @property {bool} Indicates whether or not current track has completed
*/
var isFinished;

/**
* @function
* @property {void} Loads track in player
* @param {string} trackid
*/
var loadTrack;

/**
* @function
* @property {void} Mutes or unmutes player
* @param {bool} shouldMute
*/
var mute;

/**
* @function
* @property {void} Plays or pauses current track
* @param {bool} shouldPlay
*/
var play;

/**
* @function
* @property {int} Gets or sets time in current track
* @param {int} newTime
*/
var time;

/**
* @function
* @property {int} Gets or sets player volume
* @param {int} newVolume
*/
var volume;




self.init	= function () {
	window.onYouTubePlayerReady = function () { stream.player = $('#streamPlayer')[0]; };

	swfobject.embedSWF(
		'http://www.youtube.com/apiplayer?enablejsapi=1&playerapiid={0}&version=3'.assign({0: authentication.username}),
		'stream',
		'600',
		'600',
		'8',
		null,
		null,
		{allowScriptAccess: 'always'},
		{id: 'streamPlayer'}
	);
};


self.isFinished	= function (shouldMute) {
	return self.time() == self.player.getDuration();
};


self.loadTrack	= function (trackid) {
	self.player.stopVideo();

	var track	= datastore.track(trackid);

	track.once('value', function (o) {
		var val	= o.val();

		track.lastPlayed.set(Date.now());
		track.lastPlayedBy.set(authentication.userid);
		track.playCount.set(++val.playCount);

		self.player.loadVideoById(val.youtubeid);
	});
};


self.mute	= function (shouldMute) {
	shouldMute != false ? self.player.mute() : self.player.unMute();
};


self.play	= function (shouldPlay) {
	shouldPlay != false ? self.player.playVideo() : self.player.pauseVideo();
};


self.time	= function (newTime) {
	if (newTime) {
		self.player.seekTo(newTime, true);
	}

	return self.player.getCurrentTime();
};


self.volume	= function (newVolume) {
	if (newVolume) {
		self.player.setVolume(newVolume);
	}

	return self.player.getVolume();
};




};
