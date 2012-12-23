var domHelpers	= Object.keys(goog.dom).filter(function (key) { return !key.has('_') && typeof goog.dom[key] === 'function'; });

var $	= function (selector) {
	var elements	= goog.dom.query(selector);

	if (elements.length < 1 && new DOMParser().parseFromString(selector, 'text/xml').getElementsByTagName('parsererror').length < 1) {
		var tempElem		= goog.dom.createElement('div');
		tempElem.innerHTML	= selector;
		elements[0]			= tempElem.firstChild;
	}

	domHelpers.forEach(function (key) {
		for( var i = 0 ; i < elements.length ; ++i ) {
			elements[i][key]	= elements[i][key] || goog.dom[key].fill(elements[i]);
		}

		elements[key]	= elements[0] && elements[0][key];
	});

	return elements;
};

domHelpers.forEach(function (key) {
	$[key]	= goog.dom[key];
});
