'use strict';

const logger = require('winston'),
	Trigger = require('./trigger-command'),
	Vote = require('./vote-command');

var Commands = function (discordClient, emitter) {
	this._discordClient = discordClient;
	this._emitter = emitter;
	this._triggerCommand = new Trigger(discordClient, emitter);
	this._voteCommand = new Vote(discordClient, emitter);

	this.commands = {
		// '!trigger': (message) => this._triggerCommand.handle(message),
		'!vote': (message) => this._voteCommand.handle(message),
	};
};

Commands.prototype.handle = function (message) {
	logger.info('Command handle method');
	if(this.isOwner(message)) {
		return false;
	}

	let messageArray = message.content.split(' ');
	let command = messageArray[0];

	try {
		this.commands[command](message);
	} catch(e) {
		logger.error('Unrecognised command');
	}
};

Commands.prototype.isOwner = function (message) {
	return this.clientId === message.author.id;
};

module.exports = Commands;
