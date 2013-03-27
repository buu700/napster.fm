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


/* Google Analytics */
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-25158938-3']);
_gaq.push(['_trackPageview']);

(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
