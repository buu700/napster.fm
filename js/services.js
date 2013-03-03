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

goog.provide('napster.services');


var services	= new function () {




/**
* @namespace Services
*/
var self	= this;




/**
* @field
* @property {bool}
*/
var isSearchInProgress;

/**
* @field
* @property {array (object)}
*/
var searchResults;




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

		(goog.object.getValueByKeys(response, 'data', 'results') || []).slice(0, 20).forEach(function (result) {
			var fullTitle	= (result.title || '').split('-');
			var title		= fullTitle.slice(1).join('').trim().compact();
			var artist		= fullTitle[0].split('(')[0].trim().compact();
			var genre		= (result.genre || [])[0];
			var year		= result.year;

			var id			= authentication.hash(title + artist + year);

			results.add({title: title, artist: artist, genre: genre, year: year, id: id});
			defers.add(new goog.async.Deferred());
		});

		callback(results, defers);
	});
};


self.processedSearch	= function (title, artist) {
	self.isSearchInProgress	= true;
	ui.update();

	title	= title || $('#search-title')[0].value || '';
	artist	= (artist || $('#search-artist')[0].value || '').trim() || undefined;

	self.searchResults	= [];

	var endSearch	= function () {
		self.isSearchInProgress	= false;
		ui.update();
	};


	if (!title && !artist) {
		endSearch();
		return;
	}


	self.search(title, artist, function (results) {
		results.forEach(function (result, i) {
			var trackid	= result.id;
			datahelpers.syncTrack(trackid);
			self.searchResults[i]	= datastore.data.track[trackid];
		});

		endSearch();
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
				metadataResult.length		= streamResult.length;
			});

			var fnYoutubeid		= function (o) { return o.youtubeid; };
			var fnYoutubeviews	= function (o) { return o.youtubeviews; };

			var finalResults	= metadataResults.findAll(fnYoutubeid).unique(fnYoutubeid).sortBy(fnYoutubeviews, true);

			finalResults.forEach(function (o) {
				var track	= datastore.track(o.id);

				track.update({
					artist: o.artist,
					genre: o.genre,
					length: (o.length || 0).toNumber(),
					title: o.title,
					year: (o.year || 42).toNumber(),
					youtubeid: o.youtubeid,
					youtubeviews: (o.youtubeviews || 0).toNumber()
				});

				var trackData	= datastore.data.track[o.id];
				(trackData && trackData.playCount) || track.update({playCount: 0});
			});

			callback(finalResults);
		});
	});
};


self.stream	= function (title, artist, index, callback) {
	artist	= artist.replace('Various', 'Song');

	var exclude	= function (array) {
		return array.reduce(function (a, b) {
			var s	= b.toLowerCase();
			return a + (!title.toLowerCase().has(s) && !artist.toLowerCase().has(s) ? ' -title:"{0}"'.assign({0: s}) : '');
		}, '');
	};

	new goog.net.Jsonp('http://gdata.youtube.com/feeds/api/videos').send({
			callback: 'callback',
			alt: 'json-in-script',
			v: 2,
			q: '{0} {1} {2}'.assign({0: title, 1: artist, 2: exclude(['parody', 'karaoke', 'dance', 'how to'])})
		},
		function (response) {
			if (!goog.object.getValueByKeys(response, 'feed', 'entry')) {
				return callback({}, index);
			}

			var results	= response.feed.entry.map(function (result) {
				var youtubeid		= (goog.object.getValueByKeys(result, 'id', '$t') || '').split('video:')[1];
				var youtubeviews	= (goog.object.getValueByKeys(result, 'yt$statistics', 'viewCount') || 0).toNumber();
				var length			= goog.object.getValueByKeys(result, 'media$group', 'media$content', 0, 'duration');

				var permission		= ((result.yt$accessControl || {}).find(function (o) { return o.action == 'embed'; }) || {}).permission;
				var state			= goog.object.getValueByKeys(result, 'app$control', 'yt$state');
				var isEmbeddable	= !(permission != 'allowed' || state);

				return {youtubeid: youtubeid, youtubeviews: youtubeviews, length: length, isEmbeddable: isEmbeddable};
			});

			var fnEmbeddable	= function (o) { return o.isEmbeddable; };
			var fnYoutubeviews	= function (o) { return o.youtubeviews; };

			var finalResults	= results.findAll(fnEmbeddable).slice(0, 3).sortBy(fnYoutubeviews, true);

			callback(finalResults[0] || {}, index);
		}
	);
};




};
