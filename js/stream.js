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
* @property {int} Length of current track
*/
var length;

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
	var onYouTubePlayerReady = function () {
		var wait		= new goog.async.ConditionalDelay(function () { return window.datastoreIsReady; });
		wait.onSuccess	= function () {
			self.onFinished();
		};
		wait.start();
	};

	var onYouTubePlayerStateChange = function (state) {
		var eventListener	=
			state.data == YT.PlayerState.PLAYING ?
				'window.onYouTubeVideoStarted' :
				state.data == YT.PlayerState.ENDED ?
					'window.onYouTubeVideoFinished' :
					null
		;

		(window.eval(eventListener) || function () {})();
		ui.update();
	};

	var onYouTubePlayerError = function () {

	};

	window.onYouTubeIframeAPIReady	= function () {
		self.player	= new YT.Player($('#stream')[0], {
			height: '390',
			width: '640',
			events: {
				'onReady': onYouTubePlayerReady,
				'onStateChange': onYouTubePlayerStateChange,
				'onError': onYouTubePlayerError
			}
		});
	};

	window.onbeforeunload	= function () {
		self.play(false);
	};
};


self.isFinished	= function () {
	return self.time() == self.length();
};


self.length	= function () {
	return self.player.getDuration();
};


self.loadTrack	= function (trackid, callback, noUpdate) {
	self.player.stopVideo();

	window.onYouTubeVideoStarted	= function () {
		window.onYouTubeVideoStarted	= null;
		window.setTimeout(callback, 1000);
	};

	datastore.track(trackid).once('value', function (o) {
		var val	= o.val();
		var id	= o.name();

		ui.slider.setMaximum(val.length);

		datastore.track(trackid).lastPlayed.set(Date.now());
		datastore.track(trackid).lastPlayedBy.set(authentication.userid);

		datastore.lastPlayed().push(id);

		self.player.loadVideoById(val.youtubeid);
		
		self.currentTrack	= trackid;
		
		if (noUpdate != true) {
			datastore.track(trackid).playCount.set(++val.playCount);
		}

		var o	= datastore.data.user.current.library.processed;
		for (var k in o) {
			var processedTrack	= o[k];
			processedTrack.nowPlayingClass	= processedTrack.id == self.currentTrack ? 'now-playing' : '';
		}

		self.play(true, noUpdate);
	});
};


self.mute	= function (shouldMute) {
	shouldMute != false ? self.player.mute() : self.player.unMute();
};


self.onFinished	= function (callback) {
	window.onYouTubeVideoFinished	= function () {
		self.play(false);
		window.clearInterval(ui.slider.playInterval);
		callback && callback();
	};
};


self.play	= function (shouldPlay, noUpdate) {
	self.isPlaying	= shouldPlay == false ? false : true;
	self.isPlaying ? self.player.playVideo() : self.player.pauseVideo();

	if (noUpdate != true) {
		self.updateNowPlaying();
	}

	window.clearInterval(ui.slider.playInterval);
	if (self.isPlaying) {
		ui.slider.playInterval	= window.setInterval(function () { ui.slider.animatedSetValue(self.time()); }, 1000);
	}
};


self.sync	= function (userid) {
	userid		= userid || authentication.userid;
	var user	= datastore.user(userid);

	datastore.user(datastore.data.user.current.following).nowPlayingChild.lastChange.off();
	
	datastore.user().following.set(userid);

	user.nowPlayingChild.lastChange.on('value', function (o) {
		var lastChange	= o.val();
		var timeOffset	= (Date.now() - lastChange) / 1000;

		user.nowPlaying.once('value', function (o) {
			var nowPlaying	= o.val();

			self.loadTrack(nowPlaying.track, function () {
				self.play(nowPlaying.isPlaying, true);
				window.setTimeout(function () { self.time(nowPlaying.time + (nowPlaying.isPlaying ? timeOffset : 0), true); }, 1500);
			}, true);
		});
	});
};


self.time	= function (newTime, noUpdate) {
	if (newTime && Math.abs(newTime - self.time()) < 5) {
		return newTime;
	}

	if (newTime) {
		self.player.seekTo(newTime, true);
	}
	
	if (newTime && noUpdate != true) {
		self.updateNowPlaying();
	}

	return self.player.getCurrentTime() || datastore.data.user.current.nowPlaying.time;
};


self.updateNowPlaying	= function () {
	datastore.user().nowPlaying.set({
		isPlaying: self.isPlaying,
		lastChange: Date.now(),
		time: self.time(),
		track: self.currentTrack
	});

	ui.update();
};


self.volume	= function (newVolume) {
	if (newVolume) {
		self.player.setVolume(newVolume);
	}

	return self.player.getVolume();
};




};
