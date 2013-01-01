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


	datastore.lastPlayed().limit(500).on('child_added', fnChildAdded(datastore.data.lastPlayed));

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

		for (var key in user.library) {
			var track		= user.library[key];
			var cacheKey	= 'track' + track;
			datastore.track(track).off('value', fnValue(datastore.data.track, track, cacheKey));
			datastore.track(track).on('value', fnValue(datastore.data.track, track, cacheKey));
		}

		datastore.data.user.current	= user;
		$scope.$apply();
	});
};
