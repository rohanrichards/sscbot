'use strict';

var logger = require('winston'),
	controller = require('../api/triggerWord/triggerWord.controller.js');

var Triggers = function (discordClient, emitter) {

	this._discordClient = discordClient;
	this.clientId = this._discordClient.user.id;
	this._emitter = emitter;

	this._emitter.on('TriggerWord:create', () => this.refreshTriggers());

	this.triggers = [];

	controller.index().then(data => {
		// this.triggers = JSON.stringify(data);
		this.triggers = JSON.parse(data);
		logger.info(this.triggers);
	});
};

Triggers.prototype.refreshTriggers = function () {
	logger.info('refreshing triggers');
	controller.index().then(data => {
		// this.triggers = JSON.stringify(data);
		this.triggers = JSON.parse(data);
		logger.info(this.triggers);
	});
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

	logger.info('trigger got message: ', message.content);
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
