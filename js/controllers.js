goog.provide('controllers');

goog.require('require.goog');


angular.module('Napster', []).controller('Controller', ['$scope', function ($scope) {
	$scope.authentication	= authentication;
	$scope.datastore		= datastore;
	$scope.services			= services;
	$scope.stream			= stream;
	$scope.ui				= ui;


	if (!authentication.token) {
		return;
	}



	/* https://coderwall.com/p/ngisma */
	$scope.safeApply = function(fn) {
		var phase = $scope['$root']['$$phase'];

		if (phase == '$apply' || phase == '$digest') {
			fn && (typeof(fn) === 'function') && fn();
		}
		else {
			$scope.$apply(fn);
		}
	};

	var updateUI	= ui.update;
	ui.update		= function (fn) {
		updateUI();
		$scope.safeApply(fn);
	};



	var fnValueCache	= {};
	var fnValue			= function (dataLocation, key, cacheKey) {
		var fn	= function (newData) { dataLocation[key] = newData.val(); ui.update(); };
		fnValueCache[cacheKey]	= fnValueCache[cacheKey] || fn;
		return fnValueCache[cacheKey];
	};

	var fnChildAddedCache	= {};
	var fnChildAdded		= function (dataLocation, cacheKey) {
		var fn	= function (newData) { dataLocation[newData.name()] = newData.val(); ui.update(); };
		fnChildAddedCache[cacheKey]	= fnChildAddedCache[cacheKey] || fn;
		return fnChildAddedCache[cacheKey];
	};

	var trackKeys	= function (o) { return goog.object.getKeys(o).exclude('processed').filter(function (s) { return typeof(o[s]) == 'string'; }); };


	datastore.lastPlayed().limit(500).on('child_added', function (newData) {
		fnChildAdded(datastore.data.lastPlayed)(newData);

		trackKeys(datastore.data.lastPlayed).forEach(function (key) {
			var trackid		= datastore.data.lastPlayed[key];
			var cacheKey	= 'track' + trackid;

			datastore.track(trackid).off('value', fnValue(datastore.data.track, trackid, cacheKey));
			datastore.track(trackid).on('value', function (track) {
				fnValue(datastore.data.track, trackid, cacheKey)(track);
				datastore.data.lastPlayed.processed[trackid]	= track.val();
			});
		});
	});

	datastore.user().on('value', function (newData) {
		fnValue(datastore.data.user, authentication.userid)(newData);

		var user	= datastore.data.user[authentication.userid];

		if (user.isOnline == false) {
			datastore.user().isOnline.set(true);
			return;
		}
		
		for (var key in user.groups) {
			var group		= user.groups[key];
			var cacheKey	= 'group' + group;
			var cacheKeys	= {members: cacheKey + 'members', messages: cacheKey + 'messages', name: cacheKey + 'name'};

			var members		= datastore.group(group).members().limit(500);
			var messages	= datastore.group(group).messages().limit(500);
			var name		= datastore.group(group).name;

			datastore.data.group[key]	= datastore.data.group[key] || {members: {}, messages: {}, name: ''};

			members.off('child_added', fnChildAdded(datastore.data.group[group].members, cacheKeys.members));
			members.on('child_added', fnChildAdded(datastore.data.group[group].members, cacheKeys.members));
			messages.off('child_added', fnChildAdded(datastore.data.group[group].messages, cacheKeys.messages));
			messages.on('child_added', fnChildAdded(datastore.data.group[group].messages, cacheKeys.messages));
			name.off('value', fnValue(datastore.data.group[group], 'name', cacheKeys.name));
			name.on('value', fnValue(datastore.data.group[group], 'name', cacheKeys.name));
		}

		/* TODO: Factor this out; the logic will be needed elsewhere */
		user.library			= user.library || {};
		user.library.processed	= user.library.processed || {};
		trackKeys(user.library).map(function (key) { return user.library[key]; }).add(user.nowPlaying.track).unique().compact().forEach(function (trackid) {
			var cacheKey	= 'track' + trackid;

			datastore.track(trackid).off('value', fnValue(datastore.data.track, trackid, cacheKey));
			datastore.track(trackid).on('value', function (track) {
				fnValue(datastore.data.track, trackid, cacheKey)(track);
				
				var processedTrack			= track.val();
				processedTrack.id			= trackid;
				processedTrack.length		= stream.processTime(processedTrack.length);
				processedTrack.lastPlayed	= new Date(processedTrack.lastPlayed).format('{12hr}{tt}, {yyyy}-{MM}-{dd}');

				authentication.getUsername(processedTrack.lastPlayedBy, function (username) {
					processedTrack.lastPlayedBy		= username;

					processedTrack.nowPlayingClass	= '';
					if (processedTrack.id == (stream.currentTrack || user.nowPlaying.track)) {
						processedTrack.nowPlayingClass	= 'now-playing';
						user.nowPlayingProcessed		= processedTrack;
					}

					user.library.processed[trackid]	= processedTrack;
					ui.update();

					if (stream.player.stopVideo && !window.libraryIsLoaded) {
						window.libraryIsLoaded	= true;
						stream.sync();
					}
				});
			});
		});

		datastore.data.user.current	= user;
		window.datastoreIsReady		= true;
		ui.update();
	});
}]);
