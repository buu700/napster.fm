var services	= new function () {




/**
* @namespace Services
*/
var self	= this;




/**
* @function
* @property {void} Searches music metadata
* @param {string} title
* @param {string} artist
* @param {function} callback
*/
var metadata;

/**
* @function
* @property {void} Performs integrated end-to-end query
* @param {string} title
* @param {string} artist
* @param {function} callback
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




self.metadata	= function (title, artist, callback) {
	var request	= {
		callback: 'callback',
		type: 'master',
		q: title
	};

	if (artist) {
		goog.object.add(request, 'artist', artist);
	}

	new goog.net.Jsonp('http://api.discogs.com/database/search').send(request, function (response) {
		var results	= [];
		var defers	= [];

		response.data.results.slice(0, 20).forEach(function (result) {
			var fullTitle	= result.title.split('-');
			var title		= fullTitle.slice(1).join('').trim();
			var artist		= fullTitle[0].split('(')[0].trim();
			var genre		= result.genre[0];
			var year		= result.year;

			var id			= napster.hash(title + artist + year);

			results.add({title: title, artist: artist, genre: genre, year: year, id: id});
			defers.add(new goog.async.Deferred());
		});

		callback(results, defers);
	});
};


self.search	= function (title, artist, callback) {
	self.metadata(title, artist, function (metadataResults, metadataDefers) {
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

				metadataResult.youtubeid	= streamResult.youtubeid;
				metadataResult.youtubeviews	= streamResult.youtubeviews;
				metadataResult.youtubeuser	= streamResult.youtubeuser;
				metadataResult.length		= streamResult.length;
			});

			var fnYoutubeid		= function (o) { return o.youtubeid; };
			var fnYoutubeviews	= function (o) { return o.youtubeviews; };

			callback(metadataResults.findAll(fnYoutubeid).unique(fnYoutubeid).sortBy(fnYoutubeviews, true));
		});
	});
};


self.stream	= function (title, artist, index, callback) {
	new goog.net.Jsonp('http://gdata.youtube.com/feeds/api/videos').send({
			callback: 'callback',
			alt: 'json-in-script',
			v: 2,
			q: '{0} {1} cover'.assign({0: title, 1: artist})
		},
		function (response) {
			if (!response.feed.entry) {
				return callback({}, index);
			}

			var results	= response.feed.entry.map(function (result) {
				var youtubeid		= result.id.$t.split('video:')[1];
				var youtubeuser		= result.author[0].name.$t;
				var youtubeviews	= result.yt$statistics.viewCount.toNumber();
				var length			= result.media$group.media$content[0].duration;

				var permission		= (result.yt$accessControl.find(function (o) { return o.action == 'embed'; }) || {}).permission;
				var state			= result.app$control && result.app$control.yt$state;
				var isEmbeddable	= !(permission != 'allowed' || state);

				return {youtubeid: youtubeid, youtubeuser: youtubeuser, youtubeviews: youtubeviews, length: length, isEmbeddable: isEmbeddable};
			});

			callback(results.find(function (result) { return result.isEmbeddable; }), index);
		}
	);
};




};
