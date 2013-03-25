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
