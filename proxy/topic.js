var EventProxy = require('eventproxy');

var models = require('../models');
var Topic = models.Topic;
var User = require('./user');
var Reply = require('./reply');
var tools = require('../common/tools');
var at = require('../common/at');
var _ = require('lodash');

/**
 *  By topic ID Get themes 
 * Callback:
 * - err,  Database Error 
 * - topic,  Theme 
 * - author,  Author 
 * - lastReply,  Last reply 
 * @param {String} id  Theme ID
 * @param {Function} callback  The callback function 
 */
exports.getTopicById = function (id, callback) {
  var proxy = new EventProxy();
  var events = ['topic', 'author', 'last_reply'];
  proxy.assign(events, function (topic, author, last_reply) {
    if (!author) {
      return callback(null, null, null, null);
    }
    return callback(null, topic, author, last_reply);
  }).fail(callback);

  Topic.findOne({_id: id}, proxy.done(function (topic) {
    if (!topic) {
      proxy.emit('topic', null);
      proxy.emit('author', null);
      proxy.emit('last_reply', null);
      return;
    }
    proxy.emit('topic', topic);

    User.getUserById(topic.author_id, proxy.done('author'));

    if (topic.last_reply) {
      Reply.getReplyById(topic.last_reply, proxy.done(function (last_reply) {
        proxy.emit('last_reply', last_reply);
      }));
    } else {
      proxy.emit('last_reply', null);
    }
  }));
};

/**
 *  Get keyword can search to  Theme  Quantity 
 * Callback:
 * - err,  Database Error 
 * - count,  Theme  Quantity 
 * @param {String} query  Search Keywords 
 * @param {Function} callback  The callback function 
 */
exports.getCountByQuery = function (query, callback) {
  Topic.count(query, callback);
};

/**
 *  According Keywords ， Get themes  List 
 * Callback:
 * - err,  Database Error 
 * - count,  Theme  List 
 * @param {String} query  Search Keywords 
 * @param {Object} opt  Search Options 
 * @param {Function} callback  The callback function 
 */
exports.getTopicsByQuery = function (query, opt, callback) {
  Topic.find(query, '_id', opt, function (err, docs) {
    if (err) {
      return callback(err);
    }
    if (docs.length === 0) {
      return callback(null, []);
    }

    var topics_id = _.pluck(docs, 'id');

    var proxy = new EventProxy();
    proxy.after('topic_ready', topics_id.length, function (topics) {
      //  Filter out null 
      var filtered = topics.filter(function (item) {
        return !!item;
      });
      return callback(null, filtered);
    });
    proxy.fail(callback);

    topics_id.forEach(function (id, i) {
      exports.getTopicById(id, proxy.group('topic_ready', function (topic, author, last_reply) {
        //  When id After check out ， For further inquiries  List  When ， Articles may have been deleted 
        //  So there may be null
        if (topic) {
          topic.author = author;
          topic.reply = last_reply;
          topic.friendly_create_at = tools.formatDate(topic.create_at, true);
        }
        return topic;
      }));
    });
  });
};

// for sitemap
exports.getLimit5w = function (callback) {
  Topic.find({}, '_id', {limit: 50000, sort: '-create_at'}, callback);
};

/**
 *  Get all the information  Theme 
 * Callback:
 * - err,  Database Exceptions 
 * - message,  News 
 * - topic,  Theme 
 * - author,  Theme  Author 
 * - replies,  Theme  Reply 
 * @param {String} id  Theme ID
 * @param {Function} callback  The callback function 
 */
exports.getFullTopic = function (id, callback) {
  var proxy = new EventProxy();
  var events = ['topic', 'author', 'replies'];
  proxy
    .assign(events, function (topic, author, replies) {
      callback(null, '', topic, author, replies);
    })
    .fail(callback);

  Topic.findOne({_id: id}, proxy.done(function (topic) {
    if (!topic) {
      proxy.unbind();
      return callback(null, ' This topic does not exist or has been deleted 。');
    }
    at.linkUsers(topic.content, proxy.done('topic', function (str) {
      topic.content = str;
      return topic;
    }));

    User.getUserById(topic.author_id, proxy.done(function (author) {
      if (!author) {
        proxy.unbind();
        return callback(null, ' Topics  Author  Lost 。');
      }
      proxy.emit('author', author);
    }));

    Reply.getRepliesByTopicId(topic._id, proxy.done('replies'));
  }));
};

/**
 *  Update  Theme  Of  Last reply  Information 
 * @param {String} topicId  Theme ID
 * @param {String} replyId  Reply ID
 * @param {Function} callback  The callback function 
 */
exports.updateLastReply = function (topicId, replyId, callback) {
  Topic.findOne({_id: topicId}, function (err, topic) {
    if (err || !topic) {
      return callback(err);
    }
    topic.last_reply = replyId;
    topic.last_reply_at = new Date();
    topic.reply_count += 1;
    topic.save(callback);
  });
};

/**
 *  By topic ID， Find a  Theme 
 * @param {String} id  Theme ID
 * @param {Function} callback  The callback function 
 */
exports.getTopic = function (id, callback) {
  Topic.findOne({_id: id}, callback);
};

/**
 *  Will  When  Ago  Theme  Reply  Count Less 1， Delete  Reply  When  Used 
 * @param {String} id  Theme ID
 * @param {Function} callback  The callback function 
 */
exports.reduceCount = function (id, callback) {
  Topic.findOne({_id: id}, function (err, topic) {
    if (err) {
      return callback(err);
    }

    if (!topic) {
      return callback(new Error(' That  Theme  Does not exist '));
    }

    topic.reply_count -= 1;
    topic.save(callback);
  });
};

exports.newAndSave = function (title, content, tab, authorId, callback) {
  var topic = new Topic();
  topic.title = title;
  topic.content = content;
  topic.tab = tab;
  topic.author_id = authorId;
  topic.save(callback);
};
