var request = require('request-promise');
const BASE_URL = 'https://www.pushbullet.com/';

var defaultOptions = {
    client_id :     undefined,
    client_secret : undefined,
    redirect_uri:   undefined,
    response_type:  'code',
    token:          undefined,
    device_iden:    undefined
}

function PBClient(options) {
    
    this.opts = Object.assign({},defaultOptions,options);
    
    
    this.getAuthUrl=function(){
        return `${BASE_URL}authorize?client_id=${this.opts.client_id}&redirect_uri=${encodeURIComponent(this.opts.redirect_uri)}&response_type=code`.toString()
    } 

    this.fromRedirect=function(code){
        return request.post('https://api.pushbullet.com/oauth2/token').form({
            grant_type: "authorization_code",
            client_id: this.opts.client_id,
            client_secret: this.opts.client_secret,
            code: code
        }).then((body)=>{
            this.opts.token = JSON.parse(body).access_token;
        })
    }
    
    this.profile = function(){
        return request.get('https://api.pushbullet.com/v2/users/me').auth(this.opts.token, '', false);
    }
    
    this.push=function(pushOptions){
        return request.post('https://api.pushbullet.com/v2/pushes',{
            form: {
                device_iden: pushOptions.device_iden,
                type:        pushOptions.type,
                title:       pushOptions.title,
                url:         pushOptions.link
            }
        }).auth(this.opts.token, '', false);
    }
    
}

module.exports = PBClient;