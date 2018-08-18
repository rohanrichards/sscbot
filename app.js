var logger = require('winston'),
	SmallBot = require('./src/bot.js'),
	mongoose = require('mongoose');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
	colorize: true
});
logger.level = 'debug';

//connect to db
mongoose.connect('mongodb://localhost/sscbot_dev');
var db = mongoose.connection;
db.on('error', logger.error);
db.once('open', function () {
	// we're connected!
	logger.info('db connected');
});
