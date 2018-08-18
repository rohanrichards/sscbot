'use strict';

const logger = require('winston'),
	controller = require('../api/triggerWord/triggerWord.controller.js');

var Commands = function (discordClient, emitter) {
	this._discordClient = discordClient;
	this._emitter = emitter;

	this.commands = [
		{
			word: 'trigger',
			response: (message) => this.trigger(message)
		}
	];
};

Commands.prototype.isOwner = function (message) {
	return this.clientId === message.author.id;
};

Commands.prototype.handle = function (message) {
	logger.info('trigger handle method');
	if(this.isOwner(message)) {
		return false;
	}

	let command = this.match(message);
	logger.info('trigger command : ', command);
	if(command) {
		command.response(message);
	}
};

Commands.prototype.match = function (message) {
	let content = message.content;
	content = content.substring(1);
	for(var i = 0; i < this.commands.length; i++) {
		let command = this.commands[i];
		let match = content.match(command.word);
		logger.info(match);
		if(match) {
			return command;
		}
	}
	return null;
};

Commands.prototype.trigger = function (message) {
	const SUB_COMMAND_INDEX = 1; //index of sub command (add/remove)
	const COMMAND_COUNT = 2; //total count of commands and sub commands to remove from string
	const SUB_COMMAND_ADD_TRIGGER = 'add'; //sub command string for add command
	const SUB_COMMAND_REMOVE_TRIGGER = 'remove'; //sub command string for remove command

	logger.info('trigger command for message: ', message.content);
	let messageArray = message.content.split(' ');
	let subCommand = messageArray[SUB_COMMAND_INDEX];

	//removes the command and sub command
	messageArray.splice(0, COMMAND_COUNT);
	//turns it back into a tring
	let responseString = messageArray.join(' ');
	//check if the first character is a quotation mark - this means its a phrase not a single word

	let triggerObject = generateTriggerObjectFromString(responseString);

	if(subCommand === SUB_COMMAND_ADD_TRIGGER) {
		this.triggerAdd(triggerObject);
	} else if(subCommand === SUB_COMMAND_REMOVE_TRIGGER) {
		this.triggerRemove(triggerObject);
	}
};

Commands.prototype.triggerAdd = function (triggerObject) {
	logger.info(`adding trigger word: [${triggerObject.word}], with response: [${triggerObject.response}]`);
	controller.createOrUpdate(triggerObject)
		.then(() => {
			logger.info('success adding trigger');
			//new trigger word event
			this._emitter.emit('TriggerWord:create');
		})
		.catch(logger.error);
};

Commands.prototype.triggerRemove = function (triggerObject) {
	logger.info(`removing trigger word: [${triggerObject.word}], with response: [${triggerObject.response}]`);
};

function generateTriggerObjectFromString(messageString){
	let isSingleQuote = messageString.indexOf('\'') === 0;
	let isDoubleQuote = messageString.indexOf('"') === 0;
	let isPhrase = (isSingleQuote || isDoubleQuote) ? true : false;
	let regex = /(["'](.*)["'])(.*)/;

	if(!isPhrase){
		//no quote marks this is not a phrase simply return first word
		let messageArray = messageString.split(' ');
		messageString.shift();
		let triggerWord = messageArray[0];
		let messageString = messageArray.join(' ');
		return {word: triggerWord, response: messageString};
	}

	let matches = messageString.match(regex);
	let triggerPhrase = matches[2];
	let triggerResponse = matches[3];
	//remove the leading space
	triggerResponse = triggerResponse.substr(1);

	logger.info('found matches: ', matches);
	return {word: triggerPhrase, response: triggerResponse};
}

module.exports = Commands;
