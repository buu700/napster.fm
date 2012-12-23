var authentication	= new function () {




/**
* @namespace Authentication
*/
var self	= this;




/**
* @field
* @property {string}
*/
var token;

/**
* @field
* @property {int}
*/
var userid;

/**
* @field
* @property {string}
*/
var username;




/**
* @function
* @property {void} Initialises this namespace
*/
var init;

/**
* @function
* @property {goog.async.Deferred}
* @param {string} username
* @param {string} password
*/
var login;

/**
* @function
* @property {void}
*/
var logout;

/**
* @function
* @property {goog.async.Deferred}
* @param {string} username
* @param {string} password
*/
var createUser;

/**
* @function
* @property {goog.async.Deferred}
* @param {string} username
* @param {string} oldPassword
* @param {string} newPassword
*/
var changePassword;




var _tokenKey			= 'napsterfm-token';
var _useridKey			= 'napsterfm-userid';
var _usernameKey		= 'napsterfm-username';
var _usernameToEmail	= function (username) { return '{0}@firebase.com'.assign({0: username}); };




self.init	= function () {
	self.token		= goog.net.cookies.get(_tokenKey);
	self.userid		= goog.net.cookies.get(_useridKey);
	self.username	= goog.net.cookies.get(_usernameKey);

	/* Authenticate on startup when possible */
	if (self.token) {
		datastore.root.auth(self.token);
		datastore.user().isOnline.set(true);
		datastore.user().isOnline.setOnDisconnect(false);
	}
};


self.login	= function (username, password) {
	var status	= new goog.async.Deferred();

	new FirebaseAuthClient(datastore.root).login('password', _usernameToEmail(username), password, function (error, token, user) {
		if (!error) {
			goog.net.cookies.set(_tokenKey, token);
			goog.net.cookies.set(_useridKey, user.id);
			goog.net.cookies.set(_usernameKey, username);

			document.location.reload(true);
		}
		else
		{
			status.callback(error);
		}
	});

	return status;
};


self.logout	= function () {
	datastore.root.unauth();

	goog.net.cookies.remove(_tokenKey);
	goog.net.cookies.remove(_useridKey);
	goog.net.cookies.remove(_usernameKey);

	document.location.reload(true);
};


self.createUser	= function (username, password) {
	var status	= new goog.async.Deferred();

	new FirebaseAuthClient(datastore.root).createUser(_usernameToEmail(username), password, function (error, user) {
		if (!error) {
			/* TODO: Do something here */
		}
		else
		{
			status.callback(error);
		}
	});

	return status;
};


self.changePassword	= function (username, oldPassword, newPassword) {
	var status	= new goog.async.Deferred();

	new FirebaseAuthClient(datastore.root).changePassword(_usernameToEmail(username), oldPassword, newPassword, function (error, success) {
		if (!error) {
			/* TODO: Do something here */
		}
		else
		{
			status.callback(error);
		}
	});

	return status;
};




};
