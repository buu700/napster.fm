goog.provide('stream');


var stream	= new function () {




/**
* @namespace Player
*/
var self	= this;




/**
* @field
* @property {bool}
*/
var autoSetLock;

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
* @field
* @property {int}
*/
var playerUpdated;




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
* @param {bool} manualSet
*/
var time;

/**
* @function
* @property {void} Updates datastore.data.user.current.nowPlaying with current state of player
* @param {bool} manualSet
*/
var updatePlayer;

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
		self.updatePlayer();
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
	datastore.user().nowPlayingChild.manualSet.setOnDisconnect(true);
};


self.isFinished	= function () {
	return self.time() >= self.length();
};


self.length	= function () {
	return self.player.getDuration();
};


self.loadTrack	= function (trackid, callback, manualSet) {
	self.autoSetLock	= true;

	self.mute(true);
	self.player.stopVideo();
	self.currentTrack	= trackid;

	oldOnYouTubeVideoStarted		= window.onYouTubeVideoStarted;
	window.onYouTubeVideoStarted	= function () {
		window.onYouTubeVideoStarted	= null;
		oldOnYouTubeVideoStarted && oldOnYouTubeVideoStarted != arguments.callee && oldOnYouTubeVideoStarted();

		self.play(self.isPlaying === true, manualSet);

		window.setTimeout(callback, 1000);
	};

	var load	= function () {
		var track	= datastore.data.track[trackid];

		datastore.track(trackid).lastPlayed.set(Date.now());
		datastore.track(trackid).lastPlayedBy.set(authentication.userid);
		datastore.lastPlayed().push(trackid);
		datastore.track(trackid).playCount.set(++track.playCount);

		self.player.loadVideoById(track.youtubeid);
	};

	window.setTimeout(function () {
		datastore.track(trackid).once('value', function (o) {
			datahelpers.processTrack(o.val(), function (track) {
				for (var key in track) {
					datastore.data.track[trackid][key]	= track[key];
				}

				load();
			});
		});
	}, 1000);
};


self.mute	= function (shouldMute) {
	shouldMute === false ? self.player.unMute() : self.player.mute();
};


self.onFinished	= function (callback) {
	window.onYouTubeVideoFinished	= function () {
		self.play(false);
		window.setTimeout(callback, 1000);
	};
};


self.play	= function (shouldPlay, manualSet) {
	if (shouldPlay == self.isPlaying) {
		return;
	}

	self.autoSetLock	= true;
	
	self.isPlaying	= shouldPlay === false ? false : true;
	self.mute(!self.isPlaying);

	if (self.isPlaying && self.isFinished()) {
		self.player.playVideo();
		self.time(0);
		self.player.playVideo();
	}
	else {
		self.isPlaying ? self.player.playVideo() : self.player.pauseVideo();
	}

	self.time(undefined, manualSet);
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

	user.nowPlaying.on('value', function (o) {
		var nowPlaying	= o.val();

		if (nowPlaying.lastChange <= self.playerUpdated) {
			return;
		}

		var timeOffset	= (Date.now() - nowPlaying.lastChange) / 1000;
		var newTime	= nowPlaying.time + (nowPlaying.isPlaying ? timeOffset : 0);
		var update	= function () {
			self.play(nowPlaying.isPlaying);
			if (nowPlaying.manualSet || self.currentTrack) {
				self.time(newTime);
			}
		};

		if (nowPlaying.track != self.currentTrack) {
			self.loadTrack(nowPlaying.track, update);
		}
		else if (nowPlaying.isPlaying == self.isPlaying && Math.abs(newTime - self.time()) < 4) {
			return;
		}
		else {
			update();
		}
	});
};


self.time	= function (newTime, manualSet) {
	self.autoSetLock	= true;
	
	newTime	= newTime === 0 ? 1 : newTime;

	if (newTime) {
		self.mute(true);
		self.player.seekTo(newTime, true);
	}

	self.newTime			= newTime || self.player.getCurrentTime() || self.newTime;
	self.newTimeProcessed	= self.processTime(self.newTime);

	self.updatePlayer(manualSet);
	self.mute(false);

	return self.newTime;
};


self.updatePlayer	= function (manualSet) {
	if (manualSet && self.isPlaying != undefined && self.newTime && self.currentTrack) {
		self.playerUpdated	= Date.now();

		datastore.user().nowPlaying.set({
			isPlaying: self.isPlaying,
			lastChange: self.playerUpdated,
			manualSet: true,
			time: self.newTime,
			track: self.currentTrack
		});

		datastore.user().nowPlayingChild.manualSet.set(false);
	}


	var oldTime	= ui.slider.getValue();
	if (Math.abs(self.newTime - oldTime) >= 2 || self.newTime > oldTime) {
		ui.slider.removeEventListener(goog.ui.Component.EventType.CHANGE, ui.slider.onchange);
		ui.slider.animatedSetValue(self.newTime);
		ui.slider.addEventListener(goog.ui.Component.EventType.CHANGE, ui.slider.onchange);
	}

	var length	= self.length();
	var track	= datastore.data.track[self.currentTrack];
	self.currentTrack && track && length && track.length != length && datastore.track(self.currentTrack).length.set(length);
	ui.slider.setMaximum(length);


	ui.update();

	self.newTime && datastore.user().nowPlayingChild.time.setOnDisconnect(self.newTime);
	self.autoSetLock	=  false;
};


self.volume	= function (newVolume) {
	if (!window.isNaN(newVolume)) {
		self.player.setVolume(newVolume);
	}

	return self.player.getVolume();
};




};
