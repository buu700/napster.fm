var services	= new function () {




/**
* @namespace Services
*/
var self	= this;




/**
* @field
* @property {string}
*/
var token;

/**
* @field
* @property {int}
*/
var userid;

/**
* @field
* @property {string}
*/
var username;




/**
* @function
* @property {void} Initialises this namespace
*/
var init;

/**
* @function
* @property {goog.async.Deferred}
* @param {string} username
* @param {string} password
*/
var login;

/**
* @function
* @property {void}
*/
var logout;

/**
* @function
* @property {goog.async.Deferred}
* @param {string} username
* @param {string} password
*/
var createUser;

/**
* @function
* @property {goog.async.Deferred}
* @param {string} username
* @param {string} oldPassword
* @param {string} newPassword
*/
var changePassword;




var _tokenKey			= 'napsterfm-token';
var _useridKey			= 'napsterfm-userid';
var _usernameKey		= 'napsterfm-username';
var _usernameToEmail	= function (username) { return '{0}@firebase.com'.assign({0: username}); };




self.init	= function () {
	self.token		= goog.net.cookies.get(_tokenKey);
	self.userid		= goog.net.cookies.get(_useridKey);
	self.username	= goog.net.cookies.get(_usernameKey);

	/* Authenticate on startup when possible */
	if (self.token) {
		datastore.root.auth(self.token);
		datastore.user().isOnline.set(true);
		datastore.user().isOnline.setOnDisconnect(false);
	}
};


self.metadata	= function (query, artist, callback) {
	new goog.net.Jsonp('http://api.discogs.com/database/search').send({
			callback: 'callback',
			type: 'master',
			q: query,
			artist: artist
		},
		function (response) {
			var results	= [];
			var defers	= [];

			response.data.results.forEach(function (result) {
				var fullTitle	= result.title.split('-');
				var title		= fullTitle.slice(1).join('').trim();
				var artist		= fullTitle[0].split('(')[0].trim();
				var genre		= result.genre[0];
				var year		= result.year;

				results.add({title: title, artist: artist, genre: genre, year: year});
				defers.add(new goog.async.Deferred());
			});

			callback(results, defers);
		}
	);
};


self.search	= function (query, artist) {
	var deferList;
	var defer	= new goog.async.Deferred();

	self.metadata(query, artist, function (metadataResults, defers) {
		for (var i = 0 ; i < metadataResults.length ; ++i) {
			var metadataResult	= metadataResults[i];
			self.stream(metadataResult.title, metadataResult.artist).addCallback(function (streamResult) {
				metadataResult.id		= streamResult.id;
				metadataResult.views	= streamResult.views;
				metadataResult.length	= streamResult.length;

				defers[i].callback();
			});
		}

		deferList	= new goog.async.DeferredList(defers);
		deferList.addCallback(function () { defer.callback(metadataResult); });
	});

	return defer;
};


self.stream	= function (title, artist) {
	var defer	= new goog.async.Deferred();

	new goog.net.Jsonp('http://gdata.youtube.com/feeds/api/videos').send({
			callback: 'callback',
			alt: 'json-in-script',
			v: 2,
			q: '{0} {1} lyrics -parody'.assign({0: title, 1: artist})
		},
		function (response) {
			if (!response.feed.entry) {
				return defer.callback({});
			}

			var result	= response.feed.entry.slice(0, 3).last();
			var id		= result.id.$t.split('video:')[1];
			var views	= response.feed.entry[0].yt$statistics.viewCount;
			var length	= result.media$group.media$content[0].duration;

			defer.callback({id: id, views: views, length: length});
		}
	);

	return defer;
};


self.logout	= function () {
	datastore.root.unauth();

	goog.net.cookies.remove(_tokenKey);
	goog.net.cookies.remove(_useridKey);
	goog.net.cookies.remove(_usernameKey);

	document.location.reload(true);
};


self.createUser	= function (username, password) {
	var status	= new goog.async.Deferred();

	new FirebaseAuthClient(datastore.root).createUser(_usernameToEmail(username), password, function (error, user) {
		if (!error) {
			/* TODO: Do something here */
		}
		else
		{
			status.callback(error);
		}
	});

	return status;
};


self.changePassword	= function (username, oldPassword, newPassword) {
	var status	= new goog.async.Deferred();

	new FirebaseAuthClient(datastore.root).changePassword(_usernameToEmail(username), oldPassword, newPassword, function (error, success) {
		if (!error) {
			/* TODO: Do something here */
		}
		else
		{
			status.callback(error);
		}
	});

	return status;
};




};
