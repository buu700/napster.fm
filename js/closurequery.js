goog.provide('closurequery');

goog.require('require.goog');


/**
* @function
* @property {Node} jQuery-like wrapper around goog.dom API (http://closure-library.googlecode.com/svn/docs/closure_goog_dom_dom.js.html)
* @param {string} selector
* @example $('#parent').removeChildren()
* @example $('div.exists').append($('<div class="doesNotYetExist"></div>'))
*/
var $	= function (selector) {
	var elements	= goog.dom.query(selector);
	var isEmpty		= elements.length < 1;

	if (isEmpty && new DOMParser().parseFromString(selector, 'text/xml').getElementsByTagName('parsererror').length < 1) {
		var tempElem		= goog.dom.createElement('div');
		tempElem.innerHTML	= selector;
		elements[0]			= tempElem.firstChild;
	}
	else if (isEmpty) {
		elements[0]	= {};
	}

	$_domHelpers.forEach(function (key) {
		for( var i = 0 ; i < elements.length ; ++i ) {
			elements[i][key]	= elements[i][key] || goog.dom[key].fill(elements[i]);
		}

		elements[key]	= elements[0] && elements[0][key];
	});

	return elements;
};

var $_domHelpers	= goog.object.getKeys(goog.dom).filter(function (key) { return !key.has('_') && typeof goog.dom[key] === 'function'; });

$_domHelpers.forEach(function (key) {
	$[key]	= goog.dom[key];
});
