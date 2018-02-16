var mongoose = require('mongoose');
var fs = require('fs');
var axios = require('axios');

var schemas = require('./schemas');

class api {
    constructor(setCfg) {
        this.config = setCfg;
        this.mongoose = mongoose;
        this.schemas = schemas;

        this.FB_ACCESS_TOKEN = this.config.FB_APP_ID + "|" + this.config.FB_APP_SECRET;
        this.FB_GRAPH = "https://graph.facebook.com/v2.12/";
        this.TWITTER_API = "https://api.twitter.com/";

        this.TWITTER_KEY = this.config.TWITTER_KEY;
        this.TWITTER_SECRET = this.config.TWITTER_SECRET;

        this.KEYS_FOLDER = this.config.basedir + "/data/keys/";

        if (!fs.existsSync(this.KEYS_FOLDER))
            fs.mkdirSync(this.KEYS_FOLDER);

        if (fs.existsSync(this.KEYS_FOLDER + 'twitter'))
            this.TWITTER_ACCESS_TOKEN = fs.readFileSync(this.KEYS_FOLDER + 'twitter', 'utf8');
    }

    connect() {
        this.mongoose.connect(this.config.mongo);
    }

    async ensureTwitterAuth() {
        var encoded = new Buffer(this.TWITTER_KEY + ":" + this.TWITTER_SECRET).toString('base64');
        var authURL = this.TWITTER_API + "oauth2/token";

        var response = await axios({
            method: "post",
            url: authURL + "?grant_type=client_credentials",
            headers: {
                "Authorization": "Basic " + encoded,
                "Content-Type": "application/x-www-formurlencoded;charset=UTF-8"
            }
        });

        if (response.data.token_type !== undefined) // if we got a new access token
        {
            this.TWITTER_ACCESS_TOKEN = response.data.access_token;
            fs.writeFileSync(this.KEYS_FOLDER + 'twitter', this.TWITTER_ACCESS_TOKEN);
            return this.TWITTER_ACCESS_TOKEN;
        }

        return this.TWITTER_ACCESS_TOKEN; // if our old access token was fine
    }
}

module.exports = cfg => new api(cfg);
