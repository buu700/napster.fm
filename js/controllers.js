goog.require('goog.async.ConditionalDelay');
goog.require('goog.async.Deferred');
goog.require('goog.async.DeferredList');
goog.require('goog.crypt.Hmac');
goog.require('goog.crypt.Sha256');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.dom.query');
goog.require('goog.events');
goog.require('goog.events.KeyCodes');
goog.require('goog.events.KeyHandler');
goog.require('goog.net.cookies');
goog.require('goog.net.Jsonp');
goog.require('goog.object');
goog.require('goog.ui.Component');
goog.require('goog.ui.Slider');
goog.require('goog.ui.TableSorter');

goog.provide('napster.controllers');


var controllers	= new function () {




/**
* @namespace Controllers
*/
var self	= this;




/**
* @function
* @property {void} Initialises this namespace
*/
var init;




self.init	= function () {


angular.module('Napster', []).controller('Controller', ['$scope', function ($scope) {
	$scope.authentication	= authentication;
	$scope.chat				= chat;
	$scope.datahelpers		= datahelpers;
	$scope.datastore		= datastore;
	$scope.services			= services;
	$scope.stream			= stream;
	$scope.ui				= ui;


	var user	= datastore.data.user.current;


	/* https://coderwall.com/p/ngisma */
	ui.postUpdate = function(fn) {
		var phase = $scope['$root']['$$phase'];

		if (phase == '$apply' || phase == '$digest') {
			fn && (typeof(fn) === 'function') && fn();
		}
		else {
			$scope.$apply(fn);
		}
	};


	datastore.lastPlayed().limit(500).on('child_added', function (newData) {
		var trackid	= newData.val();
		datahelpers.syncTrack(trackid);
		/* Using newData.name() for key because lastPlayed is ordered data */
		datastore.data.lastPlayed[newData.name()]	= datastore.data.track[trackid];

		datastore.data.lastPlayed.array	= goog.object.getValues(datastore.data.lastPlayed).slice(1).unique().reverse();
	});

	datastore.user().following.on('value', function (newData) {
		var alreadySynced	= user.following[0];
		var userid	= newData.val();
		datastore.user(userid).username.once('value', function (username) {
			user.following	= [userid, username.val()];

			if (alreadySynced && alreadySynced != userid)
			{
				stream.sync(userid);
			}
		});
	});

	datastore.user().groups.on('child_added', function (newData) {
		var groupid	= newData.val();
		datahelpers.syncGroup(groupid);
		user.groups[groupid]	= datastore.data.group[groupid];
	});
	datastore.user().groups.on('child_removed', function (newData) {
		datahelpers.onChildRemoved(user.groups)(newData);
		datahelpers.syncGroup(newData.val(), true);
	});

	datastore.user().hotlist.on('child_added', function (newData) {
		var userid	= newData.val();
		datastore.user(userid).username.once('value', function (username) {
			user.hotlist[userid]	= username.val();
			ui.update();
		});
	});
	datastore.user().hotlist.on('child_removed', datahelpers.onChildRemoved(user.hotlist));
	
	datastore.user().isOnline.on('value', function (newData) {
		if (newData.val() == false) {
			datastore.user().isOnline.set(true);
			ui.update();
		}
	});

	datastore.user().library.on('child_added', function (newData) {
		var trackid	= newData.val();
		datahelpers.syncTrack(trackid);
		user.library[trackid]	= datastore.data.track[trackid];
	});
	datastore.user().library.on('child_removed', function (newData) {
		datahelpers.onChildRemoved(user.library)(newData);
		/* Not stopping track sync in case lastPlayed and library have overlap */
	});

	datastore.user().nowPlaying.on('value', function (newData) {
		var newVal	= newData.val();

		/* Necessary for handling new users */
		if (!newVal || !newVal.track) {
			datastore.data.user.current.nowPlaying.track && datastore.user().nowPlaying.set(datastore.data.user.current.nowPlaying);
			return;
		}

		var trackid	= newVal.track;

		datahelpers.onValue(user, 'nowPlaying')(newData);
		datahelpers.syncTrack(trackid);
		user.nowPlaying.track	= datastore.data.track[trackid];
	});

	datastore.user().transfers.on('child_added', function (newData) {
		var key			= newData.name();
		var transfer	= newData.val();
		var trackid		= transfer.track;
		var userid		= transfer.from;
		datahelpers.onChildAdded(user, 'transfers')(newData);
		datahelpers.syncTrack(trackid);
		user.transfers[key].track	= datastore.data.track[trackid];
		datastore.user(userid).username.once('value', function (username) {
			user.transfers[key].from	= [userid, username.val()];
		});
	});
}]);


};




};
