var models = require('../models');
var User = models.User;
var utility = require('utility');

/**
 *  Find a list of users based on the user name list 
 * Callback:
 * - err,  Database Exceptions 
 * - users,  User List 
 * @param {Array} names  User Name List 
 * @param {Function} callback  The callback function 
 */
exports.getUsersByNames = function (names, callback) {
  if (names.length === 0) {
    return callback(null, []);
  }
  User.find({ loginname: { $in: names } }, callback);
};

/**
 *  Find a user based on the login name 
 * Callback:
 * - err,  Database Exceptions 
 * - user,  User 
 * @param {String} loginName  Login Name 
 * @param {Function} callback  The callback function 
 */
exports.getUserByLoginName = function (loginName, callback) {
  User.findOne({'loginname': loginName}, callback);
};

/**
 *  According to  User ID， Find  User 
 * Callback:
 * - err,  Database Exceptions 
 * - user,  User 
 * @param {String} id  User ID
 * @param {Function} callback  The callback function 
 */
exports.getUserById = function (id, callback) {
  User.findOne({_id: id}, callback);
};

/**
 *  According to  Mailbox ， Find  User 
 * Callback:
 * - err,  Database Exceptions 
 * - user,  User 
 * @param {String} email  Mailbox  Address 
 * @param {Function} callback  The callback function 
 */
exports.getUserByMail = function (email, callback) {
  User.findOne({email: email}, callback);
};

/**
 *  According to  User ID List ， Get a group of  User 
 * Callback:
 * - err,  Database Exceptions 
 * - users,  User List 
 * @param {Array} ids  User ID List 
 * @param {Function} callback  The callback function 
 */
exports.getUsersByIds = function (ids, callback) {
  User.find({'_id': {'$in': ids}}, callback);
};

/**
 *  According to  Keyword ， Get a group of  User 
 * Callback:
 * - err,  Database Exceptions 
 * - users,  User List 
 * @param {String} query  Keyword 
 * @param {Object} opt  Options 
 * @param {Function} callback  The callback function 
 */
exports.getUsersByQuery = function (query, opt, callback) {
  User.find(query, '', opt, callback);
};

/**
 *  According to  Query conditions ， Get a  User 
 * Callback:
 * - err,  Database Exceptions 
 * - user,  User 
 * @param {String} name  User  Name 
 * @param {String} key  Activation 
 * @param {Function} callback  The callback function 
 */
exports.getUserByNameAndKey = function (loginname, key, callback) {
  User.findOne({loginname: loginname, retrieve_key: key}, callback);
};

exports.newAndSave = function (name, loginname, pass, email, avatar_url, active, callback) {
  var user = new User();
  user.name = loginname;
  user.loginname = loginname;
  user.pass = pass;
  user.email = email;
  user.avatar = avatar_url;
  user.active = active || false;
  user.save(callback);
};

var makeGravatar = function (email) {
  return 'http://www.gravatar.com/avatar/' + utility.md5(email.toLowerCase()) + '?size=48';
};
exports.makeGravatar = makeGravatar;

exports.getGravatar = function (user) {
  return user.avatar || makeGravatar(user);
};
