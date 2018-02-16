require('dotenv').config();

var config = {};

config.basedir = __dirname;

config.port = process.env.EVENTFEELER_PORT || process.env.PORT;

config.dbServer = process.env.EVENTFEELER_DB_SERVER;
config.dbSchema = process.env.EVENTFEELER_DB_SCHEMA;
config.dbUser = process.env.EVENTFEELER_DB_USER;
config.dbPassword = process.env.EVENTFEELER_DB_PASSWORD;
config.dbOptions = process.env.EVENTFEELER_DB_OPTIONS;

config.FB_APP_ID = process.env.EVENTFEELER_FB_APP_ID;
config.FB_APP_SECRET = process.env.EVENTFEELER_FB_APP_SECRET;

config.TWITTER_KEY = process.env.EVENTFEELER_TWITTER_KEY;
config.TWITTER_SECRET = process.env.EVENTFEELER_TWITTER_SECRET;

config.dbAuth = config.dbUser === undefined ? "" : (config.dbUser + ":" + config.dbPassword + "@");
config.mongo = "mongodb://" + config.dbAuth + config.dbServer + "/" + config.dbSchema + "?" + (config.dbOptions === undefined ? "" : config.dbOptions);

module.exports = config;
