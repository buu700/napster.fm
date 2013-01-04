var ui	= new function () {




/**
* @namespace UI
*/
var self	= this;




/**
* @function
* @property {void} Initialises this namespace
*/
var init;




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

	window.location.hash	= $('.navbar li.active')[0].getChildren()[0].getAttribute('href');
};




};
