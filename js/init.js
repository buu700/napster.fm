/* Slow load constants */
var slowCookie		= 'napsterfm-slow';
var slowCookieOn	= 'on';
var slowClass		= 'active';
var slowSelector	= '#page-loading-slow'


/* Slow load handling */
if (goog.net.cookies.get(slowCookie) == slowCookieOn) {
	goog.dom.classes.add($(slowSelector)[0], slowClass);
}


/* NotReady loading screen handling */
if (window.location.hash.startsWith('#about')) {
	ui.notReadyAbout();
}


/* Init application code */
controllers.init();
authentication.init();
datastore.init();
ui.init();
stream.init();
chat.init();


/* Fallback in case YouTube/Firebase fails to load something */
window.setTimeout(function () {
	if (!stream.isReady) {
		/* Handles possible edge case of bad state */
		if (goog.net.cookies.get(slowCookie) == slowCookieOn) {
			goog.net.cookies.clear();
		}

		goog.net.cookies.set(slowCookie, slowCookieOn);
		document.location.reload(true);
	}
	else {
		goog.net.cookies.remove(slowCookie);
	}
}, 15000);


/* Google Analytics */
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-25158938-3']);
_gaq.push(['_trackPageview']);

(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
