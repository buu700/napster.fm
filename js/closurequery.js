Function.prototype.partial	= function () {
	var fn		= this;
	var args	= Array.prototype.slice.call(arguments);
	return function () {
		var arg	= 0;
		for ( var i = 0; i < args.length && arg < arguments.length; ++i ) {
			if ( args[i] === undefined ) {
				args[i]	= arguments[arg++];
			}
		}
		return fn.apply(this, args);
	};
};


var domHelpers	= Object.keys(goog.dom).filter(function (key) { return !key.has('_') && typeof goog.dom[key] === 'function'; });

var $	= function (selector) {
	var elements	= goog.dom.query(selector);

	domHelpers.forEach(function (key) {
		for( var i = 0 ; i < elements.length ; ++i ) {
			elements[i][key]	= goog.dom[key].partial(elements[i]);
		}

		elements[key]	= elements[0][key];
	});

	return elements;
};
