/**
 * config
 */

var path = require('path');

var debug = true;

var config = {
  // debug  For  true  When ， For local debugging 
  debug: debug,

  mini_assets: !debug, //  Whether to enable static file compression merger ， Detailed view Loader

  name: 'Nodeclub', //  Community name 
  description: 'CNode：Node.js Professional Chinese Community ', //  Description communities 
  keywords: 'nodejs, node, express, connect, socket.io',

  //  Add to  html head  Information 
  site_headers: [
    '<meta name="author" content="EDP@TAOBAO" />'
  ],
  site_logo: '/public/images/cnodejs_light.svg', // default is `name`
  site_icon: '/public/images/cnode_icon_32.png', //  The default is no  favicon,  Fill in the URL here 
  //  Upper right corner of the navigation area 
  site_navs: [
    //  Format  [ path, title, [target=''] ]
    [ '/about', ' With respect to ' ]
  ],
  // cdn host， As  http://cnodejs.qiniudn.com
  site_static_host: '', //  Static file storage domain 
  //  Community domain 
  host: 'localhost',
  //  Default Google tracker ID， Please modify its own site ， Application Address ：http://www.google.com/analytics/
  google_tracker_id: 'UA-4175xxxx-x',

  // mongodb  Configuration 
  db: 'mongodb://127.0.0.1/node_club_dev',
  db_name: 'node_club_dev',


  session_secret: 'node_club_secret', //  Be sure to modify 
  auth_cookie_name: 'node_club',

  //  Port programs running 
  port: 3000,

  //  Number of Topics Topics list displayed 
  list_topic_count: 20,

  //  Posting restrictions  When  Interval ， Unit ： Millisecond 
  post_interval: 2000,

  // RSS Configuration 
  rss: {
    title: 'CNode：Node.js Professional Chinese Community ',
    link: 'http://cnodejs.org',
    language: 'zh-cn',
    description: 'CNode：Node.js Professional Chinese Community ',
    // Get up to the RSS Item Quantity 
    max_rss_items: 50
  },

  //  Mailbox  Configuration 
  mail_opts: {
    host: 'smtp.126.com',
    port: 25,
    auth: {
      user: 'club@126.com',
      pass: 'club'
    }
  },

  //weibo app key
  weibo_key: 10000000,
  weibo_id: 'your_weibo_id',

  // admin  You can delete the topic ， Edit Tags ， Set someone  For  Daren 
  admins: { user_login_name: true },

  // github  Landing  Configuration 
  GITHUB_OAUTH: {
    clientID: 'your GITHUB_CLIENT_ID',
    clientSecret: 'your GITHUB_CLIENT_SECRET',
    callbackURL: 'http://cnodejs.org/auth/github/callback'
  },
  //  Whether to allow direct registration （ Otherwise, you can go  github  Way ）
  allow_sign_up: true,

  // newrelic  Is used to monitor site performance service 
  newrelic_key: 'yourkey',

  //7 Cattle access Information ， For file uploads 
  qn_access: {
    accessKey: 'your access key',
    secretKey: 'your secret key',
    bucket: 'your bucket name',
    domain: 'http://{bucket}.qiniudn.com'
  },

  // File Upload  Configuration 
  // Note ： As  Fruit Fill  qn_access， Will be uploaded to  7 Cow ， The following  Configuration  Invalid 
  upload: {
    path: path.join(__dirname, 'public/upload/'),
    url: '/public/upload/'
  },

  //  Forum 
  tabs: [
    ['share', ' Share it '],
    ['ask', ' Questions and answers '],
    ['job', ' Recruitment ']
  ]
};

module.exports = config;
