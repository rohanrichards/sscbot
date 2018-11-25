'use strict';

const logger = require('winston'),
	controller = require('../api/triggerWord/triggerWord.controller.js');

var Trigger = function(discordClient, emitter) {
	this.SUB_COMMAND_INDEX = 1; //index of sub command (add/remove)
	this.COMMAND_COUNT = 2; //total count of commands and sub commands to remove from string

	this.SUB_COMMANDS = {
		'add': (triggerObject, message) => this.triggerAdd(triggerObject, message),
		'remove': (triggerObject, message) => this.triggerRemove(triggerObject, message),
		'list': (triggerObject, message) => this.triggerList(triggerObject, message)
	};

	this._client = discordClient;
	this._emitter = emitter;

	logger.info('trigger module loaded');
};

Trigger.prototype.handle = function (message) {
	logger.info('trigger command for message: ', message.content);
	let messageArray = message.content.split(' ');
	let subCommand = messageArray[this.SUB_COMMAND_INDEX];

	//removes the command and sub command
	messageArray.splice(0, this.COMMAND_COUNT);
	//turns it back into a tring
	let responseString = messageArray.join(' ');
	//check if the first character is a quotation mark - this means its a phrase not a single word

	let triggerObject = generateTriggerObjectFromString(responseString);

	try {
		this.SUB_COMMANDS[subCommand](triggerObject, message);
	} catch(e) {
		logger.error(e);
	}
};

function generateTriggerObjectFromString(messageString) {
	if(!messageString) {
		return { word: null, response: null };
	}

	let isSingleQuote = messageString.indexOf('\'') === 0;
	let isDoubleQuote = messageString.indexOf('"') === 0;
	let isPhrase = (isSingleQuote || isDoubleQuote) ? true : false;
	let regex = /(["'](.*)["'])(.*)/;

	if(!isPhrase) {
		//no quote marks this is not a phrase simply return first word
		let messageArray = messageString.split(' ');
		// messageString.shift();
		let triggerWord = messageArray[0];
		messageString = messageArray.join(' ');

		return { word: triggerWord, response: messageString };
	}

	let matches = messageString.match(regex);
	let triggerPhrase = matches[2];
	let triggerResponse = matches[3];
	//remove the leading space
	triggerResponse = triggerResponse.substr(1);

	logger.info('found matches: ', matches);
	return { word: triggerPhrase, response: triggerResponse };
}

Trigger.prototype.triggerAdd = function (triggerObject, message) {
	logger.info(`adding trigger word: [${triggerObject.word}], with response: [${triggerObject.response}]`);
	controller.createOrUpdate(triggerObject)
		.then(() => {
			logger.info('success adding trigger');
			//new trigger word event
			this._emitter.emit('TriggerWord:create');
			message.reply('Trigger word added');
		})
		.catch(logger.error);
};

Trigger.prototype.triggerRemove = function (triggerObject, message) {
	logger.info(`removing trigger word: [${triggerObject.word}], with response: [${triggerObject.response}]`);
};

Trigger.prototype.triggerList = function (triggerObject, message) {
	if(!triggerObject.word) {
		controller.index()
			.then(triggers => {
				triggers = JSON.parse(triggers);
				if(triggers.length == 0) {
					logger.error('no trigger words yet!');
					return null;
				}

				logger.info(`found ${triggers.length} trigger words: ${triggers}`);
				let triggerWords = triggers.map(t => t.word);
				message.reply(`current trigger words: ${triggerWords}`);
			})
			.catch(logger.error);
	} else {
		controller.show(triggerObject.word)
			.then(trigger => {
				trigger = JSON.parse(trigger);
				logger.info(`trigger is: ${trigger}`);

				if(!trigger) {
					logger.error('no matching trigger word found!');
					return null;
				}
				logger.info(`found matching word: ${trigger}`);
				message.reply(`${trigger.word}: ${trigger.response}`);
			})
			.catch(logger.error);
	}
};

module.exports = Trigger;
