goog.provide('closurequery');


/**
* @function
* @property {Node} jQuery-like wrapper around goog.dom API (http://closure-library.googlecode.com/svn/docs/closure_goog_dom_dom.js.html)
* @param {string} selector
* @example $('#parent').removeChildren()
* @example $('div.exists').append($('<div class="doesNotYetExist"></div>'))
*/
var $	= function (selector) {
	var elements	= domHelper.query(selector);
	var isEmpty		= elements.length < 1;

	if (isEmpty && new DOMParser().parseFromString(selector, 'text/xml').getElementsByTagName('parsererror').length < 1) {
		var tempElem		= domHelper.createElement('div');
		tempElem.innerHTML	= selector;
		elements[0]			= tempElem.firstChild;
	}
	else if (isEmpty) {
		elements[0]	= {};
	}

	for (var key in domHelper) {
		for (var i = 0 ; i < elements.length ; ++i) {
			elements[i][key]	= elements[i][key] || domHelper[key].fill(elements[i]);
		}

		elements[key]	= elements[0] && elements[0][key];
	}

	return elements;
};


var domHelper		= {
	append: goog.dom.append,
	appendChild: goog.dom.appendChild,
	canHaveChildren: goog.dom.canHaveChildren,
	compareNodeOrder: goog.dom.compareNodeOrder,
	contains: goog.dom.contains,
	createDom: goog.dom.createDom,
	createElement: goog.dom.createElement,
	createTable: goog.dom.createTable,
	createTextNode: goog.dom.createTextNode,
	findCommonAncestor: goog.dom.findCommonAncestor,
	findNode: goog.dom.findNode,
	findNodes: goog.dom.findNodes,
	flattenElement: goog.dom.flattenElement,
	getActiveElement: goog.dom.getActiveElement,
	getAncestor: goog.dom.getAncestor,
	getAncestorByClass: goog.dom.getAncestorByClass,
	getAncestorByTagNameAndClass: goog.dom.getAncestorByTagNameAndClass,
	getChildren: goog.dom.getChildren,
	getCompatMode: goog.dom.getCompatMode,
	getDocument: goog.dom.getDocument,
	getDocumentHeight: goog.dom.getDocumentHeight,
	getDocumentScroll: goog.dom.getDocumentScroll,
	getDocumentScrollElement: goog.dom.getDocumentScrollElement,
	getDomHelper: goog.dom.getDomHelper,
	getElement: goog.dom.getElement,
	getElementByClass: goog.dom.getElementByClass,
	getElementsByClass: goog.dom.getElementsByClass,
	getElementsByTagNameAndClass: goog.dom.getElementsByTagNameAndClass,
	getFirstElementChild: goog.dom.getFirstElementChild,
	getFrameContentDocument: goog.dom.getFrameContentDocument,
	getFrameContentWindow: goog.dom.getFrameContentWindow,
	getLastElementChild: goog.dom.getLastElementChild,
	getNextElementSibling: goog.dom.getNextElementSibling,
	getNextNode: goog.dom.getNextNode,
	getNodeAtOffset: goog.dom.getNodeAtOffset,
	getNodeTextLength: goog.dom.getNodeTextLength,
	getNodeTextOffset: goog.dom.getNodeTextOffset,
	getOuterHtml: goog.dom.getOuterHtml,
	getOwnerDocument: goog.dom.getOwnerDocument,
	getPageScroll: goog.dom.getPageScroll,
	getParentElement: goog.dom.getParentElement,
	getPreviousElementSibling: goog.dom.getPreviousElementSibling,
	getPreviousNode: goog.dom.getPreviousNode,
	getRawTextContent: goog.dom.getRawTextContent,
	getTextContent: goog.dom.getTextContent,
	getViewportSize: goog.dom.getViewportSize,
	getWindow: goog.dom.getWindow,
	htmlToDocumentFragment: goog.dom.htmlToDocumentFragment,
	insertChildAt: goog.dom.insertChildAt,
	insertSiblingAfter: goog.dom.insertSiblingAfter,
	insertSiblingBefore: goog.dom.insertSiblingBefore,
	isCss1CompatMode: goog.dom.isCss1CompatMode,
	isElement: goog.dom.isElement,
	isFocusableTabIndex: goog.dom.isFocusableTabIndex,
	isNodeLike: goog.dom.isNodeLike,
	isNodeList: goog.dom.isNodeList,
	isWindow: goog.dom.isWindow,
	query: goog.dom.query,
	removeChildren: goog.dom.removeChildren,
	removeNode: goog.dom.removeNode,
	replaceNode: goog.dom.replaceNode,
	setFocusableTabIndex: goog.dom.setFocusableTabIndex,
	setProperties: goog.dom.setProperties,
	setTextContent: goog.dom.setTextContent
};


for (var key in domHelper) {
	$[key]	= domHelper[key];
}
