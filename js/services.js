var services	= new function () {




/**
* @namespace Services
*/
var self	= this;




/**
* @function
* @property {void} Searches music metadata
* @param {string} query
* @param {string} artist
* @param {function} callback
*/
var metadata;

/**
* @function
* @property {goog.async.Deferred} Performs integrated end-to-end query
* @param {string} query
* @param {string} artist
*/
var search;

/**
* @function
* @property {goog.async.Deferred} Searches music streams
* @param {string} title
* @param {string} artist
*/
var stream;




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

	self.metadata(query, artist, function (metadataResults, metadataDefers) {
		for (var i = 0 ; i < metadataResults.length ; ++i) {
			var metadataResult	= metadataResults[i];
			var metadataDefer	= metadataDefers[i];
			self.stream(metadataResult.title, metadataResult.artist).addCallback(function (streamResult) {
				metadataResult.id		= streamResult.id;
				metadataResult.views	= streamResult.views;
				metadataResult.length	= streamResult.length;

				metadataDefer.callback();
			});
		}

		deferList	= new goog.async.DeferredList(metadataDefers);
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




};
