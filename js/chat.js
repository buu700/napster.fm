goog.provide('napster.chat');


var chat	= new function () {




/**
* @namespace Chat
*/
var self	= this;




/**
* @function
* @property {void} Sends message
* @param {string} message
* @param {int} opt_group
*/
var sendMessage;




self.sendMessage	= function (message, opt_group) {
	datastore.group(opt_group).messages.push({author: authentication.userid, created: Date.now(), text: message});
	ui.update();
};


};
