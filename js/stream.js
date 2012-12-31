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
* @property {void} Loads track in player
* @param {string} track
*/
var loadTrack;




self.init	= function () {
	window.onYouTubePlayerReady = function () { stream.player = $('#streamPlayer')[0]; };

	swfobject.embedSWF(
		'http://www.youtube.com/apiplayer?enablejsapi=1&version=3',
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


self.loadTrack	= function (track) {
	self.player.loadVideoById(track);
	datastore.track(track).lastPlayed.set(authentication.userid);
};




};
