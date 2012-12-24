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
* @property {void} Searches music streams
* @param {string} title
* @param {string} artist
* @param {int} index Used for managing asynchronous execution
* @param {function} callback
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
	var nextDefer	= new goog.async.Deferred();

	self.metadata(query, artist, function (metadataResults, metadataDefers) {
		var defer	= goog.async.DeferredList.gatherResults(metadataDefers);

		for (var i = 0 ; i < metadataResults.length ; ++i) {
			var metadataResult	= metadataResults[i];

			self.stream(metadataResult.title, metadataResult.artist, i, function (streamResult, i) {
				metadataDefers[i].callback(streamResult, i);
			});
		}

		defer.addCallback(function (results) {
			results.forEach(function (streamResult, i) {
				var metadataResult	= metadataResults[i];

				metadataResult.id		= streamResult.id;
				metadataResult.views	= streamResult.views;
				metadataResult.length	= streamResult.length;
			});

			nextDefer.callback(metadataResults.findAll(function (o) { return o.id; }).sortBy(function (o) { return o.views; }, true));
		});
	});

	return nextDefer;
};


self.stream	= function (title, artist, index, callback) {
	new goog.net.Jsonp('http://gdata.youtube.com/feeds/api/videos').send({
			callback: 'callback',
			alt: 'json-in-script',
			v: 2,
			q: '{0} {1} lyrics -parody'.assign({0: title, 1: artist})
		},
		function (response) {
			if (!response.feed.entry) {
				return callback({}, index);
			}

			var result	= response.feed.entry[0];
			var id		= result.id.$t.split('video:')[1];
			var views	= response.feed.entry[0].yt$statistics.viewCount.toNumber();
			var length	= result.media$group.media$content[0].duration;

			callback({id: id, views: views, length: length}, index);
		}
	);
};




};
