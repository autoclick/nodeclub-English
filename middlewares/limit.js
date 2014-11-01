var config = require('../config');

//  Post time interval ， Ms 
var POST_INTERVAL = config.post_interval;
if (!(POST_INTERVAL > 0)) POST_INTERVAL = 0;
var DISABLE_POST_INTERVAL = POST_INTERVAL > 0 ? false : true;

/**
 *  Posting / Comments interval limit 
 */
exports.postInterval = function (req, res, next) {
  if (DISABLE_POST_INTERVAL) return next();
  if (isNaN(req.session.lastPostTimestamp)) {
    req.session.lastPostTimestamp = Date.now();
    return next();
  }
  if (Date.now() - req.session.lastPostTimestamp < POST_INTERVAL) {
    var ERROR_MSG = ' Your reply too fast 。';
    res.render('notify/notify', {error: ERROR_MSG});
    return;
  }

  req.session.lastPostTimestamp = Date.now();
  next();
};
