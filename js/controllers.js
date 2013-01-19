goog.provide('controllers');


angular.module('Napster', []).controller('Controller', ['$scope', function ($scope) {
	$scope.authentication	= authentication;
	$scope.datastore		= datastore;
	$scope.services			= services;
	$scope.stream			= stream;
	$scope.ui				= ui;


	var user	= datastore.data.user.current;


	if (!authentication.token) {
		return;
	}


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
		datastore.lastPlayed[newData.name()]	= datastore.data.track[trackid];
	});

	datastore.user().following.on('value', function (newData) {
		var userid	= newData.val();
		authentication.getUsername(userid, function (username) {
			user.following	= [userid, username];
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
		authentication.getUsername(userid, function (username) {
			user.hotlist[userid]	= username;
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
		var trackid	= newData.val().track;
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
		authentication.getUsername(userid, function (username) {
			user.transfers[key].from	= [userid, username];
		});
	});
}]);
