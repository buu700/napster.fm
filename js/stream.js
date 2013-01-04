var stream	= new function () {




/**
* @namespace Player
*/
var self	= this;




/**
* @field
* @property {bool}
*/
var isPlaying;

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
* @param {function} callback
* @param {bool} noUpdate
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
* @property {void} Executes callback when track is finished
* @param {bool} callback Optional; removes any previous callback if undefined
*/
var onFinished;

/**
* @function
* @property {void} Plays or pauses current track
* @param {bool} shouldPlay
* @param {bool} noUpdate
*/
var play;

/**
* @function
* @property {void} Continues playing previously played track
*/
var resumePlaying;

/**
* @function
* @property {void} Syncs player state with specified user
* @param {string} userid Optional; if undefined, will default to current user (thereby syncing multiple instances of Napster.fm owned by the same user)
*/
var sync;

/**
* @function
* @property {int} Gets or sets time in current track
* @param {int} newTime
* @param {bool} noUpdate
*/
var time;

/**
* @function
* @property {void} Updates datastore.data.user.current.nowPlaying with current state of player
*/
var updateNowPlaying;

/**
* @function
* @property {int} Gets or sets player volume
* @param {int} newVolume
*/
var volume;




self.init	= function () {
	window.onYouTubePlayerReady = function () {
		stream.player = $('#streamPlayer')[0];
		self.player.addEventListener('onStateChange', 'window.onYouTubeVideoStarted');
		self.player.addEventListener('onStateChange', 'window.onYouTubeVideoFinished');

		self.sync();
	};

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

	window.onbeforeunload	= function () {
		self.play(false);
	};
};


self.isFinished	= function (shouldMute) {
	return self.time() == self.player.getDuration();
};


self.loadTrack	= function (trackid, callback, noUpdate) {
	self.player.stopVideo();

	var track	= datastore.track(trackid);

	window.onYouTubeVideoStarted	= function (state) {
		if (state === 1) {
			window.onYouTubeVideoStarted	= null;
			callback();
		}
	};

	track.once('value', function (o) {
		var val	= o.val();
		var id	= o.name();

		track.lastPlayed.set(Date.now());
		track.lastPlayedBy.set(authentication.userid);
		track.playCount.set(++val.playCount);

		datastore.lastPlayed().push(id);

		self.player.loadVideoById(val.youtubeid);
		
		self.currentTrack	= trackid;
		self.isPlaying		= true;
		
		if (noUpdate != true) {
			self.updateNowPlaying();
		}
	});
};


self.mute	= function (shouldMute) {
	shouldMute != false ? self.player.mute() : self.player.unMute();
};


self.onFinished	= function (callback) {
	window.onYouTubeVideoFinished	= function (state) {
		if (state === 0) {
			callback && callback();
			self.isPlaying	= false;
		}
	};
};


self.play	= function (shouldPlay, noUpdate) {
	self.isPlaying	= shouldPlay == false ? false : true;
	self.isPlaying ? self.player.playVideo() : self.player.pauseVideo();

	if (noUpdate != true) {
		self.updateNowPlaying();
	}
};


self.resumePlaying	= function () {
	var nowPlaying	= goog.object.clone(datastore.data.user.current.nowPlaying);

	self.loadTrack(nowPlaying.track, function () {
		self.play(nowPlaying.isPlaying);
		self.time(nowPlaying.time);
	});
};


self.sync	= function (userid) {
	userid		= userid || authentication.userid;
	var user	= datastore.user(userid);

	datastore.user(datastore.data.user.current.following).nowPlayingChild.lastChange.off();
	
	datastore.user().following.set(userid);

	user.nowPlayingChild.lastChange.on('value', function (o) {
		var lastChange	= o.val();
		var timeOffset	= (Date.now () - lastChange) / 1000;

		user.nowPlaying.once('value', function (o) {
			var nowPlaying	= o.val();

			self.loadTrack(nowPlaying.track, function () {
				self.play(nowPlaying.isPlaying, true);
				self.time(nowPlaying.time + (nowPlaying.isPlaying ? timeOffset : 0), true);
			}, true);
		});
	});
};


self.time	= function (newTime, noUpdate) {
	if (newTime) {
		self.player.seekTo(newTime, true);
	}
	if (newTime && noUpdate != true) {
		self.updateNowPlaying();
	}

	return self.player.getCurrentTime();
};


self.updateNowPlaying	= function () {
	datastore.user().nowPlaying.set({
		isPlaying: self.isPlaying,
		lastChange: Date.now(),
		time: self.time(),
		track: self.currentTrack
	});
};


self.volume	= function (newVolume) {
	if (newVolume) {
		self.player.setVolume(newVolume);
	}

	return self.player.getVolume();
};




};
