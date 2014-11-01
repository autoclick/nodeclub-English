var EventProxy = require('eventproxy');

var Message = require('../models').Message;

var User = require('./user');
var Topic = require('./topic');
var Reply = require('./reply');

/**
 *  According to user ID， Get the number of unread messages 
 * Callback:
 *  The callback function parameter list ：
 * - err,  Database Error 
 * - count,  The number of unread messages 
 * @param {String} id  User ID
 * @param {Function} callback  Get the number of messages 
 */
exports.getMessagesCount = function (id, callback) {
  Message.count({master_id: id, has_read: false}, callback);
};


/**
 *  According to news Id Get the message 
 * Callback:
 * - err,  Database Error 
 * - message,  Message Object 
 * @param {String} id  News ID
 * @param {Function} callback  The callback function 
 */
exports.getMessageById = function (id, callback) {
  Message.findOne({_id: id}, function (err, message) {
    if (err) {
      return callback(err);
    }
    if (message.type === 'reply' || message.type === 'reply2' || message.type === 'at') {
      var proxy = new EventProxy();
      proxy.assign('author_found', 'topic_found', 'reply_found', function (author, topic, reply) {
        message.author = author;
        message.topic = topic;
        message.reply = reply;
        if (!author || !topic) {
          message.is_invalid = true;
        }
        return callback(null, message);
      }).fail(callback); //  Receiving abnormal 
      User.getUserById(message.author_id, proxy.done('author_found'));
      Topic.getTopicById(message.topic_id, proxy.done('topic_found'));
      Reply.getReplyById(message.reply_id, proxy.done('reply_found'));
    }

    if (message.type === 'follow') {
      User.getUserById(message.author_id, function (err, author) {
        if (err) {
          return callback(err);
        }
        message.author = author;
        if (!author) {
          message.is_invalid = true;
        }
        return callback(null, message);
      });
    }
  });
};

/**
 *  According to user ID， Get the message  List 
 * Callback:
 * - err,  Database Exceptions 
 * - messages,  News  List 
 * @param {String} userId  User ID
 * @param {Function} callback  The callback function 
 */
exports.getReadMessagesByUserId = function (userId, callback) {
  Message.find({master_id: userId, has_read: true}, null,
    {sort: '-create_at', limit: 20}, callback);
};

/**
 *  According to user ID， Get unread  News  List 
 * Callback:
 * - err,  Database Exceptions 
 * - messages,  Unread  News  List 
 * @param {String} userId  User ID
 * @param {Function} callback  The callback function 
 */
exports.getUnreadMessageByUserId = function (userId, callback) {
  Message.find({master_id: userId, has_read: false}, null,
    {sort: '-create_at'}, callback);
};
