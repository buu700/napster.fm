var datastore	= new function () {




/**
* @namespace Datastore
*/
var self	= this;




/**
* @field
* @property {object}
*/
var root;




/**
* @function
* @property {object}
* @param {string} id (Optional; global group by default)
*/
var group;

/**
* @function
* @property {object}
* @param {string} id
*/
var track;

/**
* @function
* @property {object}
* @param {string} id (Optional; current user by default)
*/
var user;




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


self.track	= function (id) {
	id	= id.toString();

	var track	= self.root.child('track').child(id);

	track.artist		= track.child('artist');
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
	
	user.hotlist		= user.child('hotlist');
	user.hotlistMember	= function (id) {
		id	= id.toString();
		return user.hotlist.child(id);
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

	return user;
};




};
