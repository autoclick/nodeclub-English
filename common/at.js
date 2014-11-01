/*!
 * nodeclub - topic mention user controller.
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * Copyright(c) 2012 muyuan
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var User = require('../proxy').User;
var Message = require('./message');
var EventProxy = require('eventproxy');
var _ = require('lodash');

/**
 *  Extracted from the text @username  Username array tag 
 * @param {String} text  Text content 
 * @return {Array}  Username array 
 */
var fetchUsers = function (text) {
  var ignore_regexs = [
    /```.+?```/, //  The removal of a single row  ```
    /^```[\s\S]+?^```/gm, // ```  Inside the  pre  Label content 
    /`[\s\S]+?`/g, //  In the same row ，`some code`  Nor the content is parsed 
    /^    .*/gm, // 4 Spaces also  pre  Label ， Here  .  Does not match the newline 
    /\b.*?@[^\s]*?\..+?\b/g, // somebody@gmail.com  Will be removed 
    /\[@.+?\]\(\/.+?\)/g, //  Has been  link  Of  username
  ];

  ignore_regexs.forEach(function(ignore_regex) {
    text = text.replace(ignore_regex, '');
  });

  var results = text.match(/@[a-z0-9\-_]+\b/igm);
  var names = [];
  if (results) {
    for (var i = 0, l = results.length; i < l; i++) {
      var s = results[i];
      //remove leading char @
      s = s.slice(1);
      names.push(s);
    }
  }
  return names;
};
exports.fetchUsers = fetchUsers;

/**
 *  According to  Text content  Read the user ， And send a message to mention  Of  User 
 * Callback:
 * - err,  Database Exceptions 
 * @param {String} text  Text content 
 * @param {String} topicId  Theme ID
 * @param {String} authorId  Author ID
 * @param {String} reply_id  Reply ID
 * @param {Function} callback  The callback function 
 */
exports.sendMessageToMentionUsers = function (text, topicId, authorId, reply_id, callback) {
  if (typeof reply_id === 'function') {
    callback = reply_id;
    reply_id = null;
  }
  callback = callback || _.noop;

  User.getUsersByNames(fetchUsers(text), function (err, users) {
    if (err || !users) {
      return callback(err);
    }
    var ep = new EventProxy();
    ep.fail(callback);
    ep.after('sent', users.length, function () {
      callback();
    });

    users.forEach(function (user) {
      Message.sendAtMessage(user._id, authorId, topicId, reply_id, ep.done('sent'));
    });
  });
};

/**
 *  According to  Text content ， Replace the database  Of  Data 
 * Callback:
 * - err,  Database Exceptions 
 * - text,  After replacement  Of  Text content 
 * @param {String} text  Text content 
 * @param {Function} callback  The callback function 
 */
exports.linkUsers = function (text, callback) {
  var users = fetchUsers(text);
  for (var i = 0, l = users.length; i < l; i++) {
    var name = users[i];
    text = text.replace(new RegExp('@' + name + '\\b', 'g'), '[@' + name + '](/user/' + name + ')');
  }
  return callback(null, text);
};
