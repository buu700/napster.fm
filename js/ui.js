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

goog.provide('napster.ui');


var ui	= new function () {




/**
* @namespace UI
*/
var self	= this;



/**
* @field
* @property {string}
*/
var libraryEmptyClass;

/**
* @field
* @property {Humane}
*/
var notifier;

/**
* @field
* @property {string}
*/
var playButtonClass;

/**
* @field
* @property {string}
*/
var readyClass;

/**
* @field
* @property {string}
*/
var repeatButtonClass;

/**
* @field
* @property {string}
*/
var searchNoResultsClass;

/**
* @field
* @property {string}
*/
var shuffleButtonClass;

/**
* @field
* @property {string}
*/
var tempUserClass;

/**
* @field
* @property {goog.ui.Slider}
*/
var slider;




/**
* @function
* @property {void} Initialises this namespace
*/
var init;

/**
* @function
* @property {string} Returns password typed into login page
*/
var loginPassword;

/**
* @function
* @property {string} Returns username typed into login page
*/
var loginUsername;

/**
* @function
* @property {void} Displays a non-interactive Growl-style notification to user
* @param {string} message
*/
var notify;

/**
* @function
* @property {void} Switches notReady loading screen from #home to #about
*/
var notReadyAbout;

/**
* @function
* @property {void} Runs after update
*/
var postUpdate;

/**
* @function
* @property {void} Scrolls to bottom of page
*/
var scrollToBottom;

/**
* @function
* @property {void} Updates UI
*/
var update;




self.notifier	= humane.create({timeout: 2500});




self.init	= function () {
	window.onhashchange	= function () {
		var hashArgs	= window.location.hash.split('/');
		var location	= hashArgs[0];
		var trackid		= hashArgs[1];

		/* Google AJAX crawling handler */
		if (location.startsWith('#!')) {
			window.location.hash	= '#' + window.location.hash.substring(2);
			return;
		}


		var setActive	= function (selector, attribute, target) {
			$(selector).each(function ($elem) {
				goog.dom.classes.enable(target ? target($elem) : $elem, 'active', $elem.getAttribute(attribute) == location);
			});
		};

		setActive('#navbar a', 'href', function ($elem) { return $elem.parentNode; });
		setActive('[hash-location]', 'hash-location');

		if (trackid) {
			var wait		= new goog.async.ConditionalDelay(function () { return stream.isReady && !stream.loadTrackLock; });
			wait.onSuccess	= function () {
				stream.loadTrack(trackid, undefined, true);
			};
			wait.start(0, 5000);
		}
	};

	if (window.location.hash) {
		window.onhashchange();
	}
	else {
		window.location.hash	= $('.navbar li.active')[0].getChildren()[0].getAttribute('href');
	}


	/*** Make all tables sortable ***/
	$('table:not(.nosort)').each(function ($elem) {
		var tableSorter	= new goog.ui.TableSorter();
		tableSorter.setDefaultSortFunction(goog.ui.TableSorter.alphaSort);
		tableSorter.decorate($elem);
	});


	/*** Player ***/
	self.slider	= new goog.ui.Slider();

	self.slider.setHandleMouseWheel(true);
	self.slider.setMoveToPointEnabled(true);
	self.slider.onchange	= function () {
		stream.time(self.slider.getValue(), true);
	};

	window.setInterval(function () {
		if (!self.slider.valueJustChanged && !stream.autoSetLock && stream.isPlaying) {
			stream.time();
		}
	}, 500);

	window.setTimeout(function () { self.slider.decorate($('#player .slider')[0]); }, 1000);



	/* Open all links to external resources in new tabs */
	$('a[href^="//"]').each(function ($elem) { $elem.setProperties({'target': '_blank'}); });


	/*** onenterpress attribute handler ***/
	$('[onenterpress]').each(function ($elem) {
		goog.events.listen($elem, goog.events.EventType.KEYPRESS, function(e) {
			if (e.keyCode == goog.events.KeyCodes.ENTER && !e.shiftKey) {
				var onenterpress	= this.getAttribute('onenterpress');
				/* N.B. do not change eval to window.eval; otherwise, 'this' within onenterpress code will point to window */
				if (onenterpress) {
					eval(onenterpress);
					e.preventDefault();
				}

			}
		});
	});
};

self.loginPassword	= function () {
	return $('#login-password')[0].value;
};

self.loginUsername	= function () {
	return $('#login-username')[0].value;
};

self.notify	= function (message) {
	self.notifier.log(message);
};

self.notReadyAbout	= function () {
	goog.dom.classes.add($('[hash-location="#home"]')[0], 'notready-about');
};

self.scrollToBottom	= function () {
	window.scrollTo(0, document.body.scrollHeight);

	var $footer	= $('#footer')[0];
	var flash	= 'flash';
	goog.dom.classes.remove($footer, flash);
	window.setTimeout(function () { goog.dom.classes.add($footer, flash); }, 10);
};

self.update	= function () {
	self.libraryEmptyClass		= goog.object.getCount(datastore.data.user.current.library) ? '' : 'active';
	self.playButtonClass		= stream.isPlaying ? 'icon-pause' : 'icon-play';
	self.readyClass				= !window.isNaN(stream.newTime) && !services.isSearchInProgress ? 'ready' : '';
	self.repeatButtonClass		= stream.isRepeating ? 'active' : '';
	self.searchNoResultsClass	= services.searchResults && services.searchResults.length ? '' : 'active';
	self.shuffleButtonClass		= stream.isShuffling ? 'active' : '';
	self.tempUserClass			= self.tempUserClass || (authentication.username && authentication.username.startsWith('temporary-account-') ? 'temp-user' : '');

	goog.object.forEach(datastore.data.user.current.library, function (o) {
		o.nowPlayingClass	= o.id == stream.currentTrack ? 'now-playing' : '';
	});

	var $following	= $('#following')[0];
	if ($following != $(document).getActiveElement()) {
		var following		= datastore.data.user.current.following[1];
		$following.value	= (!following || following == authentication.username) ? '' : following;
	}

	/* Enable href in non-a and non-link elements */
	$('[href]:not(a):not(link):not(.href-enabled)').each(function ($elem) {
		goog.dom.classes.add($elem, 'href-enabled');
		goog.events.listen($elem, goog.events.EventType.CLICK, function(e) {
			document.location	= this.getAttribute('href');
		});
	});

	self.postUpdate && self.postUpdate();
};




};
