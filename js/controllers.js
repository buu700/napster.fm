var Napster	= function ($scope) {
	$scope.authentication	= authentication;
	$scope.datastore		= datastore;
	$scope.services			= services;


	if (!authentication.token) {
		return;
	}


	var fnValueCache	= {};
	var fnValue			= function (dataLocation, key, cacheKey) {
		var fn	= function (newData) { dataLocation[key] = newData.val(); $scope.$apply(); };
		fnValueCache[cacheKey]	= fnValueCache[cacheKey] || fn;
		return cacheKey ? fnValueCache[cacheKey] : fn;
	};

	var fnChildAddedCache	= {};
	var fnChildAdded		= function (dataLocation, cacheKey) {
		var fn	= function (newData) { dataLocation[newData.name()] = newData.val(); $scope.$apply(); };
		fnChildAddedCache[cacheKey]	= fnChildAddedCache[cacheKey] || fn;
		return cacheKey ? fnChildAddedCache[cacheKey] : fn;
	};

	var trackKeys	= function (o) { return goog.object.getKeys(o).exclude('processed'); };


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

		user.library			= user.library || {};
		user.library.processed	= user.library.processed || {};
		trackKeys(user.library).forEach(function (key) {
			var trackid		= user.library[key];
			var cacheKey	= 'track' + trackid;

			datastore.track(trackid).off('value', fnValue(datastore.data.track, trackid, cacheKey));
			datastore.track(trackid).on('value', function (track) {
				fnValue(datastore.data.track, trackid, cacheKey)(track);
				user.library.processed[trackid]	= track.val();
			});
		});

		datastore.data.user.current	= user;
		$scope.$apply();
	});
};
