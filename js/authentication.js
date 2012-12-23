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




var _storage;
var _tokenKey			= 'napsterfm-token';
var _useridKey			= 'napsterfm-userid';
var _usernameKey		= 'napsterfm-username';
var _usernameToEmail	= function (username) { return '{0}@firebase.com'.assign({0: username}); };




self.init	= function () {
	_storage		= new goog.net.Cookies(document);

	self.token		= self._storage.get(self._tokenKey);
	self.userid		= self._storage.get(self._useridKey);
	self.username	= self._storage.get(self._usernameKey);

	/* Authenticate on startup when possible */
	if (self.token) {
		datastore.root.auth(self.token);
	}
};


self.login		= function (username, password) {
	var status	= new goog.async.Deferred();

	new FirebaseAuthClient(datastore.root).login('password', self._usernameToEmail(username), password, function (error, token, user) {
		if (!error) {
			self._storage.set(self._tokenKey, token);
			self._storage.set(self._useridKey, user.id);
			self._storage.set(self._usernameKey, username);

			document.location.reload(true);
		}
		else
		{
			status.callback(error);
		}
	});

	return status;
};


self.logout		= function () {
	datastore.root.unauth();

	self._storage.remove(self._tokenKey);
	self._storage.remove(self._useridKey);
	self._storage.remove(self._usernameKey);

	document.location.reload(true);
};


self.createUser		= function (username, password) {
	var status	= new goog.async.Deferred();

	new FirebaseAuthClient(datastore.root).createUser(self._usernameToEmail(username), password, function (error, user) {
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


self.changePassword		= function (username, oldPassword, newPassword) {
	var status	= new goog.async.Deferred();

	new FirebaseAuthClient(datastore.root).changePassword(self._usernameToEmail(username), oldPassword, newPassword, function (error, success) {
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
