var domHelpers	= Object.keys(goog.dom).filter(function (key) { return !key.has('_') && typeof goog.dom[key] === 'function'; });

var $	= function (selector) {
	var elements	= goog.dom.query(selector);

	domHelpers.forEach(function (key) {
		for( var i = 0 ; i < elements.length ; ++i ) {
			elements[i][key]	= goog.dom[key].fill(elements[i]);
		}

		elements[key]	= elements[0][key];
	});

	return elements;
};

domHelpers.forEach(function (key) {
	$[key]	= goog.dom[key];
});
