var models = require('../models');
var Reply = models.Reply;
var EventProxy = require('eventproxy');

var tools = require('../common/tools');
var User = require('./user');
var at = require('../common/at');

/**
 *  Get a reply message 
 * @param {String} id  Reply ID
 * @param {Function} callback  The callback function 
 */
exports.getReply = function (id, callback) {
  Reply.findOne({_id: id}, callback);
};

/**
 *  According to  Reply ID， Get  Reply 
 * Callback:
 * - err,  Database Exceptions 
 * - reply,  Reply  Contents 
 * @param {String} id  Reply ID
 * @param {Function} callback  The callback function 
 */
exports.getReplyById = function (id, callback) {
  Reply.findOne({_id: id}, function (err, reply) {
    if (err) {
      return callback(err);
    }
    if (!reply) {
      return callback(err, null);
    }

    var author_id = reply.author_id;
    User.getUserById(author_id, function (err, author) {
      if (err) {
        return callback(err);
      }
      reply.author = author;
      reply.friendly_create_at = tools.formatDate(reply.create_at, true);
      // TODO:  Add update method ， Some older posts can be converted to markdown Format  Contents 
      if (reply.content_is_html) {
        return callback(null, reply);
      }
      at.linkUsers(reply.content, function (err, str) {
        if (err) {
          return callback(err);
        }
        reply.content = str;
        return callback(err, reply);
      });
    });
  });
};

/**
 *  According to  Theme ID， Get  Reply  List 
 * Callback:
 * - err,  Database Exceptions 
 * - replies,  Reply  List 
 * @param {String} id  Theme ID
 * @param {Function} callback  The callback function 
 */
exports.getRepliesByTopicId = function (id, cb) {
  Reply.find({topic_id: id}, '', {sort: 'create_at'}, function (err, replies) {
    if (err) {
      return cb(err);
    }
    if (replies.length === 0) {
      return cb(null, []);
    }

    var proxy = new EventProxy();
    proxy.after('reply_find', replies.length, function () {
      cb(null, replies);
    });
    for (var j = 0; j < replies.length; j++) {
      (function (i) {
        var author_id = replies[i].author_id;
        User.getUserById(author_id, function (err, author) {
          if (err) {
            return cb(err);
          }
          replies[i].author = author || { _id: '' };
          replies[i].friendly_create_at = tools.formatDate(replies[i].create_at, true);
          if (replies[i].content_is_html) {
            return proxy.emit('reply_find');
          }
          at.linkUsers(replies[i].content, function (err, str) {
            if (err) {
              return cb(err);
            }
            replies[i].content = str;
            proxy.emit('reply_find');
          });
        });
      })(j);
    }
  });
};

/**
 *  Create and save a  Reply  Information 
 * @param {String} content  Reply  Contents 
 * @param {String} topicId  Theme ID
 * @param {String} authorId  Reply  Author 
 * @param {String} [replyId]  Reply ID， When two  Reply  When setting this value 
 * @param {Function} callback  The callback function 
 */
exports.newAndSave = function (content, topicId, authorId, replyId, callback) {
  if (typeof replyId === 'function') {
    callback = replyId;
    replyId = null;
  }
  var reply = new Reply();
  reply.content = content;
  reply.topic_id = topicId;
  reply.author_id = authorId;
  if (replyId) {
    reply.reply_id = replyId;
  }
  reply.save(function (err) {
    callback(err, reply);
  });
};

exports.getRepliesByAuthorId = function (authorId, opt, callback) {
  if (!callback) {
    callback = opt;
    opt = null;
  }
  Reply.find({author_id: authorId}, {}, opt, callback);
};

//  By  author_id  Get  Reply  Total 
exports.getCountByAuthorId = function (authorId, callback) {
  Reply.count({author_id: authorId}, callback);
};
