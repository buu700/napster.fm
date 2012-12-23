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
var _tokenKey		= 'napsterfm-token';

/**
* @field
* @property {int}
*/
var userid;
var _useridKey		= 'napsterfm-userid';

/**
* @field
* @property {string}
*/
var username;
var _usernameKey	= 'napsterfm-username';
var _usernameToEmail	= function (username) { return '{0}@firebase.com'.assign({0: username}); };




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




self.token		= goog.storage.Storage.get(self._tokenKey);
self.userid		= goog.storage.Storage.get(self._useridKey);
self.username	= goog.storage.Storage.get(self._usernameKey);




self.login		= function (username, password) {
	var status	= new goog.async.Deferred();

	new FirebaseAuthClient(datastore.root).login('password', self._usernameToEmail(username), password, function (error, token, user) {
		if (!error) {
			goog.storage.Storage.set(self._tokenKey, token);
			goog.storage.Storage.set(self._useridKey, user.id);
			goog.storage.Storage.set(self._usernameKey, username);

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

	goog.storage.Storage.remove(self._tokenKey);
	goog.storage.Storage.remove(self._useridKey);
	goog.storage.Storage.remove(self._usernameKey);

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




/* Authenticate on startup */
if (self.token) {
	datastore.root.auth(self.token);
}




};
