'use strict';

var logger = require('winston');

var Triggers = function (discordClient) {

	this._discordClient = discordClient;
	this.clientId = this._discordClient.user.id;
	logger.info('user id', this.clientId);

	this.triggers = [
		{
			word: 'word1',
			response: ['you said word1!']
		},
		{
			word: 'word2',
			response: ['you said word2!', 'word2, is what you said!', 'THIS IS A RANDOM REPLY', 'eseray smells funny']
		}
	];
};

Triggers.prototype.isOwner = function (message) {
	return this.clientId === message.author.id;
};

Triggers.prototype.getRandomResponse = function (responses) {
	var index = getRandomInt(0, responses.length - 1);
	return responses[index];
};

Triggers.prototype.handle = function (message) {
	if(this.isOwner(message)) {
		return false;
	}

	logger.info('trigger got message');
	var triggers = this.regex(message.content);
	if(triggers) {
		logger.info(`message passed regex test: matches received ${triggers.length}`);
		for(var i = 0; i < triggers.length; i++) {
			var trigger = triggers[i];
			message.reply(this.getRandomResponse(trigger.response))
				.then(sent => logger.info(`Sent a reply to ${sent.author.username}`))
				.catch(logger.error);
		}
	}
};

Triggers.prototype.regex = function (message) {
	let matchingTriggers = [];

	for(var i = 0; i < this.triggers.length; i++) {
		let triggerObj = this.triggers[i];
		logger.info(`testing for word ${triggerObj.word}`);
		var matches = message.match(triggerObj.word);
		logger.info(`got matches: ${matches}`);
		if(matches) {
			matchingTriggers.push(triggerObj);
		}
	}

	logger.info(`matched triggers: ${matchingTriggers}`);

	return matchingTriggers.length === 0 ? null : matchingTriggers;
};

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = Triggers;
