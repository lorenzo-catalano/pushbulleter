var request = require('request-promise');
const BASE_URL = 'https://www.pushbullet.com/';

var defaultOptions = {
  client_id: undefined,
  client_secret: undefined,
  redirect_uri: undefined,
  response_type: 'code',
  credentials: {}
}

function Client() {

  this.token = undefined;
  this.pbclient = undefined;

  this.profile = function() {
    return request.get('https://api.pushbullet.com/v2/users/me').auth(this.token, '', false);
  }

  this.devices = function() {
    return request.get('https://api.pushbullet.com/v2/devices').auth(this.token, '', false);
  }

  this.push = function(pushOptions) {
    return request.post('https://api.pushbullet.com/v2/pushes', {
      form: {
        device_iden: pushOptions.device_iden,
        type: pushOptions.type,
        title: pushOptions.title,
        url: pushOptions.link
      }
    }).auth(this.token, '', false);
  }
}

function PBClient(options) {

  this.opts = Object.assign({}, defaultOptions, options);

  this.getAuthUrl = function() {
    return `${BASE_URL}authorize?client_id=${this.opts.client_id}&redirect_uri=${encodeURIComponent(this.opts.redirect_uri)}&response_type=code`.toString()
  }
  
  this.getClient = function(token){
    var client = new Client();
      client.token = token;
      client.pbclient = this;
      return client;
  }

  this.fromRedirect = function(code) {
    return request.post('https://api.pushbullet.com/oauth2/token').form({
      grant_type: "authorization_code",
      client_id: this.opts.client_id,
      client_secret: this.opts.client_secret,
      code: code
    }).then((body) => {
      var client = new Client();
      client.token = JSON.parse(body).access_token;
      client.pbclient = this;
      return client;
    })
  }



}

module.exports = PBClient;