goog.provide('datastore');


var datastore	= new function () {




/**
* @namespace Datastore
*/
var self	= this;




/**
* @field
* @property {object}
*/
var data;

/**
* @field
* @property {Firebase}
*/
var root;




/**
* @function
* @property {Firebase}
* @param {string} id (Optional; global group by default)
*/
var group;

/**
* @function
* @property {Firebase}
*/
var lastPlayed;

/**
* @function
* @property {Firebase}
* @param {string} id
*/
var track;

/**
* @function
* @property {Firebase}
* @param {string} id (Optional; current user by default)
*/
var user;




self.data	= {
	group: {},
	lastPlayed: {},
	track: {},
	user: {}
};

self.data.user[authentication.userid]	= {
	following: [],
	groups: {},
	hotlist: {},
	isOnline: true,
	library: {},
	nowPlaying: {
		/* Defaults to rickroll if user is new or otherwise has no value set here */
		isPlaying: false,
		lastChange: 0,
		manualSet: true,
		time: 10,
		track: '6s3m5w303h62573j214g5y84h3b42692364435w5e1q2p534ba9n7150s1b'
	},
	transfers: {},
	username: authentication.username
};

self.data.user.current	= self.data.user[authentication.userid];


self.root	= new Firebase('https://napsterfm.firebaseio.com/');




self.group	= function (id) {
	id	= (id || 0).toString();

	var group	= self.root.child('group').child(id);

	group.members	= group.child('members');
	group.member	= function (id) {
		id	= id.toString();
		return group.members.child(id);
	};
	
	group.messages	= group.child('messages');
	group.message	= function (id) {
		id	= id.toString();

		var message	= group.messages.child(id);

		message.author	= message.child('author');
		message.created	= message.child('created');
		message.text	= message.child('text');
		
		return message;
	};

	group.name		= group.child('name');

	return group;
};


self.lastPlayed	= function () {
	return self.root.child('lastPlayed');
};


self.track	= function (id) {
	id	= id.toString();

	var track	= self.root.child('track').child(id);

	track.artist		= track.child('artist');
	track.genre			= track.child('genre');
	track.lastPlayed	= track.child('lastPlayed');
	track.lastPlayedBy	= track.child('lastPlayedBy');
	track.length		= track.child('length');
	track.playCount		= track.child('playCount');
	track.title			= track.child('title');
	track.year			= track.child('year');
	track.youtubeid		= track.child('youtubeid');
	track.youtubeviews	= track.child('youtubeviews');

	return track;
};


self.user	= function (id) {
	id	= (id || authentication.userid).toString();

	var user	= self.root.child('user').child(id);

	user.groups	= user.child('groups');
	user.group	= function (id) {
		id	= id.toString();
		return user.groups.child(id);
	};
	
	user.following		= user.child('following');
	
	user.hotlist		= user.child('hotlist');
	user.hotlistMember	= function (id) {
		id	= id.toString();
		return user.hotlist.child(id);
	};

	user.isOnline		= user.child('isOnline');
	
	user.nowPlaying			= user.child('nowPlaying');
	user.nowPlayingChild	= {
		isPlaying: user.nowPlaying.child('isPlaying'),
		lastChange: user.nowPlaying.child('lastChange'),
		manualSet: user.nowPlaying.child('manualSet'),
		time: user.nowPlaying.child('time'),
		track: user.nowPlaying.child('track')
	};
	
	user.library		= user.child('library');
	user.libraryTrack	= function (id) {
		id	= id.toString();
		return user.library.child(id);
	};

	user.transfers	= user.child('transfers');
	user.transfer	= function (id) {
		id	= id.toString();

		var transfer	= user.transfers.child(id);

		transfer.from	= transfer.child('from');
		transfer.track	= transfer.child('track');
		
		return transfer;
	};

	user.username		= user.child('username');

	return user;
};




};
