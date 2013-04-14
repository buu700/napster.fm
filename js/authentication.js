goog.provide('napster.authentication');


var authentication	= new function () {




/**
* @namespace Authentication
*/
var self	= this;




/**
* @field
* @property {int}
*/
var cookieAge;

/**
* @field
* @property {Firebase}
*/
var datastoreAuthClient;

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
* @property {string} Gets username of specified user
* @param {string} userid
* @param {function} callback
*/
var getUsername;

/**
* @function
* @property {string} Hashes specified text
* @param {string} text
*/
var hash;

/**
* @function
* @property {void}
* @param {string} username
* @param {string} password
* @param {function} callback
*/
var login;

/**
* @function
* @property {void}
*/
var logout;

/**
* @function
* @property {void}
* @param {string} username
* @param {string} password
* @param {function} callback
*/
var createUser;

/**
* @function
* @property {void}
* @param {string} username
* @param {string} oldPassword
* @param {string} newPassword
* @param {function} callback
*/
var changePassword;

/**
* @function
* @property {void}
*/
var createTempUser;

/**
* @function
* @property {string}
* @param {string} username
*/
var usernameToEmail;

/**
* @function
* @property {string} Processes username as necessary for notifications
* @param {string} username
*/
var notificationUsername;

/**
* @function
* @property {string} Notifies user of authentication failure
* @param {FirebaseAuthError} error
*/
var notifyError;




var _tokenKey			= 'napsterfm-token';
var _useridKey			= 'napsterfm-userid';
var _usernameKey		= 'napsterfm-username';




self.init	= function () {
	self.datastoreAuthClient	= new FirebaseAuthClient(datastore.root, function (error, user) {
		if (user && !error) {
			goog.net.cookies.set(_tokenKey, user.firebaseAuthToken, self.cookieAge);
			goog.net.cookies.set(_useridKey, user.id, self.cookieAge);
			goog.net.cookies.set(_usernameKey, user.email.split('@')[0], self.cookieAge);

			if (document.location.hash.startsWith('#login')) {
				document.location	= '/';
			}
			else {
				document.location.reload(true);
			}
		}
		else
		{
			self.notifyError(error);
		}
	});


	self.cookieAge	= 5000000;
	self.token		= goog.net.cookies.get(_tokenKey);
	self.userid		= goog.net.cookies.get(_useridKey);
	self.username	= goog.net.cookies.get(_usernameKey);

	/* Authenticate on startup when possible */
	if (self.token && !['null', 'undefined'].find(self.token)) {
		datastore.root.auth(self.token);
		datastore.user().isOnline.set(true);
		datastore.user().isOnline.onDisconnect().set(false);
		datastore.user().username.set(self.username);
		datastore.username().set(self.userid);
	}
	else
	{
		self.createTempUser();
	}
};


self.hash	= function (text) {
	return new goog.crypt.Hmac(new goog.crypt.Sha256(), 'napster').getHmac(text).map(function (n) { return n.toString(36); }).join('');
};


self.login	= function (username, password, callback) {
	username	= username || ui.loginUsername();
	password	= password || ui.loginPassword();

	self.datastoreAuthClient.login('password', {email: self.usernameToEmail(username), password: password, rememberMe: true});
};


self.logout	= function () {
	goog.net.cookies.clear();
	datastore.root.unauth();
	document.location.reload(true);
};


self.createUser	= function (username, password, callback) {
	username	= username || ui.loginUsername();
	password	= password || ui.loginPassword();
	
	self.datastoreAuthClient.createUser(self.usernameToEmail(username), password, function (error, user) {
		if (!error) {
			self.login(username, password, callback);
		}
		else
		{
			self.notifyError(error);
			callback && callback(error);
		}
	});
};


self.changePassword	= function (username, oldPassword, newPassword, callback) {
	self.datastoreAuthClient.changePassword(self.usernameToEmail(username), oldPassword, newPassword, function (error, success) {
		if (!error) {
			/* TODO: Do something here */
		}
		else
		{
			self.notifyError(error);
			callback && callback(error);
		}
	});
};


self.createTempUser	= function () {
	var username	= 'temporary-account-{0}'.assign({0: Date.now()});
	var password	= 'hunter2';
	
	self.createUser(username, password);
};


self.usernameToEmail	= function (username) {
	return '{0}@firebase.com'.assign({0: username});
};


self.notificationUsername	= function (username) {
	return !username || username == authentication.username ? 'yourself' : username == 'yourself' ? 'a smartass' : username;
};


self.notifyError	= function (error) {
	error && error.message && ui.notify(error.message.replace(/email/g, 'username'));
};




};
