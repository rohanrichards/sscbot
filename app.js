var logger = require('winston'),
	SmallBot = require('./src/bot.js');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
	colorize: true
});
logger.level = 'debug';
