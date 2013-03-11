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
goog.require('goog.net.cookies');
goog.require('goog.net.Jsonp');
goog.require('goog.object');
goog.require('goog.ui.Component');
goog.require('goog.ui.Slider');
goog.require('goog.ui.TableSorter');

goog.provide('napster.library');


var library	= new function () {




/**
* @namespace Library
*/
var self	= this;




/**
* @function
* @property {void} Adds track to library
* @param {string} trackid
*/
var addTrack;




self.addTrack	= function (trackid) {
	datastore.user().library.push(trackid);

	var wait		= new goog.async.ConditionalDelay(function () { return datastore.data.track[trackid]; });
	wait.onSuccess	= function () {
		ui.notify('Added "{0}" by {1}'.assign({0: datastore.data.track[trackid].title, 1: datastore.data.track[trackid].artist}));
	};
	wait.start(0, 60000);
};


};
