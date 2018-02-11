// RENAME THIS TO config.js AND SET INFORMATION APPROPRIATELY

var config = {};

config.port = 3000

config.dbServer = "localhost:27017";
config.dbSchema = "eventfeeler";
config.dbUser = "";
config.dbPassword = "";
config.dbOptions = "";

config.dbAuth = config.dbUser.length == 0 ? "" : config.dbUser + ":" + config.dbPassword + "@";
config.mongo = "mongodb://" + config.dbAuth + config.dbServer + "/" + config.dbSchema + "?" + config.dbOptions;

module.exports = config;
