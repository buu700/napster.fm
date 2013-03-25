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

goog.provide('napster.init');

goog.require('napster.exports');

controllers.init();
authentication.init();
datastore.init();
ui.init();
stream.init();
chat.init();


/* Fallback in case Firebase fails to load something */
window.setTimeout(function () {
	if (!ui.readyClass) {
		document.location.reload(true);
	}
}, 60000);
