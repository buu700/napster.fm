goog.provide('ui');


var ui	= new function () {




/**
* @namespace UI
*/
var self	= this;




/**
* @field
* @property {string}
*/
var playButtonClass;

/**
* @field
* @property {string}
*/
var repeatButtonClass;

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
* @property {void} Runs after update
*/
var postUpdate;

/**
* @function
* @property {void} Updates UI
*/
var update;




self.init	= function () {
	window.onhashchange	= function () {
		var setActive	= function (selector, attribute, target) {
			var $elements	= $(selector);
			for (var i = 0 ; i < $elements.length ; ++i) {
				var $elem	= $elements[i];
				goog.dom.classes.enable(target ? target($elem) : $elem, 'active', $elem.getAttribute(attribute) == window.location.hash);
			}
		};

		setActive('.navbar a', 'href', function ($elem) { return $elem.parentNode; });
		setActive('[hash-location]', 'hash-location');
	};

	if (window.location.hash) {
		window.onhashchange();
	}
	else {
		window.location.hash	= $('.navbar li.active')[0].getChildren()[0].getAttribute('href');
	}


	/*** Library ***/
	var tableSorter	= new goog.ui.TableSorter();
	tableSorter.setDefaultSortFunction(goog.ui.TableSorter.alphaSort);
	tableSorter.decorate($('#library-table')[0]);


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

	self.slider.decorate($('#player .slider')[0]);


	/*** Following ***/
	goog.events.listen($('#following')[0], goog.events.KeyHandler.EventType.KEY, function(e) {
		if (e.keyCode == goog.events.KeyCodes.ENTER) {
			goog.events.dispatchEvent(this, goog.events.EventType.CHANGE);
		}
	});
};

self.loginPassword	= function () {
	return $('#login-password')[0].value;
};

self.loginUsername	= function () {
	return $('#login-username')[0].value;
};

self.update	= function () {
	self.playButtonClass	= stream.isPlaying ? 'playing' : 'paused';
	self.repeatButtonClass	= stream.isRepeating ? 'active' : '';
	self.shuffleButtonClass	= stream.isShuffling ? 'active' : '';
	self.tempUserClass		= self.tempUserClass || (authentication.username && authentication.username.startsWith('temporary-account-') ? 'temp-user' : '');

	goog.object.forEach(datastore.data.user.current.library, function (o) {
		o.nowPlayingClass	= o.id == stream.currentTrack && 'now-playing';
	});

	if (!window.isNaN(stream.newTime)) {
		$('.loading').each(function ($elem) { goog.dom.classes.remove($elem, 'loading'); });
	}

	var following	= datastore.data.user.current.following[1];
	$('#following')[0].value	= (!following || following == authentication.username) ? '' : following;

	self.postUpdate && self.postUpdate();
};




};
