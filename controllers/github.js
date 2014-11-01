var sign = require('./sign');
var Models = require('../models');
var User = Models.User;
var utility = require('utility');
var authMiddleWare = require('../middlewares/auth');
var tools = require('../common/tools');
var eventproxy = require('eventproxy');

exports.callback = function (req, res, next) {
  var profile = req.user;
  User.findOne({githubId: profile.id}, function (err, user) {
    if (err) {
      return next(err);
    }
    //  When the user is already  cnode  User ， By  github  Login will update his information 
    if (user) {
      user.githubUsername = profile.username;
      user.githubId = profile.id;
      user.githubAccessToken = profile.accessToken;
      user.loginname = profile.username;
      user.avatar = profile._json.avatar_url;

      user.save(function (err) {
        if (err) {
          return next(err);
        }
        authMiddleWare.gen_session(user, res);
        return res.redirect('/');
      });
    } else {
      //  If the user does not already exist ， The establishment of a new user 
      req.session.profile = profile;
      return res.redirect('/auth/github/new');
    }
  });
};

exports.new = function (req, res, next) {
  res.render('sign/new_oauth', {actionPath: '/auth/github/create'});
};

exports.create = function (req, res, next) {
  var profile = req.session.profile;
  var isnew = req.body.isnew;
  var loginname = String(req.body.name).toLowerCase();
  var password = req.body.pass;
  var ep = new eventproxy();
  ep.fail(next);

  if (!profile) {
    return res.redirect('/signin');
  }
  delete req.session.profile;
  if (isnew) { //  Register a new account 
    var user = new User({
      loginname: profile.username,
      pass: profile.accessToken,
      email: profile.emails[0].value,
      avatar: profile._json.avatar_url,
      githubId: profile.id,
      githubUsername: profile.username,
      githubAccessToken: profile.accessToken,
      active: true,
    });
    user.save(function (err) {
      if (err) {
        //  According to  err.err  The error message is to decide how to respond to user ， This place is difficult to see written 
        if (err.err.indexOf('duplicate key error') !== -1) {
          if (err.err.indexOf('users.$email') !== -1) {
            return res.status(500)
              .render('sign/no_github_email');
          }
          if (err.err.indexOf('users.$loginname') !== -1) {
            return res.status(500)
              .send(' You  GitHub  Account user name and before  CNodejs  Registered user names repeated ');
          }
        }
        return next(err);
        // END  According to  err.err  The error message is to decide how to respond to user ， This place is difficult to see written 
      }
      authMiddleWare.gen_session(user, res);
      res.redirect('/');
    });
  } else { //  Associated with the old account 
    ep.on('login_error', function (login_error) {
      res.status(403);
      res.render('sign/signin', { error: ' Account name or password error 。' });
    });
    User.findOne({loginname: loginname},
      ep.done(function (user) {
        if (!user) {
          return ep.emit('login_error');
        }
        tools.bcompare(password, user.pass, ep.done(function (bool) {
          if (!bool) {
            return ep.emit('login_error');
          }
          user.githubUsername = profile.username;
          user.githubId = profile.id;
          user.loginname = profile.username;
          user.avatar = profile._json.avatar_url;
          user.githubAccessToken = profile.accessToken;

          user.save(function (err) {
            if (err) {
              return next(err);
            }
            authMiddleWare.gen_session(user, res);
            res.redirect('/');
          });
        }));
      }));
  }
};
