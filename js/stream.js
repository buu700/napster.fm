goog.provide('stream');


var stream	= new function () {




/**
* @namespace Player
*/
var self	= this;




/**
* @field
* @property {string}
*/
var currentTrack;

/**
* @field
* @property {bool}
*/
var isPlaying;

/**
* @field
* @property {int}
*/
var newTime;

/**
* @field
* @property {int}
*/
var newTimeProcessed;

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
* @property {int} Formats time value to human-readable timestamp
* @param {int} time
*/
var processTime;

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
		var wait		= new goog.async.ConditionalDelay(function () { return datastore.data.user.current.nowPlaying.track; });
		wait.onSuccess	= function () {
			self.onFinished();
			self.volume(100);
			self.sync();
		};
		wait.start(1000, 60000);
	};

	var onYouTubePlayerStateChange = function (state) {
		var eventListener	=
			state.data == YT.PlayerState.PLAYING ?
				window.onYouTubeVideoStarted :
				state.data == YT.PlayerState.ENDED ?
					window.onYouTubeVideoFinished :
					null
		;

		eventListener && eventListener();
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

	datastore.user().nowPlayingChild.isPlaying.setOnDisconnect(false);
	datastore.user().nowPlayingChild.lastChange.setOnDisconnect(0);
};


self.isFinished	= function () {
	return self.time() >= self.length();
};


self.length	= function () {
	return self.player.getDuration();
};


self.loadTrack	= function (trackid, callback, noUpdate) {
	self.mute(true);
	self.time(0, true);
	self.player.stopVideo();
	self.currentTrack	= trackid;

	window.onYouTubeVideoStarted	= window.onYouTubeVideoStarted || function () {
		window.onYouTubeVideoStarted	= null;
		self.play(!noUpdate, true);

		if (!noUpdate) {
			var length	= self.length();
			datastore.track(self.currentTrack).length.set(length);
			ui.slider.setMaximum(length);
		}

		callback && callback();
	};

	var load	= function () {
		var track	= datastore.data.track[trackid];

		goog.object.forEach(datastore.data.user.current.library, function (o) {
			o.nowPlayingClass	= o.id == trackid && 'now-playing';
		});

		self.player.loadVideoById(track.youtubeid);
		ui.slider.setMaximum(track.length);

		datastore.track(trackid).lastPlayed.set(Date.now());
		datastore.track(trackid).lastPlayedBy.set(authentication.userid);
		datastore.lastPlayed().push(trackid);
		
		if (noUpdate != true) {
			datastore.track(trackid).playCount.set(++track.playCount);
			self.updateNowPlaying();
		}
	};

	var wait		= new goog.async.ConditionalDelay(function () { return datastore.data.track[trackid]; });
	wait.onSuccess	= load;
	wait.onFailure	= function () {
		datastore.track(trackid).once('value', function (o) {
			datastore.data.track[trackid]	= o.val();
			load();
		});
	};
	wait.start(100, 1000);
};


self.mute	= function (shouldMute) {
	shouldMute === false ? self.player.unMute() : self.player.mute();
};


self.onFinished	= function (callback) {
	window.onYouTubeVideoFinished	= function () {
		self.play(false);
		callback && callback();
	};
};


self.play	= function (shouldPlay, noUpdate) {
	self.isPlaying	= shouldPlay === false ? false : true;

	self.mute(!self.isPlaying);

	window.clearInterval(ui.slider.playInterval);
	if (self.isPlaying) {
		ui.slider.playInterval	= window.setInterval(function () {
			if (!ui.slider.valueJustChanged && self.isPlaying) {
				self.time(undefined, true);
			}
		}, 500);
	}

	self.isPlaying ? self.player.playVideo() : self.player.pauseVideo();

	ui.update();
	self.time(undefined, true);

	if (noUpdate != true) {
		self.updateNowPlaying();
	}
};


self.processTime	= function (time) {
	time	= time || 0;
	return (time < 60 ? '0:' : '') + (time < 10 ? '0' : '') + ([].add(new Date (0, 0, 0, 0, 0, time).toLocaleTimeString().match(/[^0:].*/))[0] || 0);
}


self.sync	= function (userid) {
	userid		= userid || authentication.userid;
	var user	= datastore.user(userid);

	datastore.user(datastore.data.user.current.following[0]).nowPlayingChild.lastChange.off();
	
	datastore.user().following.set(userid);

	user.nowPlayingChild.lastChange.once('value', function (o) {
		var lastChange	= o.val();
		var timeOffset	= (Date.now() - lastChange) / 1000;

		user.nowPlaying.once('value', function (o) {
			var nowPlaying	= o.val();

			var newTime	= nowPlaying.time + (nowPlaying.isPlaying ? timeOffset : 0);
			var update	= function () {
				self.play(nowPlaying.isPlaying, true);
				self.time(newTime, true);
			};

			if (nowPlaying.track != self.currentTrack) {
				self.loadTrack(nowPlaying.track, update, true);
			}
			else {
				update();
			}
		});
	});
};


self.time	= function (newTime, noUpdate) {
	newTime	= newTime === 0 ? 1 : newTime;

	if (newTime && Math.abs(newTime - self.time()) < 5) {
		return newTime;
	}

	if (newTime) {
		self.newTime	= newTime;

		if (noUpdate != true) {
			self.updateNowPlaying();
		}
		else {
			self.player.seekTo(newTime, true);
		}
	}

	if ((newTime >= self.length() || self.player.getCurrentTime() >= self.length()) && self.isPlaying) {
		self.isPlaying	= false;
		self.newTime	= 0;
		ui.update();
	}

	self.newTime			= self.player.getCurrentTime() || self.newTime;
	self.newTimeProcessed	= self.processTime(self.newTime);
	
	if (self.newTime) {
		datastore.user().nowPlayingChild.time.set(self.newTime);		
	}
	
	if (Math.abs(self.newTime - ui.slider.getValue()) >= 1) {
		ui.slider.animatedSetValue(self.newTime);
	}

	ui.update();

	return self.newTime;
};


self.updateNowPlaying	= function () {
	datastore.user().nowPlaying.set({
		isPlaying: self.isPlaying,
		lastChange: Date.now(),
		time: self.newTime,
		track: self.currentTrack
	});

	ui.update();
};


self.volume	= function (newVolume) {
	if (!window.isNaN(newVolume)) {
		self.player.setVolume(newVolume);
	}

	return self.player.getVolume();
};




};
