var mailer = require('nodemailer');
var config = require('../config');
var util = require('util');

var transport = mailer.createTransport('SMTP', config.mail_opts);
var SITE_ROOT_URL = 'http://' + config.host;

/**
 * Send an email
 * @param {Object} data  Mail objects 
 */
var sendMail = function (data) {
  if (config.debug) {
    return;
  }
  //  Mail array traversal ， Send each message ， If you have failed to send ， It then pressed into an array ， Meanwhile trigger mailEvent Event 
  transport.sendMail(data, function (err) {
    if (err) {
      //  Write to log 
      console.log(err);
    }
  });
};
exports.sendMail = sendMail;

/**
 *  Send e-mail to activate notifications 
 * @param {String} who  The recipient's e-mail address 
 * @param {String} token  Resetting the token String 
 * @param {String} name  The recipient's username 
 */
exports.sendActiveMail = function (who, token, name) {
  var from = util.format('%s <%s>', config.name, config.mail_opts.auth.user);
  var to = who;
  var subject = config.name + ' Community Account Activation ';
  var html = '<p> Hello ：' + name + '</p>' +
    '<p> We receive you in ' + config.name + ' Registration Information Community ， Please click on the following link to activate your account ：</p>' +
    '<a href="' + SITE_ROOT_URL + '/active_account?key=' + token + '&name=' + name + '"> Activation Link </a>' +
    '<p> If you do not ' + config.name + ' Community filled out registration information ， Description abused your e-mail ， Please delete this message ， We disturb caused you to feel sorry for 。</p>' +
    '<p>' + config.name + ' Community   Yours 。</p>';

  exports.sendMail({
    from: from,
    to: to,
    subject: subject,
    html: html
  });
};

/**
 *  Send password reset notification email 
 * @param {String} who  The recipient's e-mail address 
 * @param {String} token  Resetting the token String 
 * @param {String} name  The recipient's username 
 */
exports.sendResetPassMail = function (who, token, name) {
  var from = util.format('%s <%s>', config.name, config.mail_opts.auth.user);
  var to = who;
  var subject = config.name + ' Community  Password Reset ';
  var html = '<p> Hello ：' + name + '</p>' +
    '<p> We receive you in ' + config.name + ' Community  Request to reset your password ， Please 24 Click the link below to reset your password within hours ：</p>' +
    '<a href="' + SITE_ROOT_URL + '/reset_pass?key=' + token + '&name=' + name + '"> Reset Password link </a>' +
    '<p> If you do not ' + config.name + ' Community filled out registration information ， Description abused your e-mail ， Please delete this message ， We disturb caused you to feel sorry for 。</p>' +
    '<p>' + config.name + ' Community   Yours 。</p>';

  exports.sendMail({
    from: from,
    to: to,
    subject: subject,
    html: html
  });
};
