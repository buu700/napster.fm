goog.provide('napster.library');


var library	= new function () {




/**
* @namespace Library
*/
var self	= this;

/**
* @field
* @property {string}
*/
var trackToTransfer;




/**
* @function
* @property {void} Accepts specified transfer request
* @param {string} transferid
*/
var acceptTransfer;

/**
* @function
* @property {void} Adds user to Hot List
* @param {string} userid
*/
var addToHotlist;

/**
* @function
* @property {void} Processes input for addToHotlist
* @param {Element} elem
*/
var addToHotlistProcessor;

/**
* @function
* @property {void} Adds track to library
* @param {string} trackid
*/
var addTrack;

/**
* @function
* @property {void} Rejects specified transfer request
* @param {string} transferid
*/
var rejectTransfer;

/**
* @function
* @property {void} Switches active Hot List member
* @param {string} userid
*/
var switchActiveHotlistMember;

/**
* @function
* @property {void} Transfers track to other user
* @param {string} opt_trackid
* @param {string} opt_userid
*/
var transferTrack;




self.trackToTransfer	= null;




self.acceptTransfer	= function (transferid) {
	self.addTrack(datastore.data.user.current.transfers[transferid].track.id);
	datastore.user().transfer(transferid).remove();
	ui.update();
	ui.notify('Accepted transfer');
};

self.addToHotlist	= function (userid) {
	datastore.user().hotlistMember(userid).set(userid);
	ui.update();
};

self.addToHotlistProcessor	= function (elem) {
	var username	= elem.value;

	datastore.username(username).once('value', function (data) {
		var userid	= data.val();

		if (userid != null) {
			self.addToHotlist(userid);
			ui.notify('Added {0} to Hot List'.assign({0: authentication.notificationUsername(username)}));
			elem.value	= null;
		}
		else {
			ui.notify('Invalid username');
		}
	});
};

self.addTrack	= function (trackid) {
	datastore.user().library.push(trackid);

	var wait		= new goog.async.ConditionalDelay(function () { return datastore.data.track[trackid]; });
	wait.onSuccess	= function () {
		ui.notify('Added "{0}" by {1}'.assign({0: datastore.data.track[trackid].title, 1: datastore.data.track[trackid].artist}));
	};
	wait.start(0, 60000);
};

self.rejectTransfer	= function (transferid) {
	datastore.user().transfer(transferid).remove();
	ui.update();
	ui.notify('Rejected transfer');
};

self.switchActiveHotlistMember	= function (userid) {
	datastore.data.activeHotlistMember	= datastore.data.user.current.hotlist[userid];
	ui.update();
};

self.transferTrack	= function (opt_trackid, opt_userid) {
	var trackid	= opt_trackid || self.trackToTransfer;

	if (!opt_userid) {
		self.trackToTransfer	= trackid;
	}
	else {
		self.trackToTransfer	= null;
		datastore.user(opt_userid).transfers.push({from: authentication.userid, track: trackid});
		ui.notify(
			'Transferred "{0}" to {1}'.assign({
				0: datastore.data.track[trackid].title,
				1: authentication.notificationUsername(datastore.data.user.current.hotlist[opt_userid].username)
			})
		);
	}

	ui.update();
};


};
