'use strict';

var Discord = require('discord.js'),
	logger = require('winston'),
	EventEmitter = require('events'),
	auth = require('../config/auth.js'),
	MessageHandler = require('./messageHandler.js');

class SSCEmitter extends EventEmitter {}

var SmallBot = function () {
	logger.info('I am alive!');

	this._discordClient = new Discord.Client();
	this._emitter = new SSCEmitter();

	// logger.info(this._discordClient)

	this._discordClient.on('ready', () => {
		logger.info('discord client onReady event');
		this._messageHandler = new MessageHandler(this._discordClient, this._emitter);
	});

	this._discordClient.on('message', message => {
		logger.info(`discord client onMessage event: [${message}] - passing to handler`);
		this._messageHandler.handle(message);
	});

	this._discordClient.login(auth.discord.BOT_USER_TOKEN)
		.then(() => {
			logger.info('discord client login complete');
		})
		.catch((err) => {
			logger.error(err);
		});
};

SmallBot.prototype.methodName = function () {

};

module.exports = new SmallBot();
