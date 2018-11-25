'use strict';

const logger = require('winston'),
	controller = require('../api/vote/vote.controller'),
	_includes = require('lodash/includes');

var Vote = function (discordClient, emitter) {
	logger.info('Vote module loaded');

	this.SUB_COMMAND_INDEX = 1; //index of sub command (add/remove)
	this.COMMAND_COUNT = 2; //total count of commands and sub commands to remove from string
	this.CHANNEL_NAME = 'events';
	this.MOD_ROLES = ['Owner', 'Admin', 'Moderator'];
	this.MESSAGES = {
		START: 'Streamer of the Week nominations are now open! To vote just type `!vote add @[username]`',
		ADD: 'Your vote has been recorded!',
		END: 'The Streamer of the Week votes have been closed!'
	}

	this.SUB_COMMANDS = {
		'start': (VoteObject, message) => this.VoteStart(VoteObject, message),
		'end': (VoteObject, message) => this.VoteEnd(VoteObject, message),
		'add': (VoteObject, message) => this.VoteAdd(VoteObject, message),
		'remove': (VoteObject, message) => this.VoteRemove(VoteObject, message)
	};

	this._client = discordClient;
	this._emitter = emitter;
};

Vote.prototype.handle = function (message) {
	if(message.channel.name !== this.CHANNEL_NAME) {
		return;
	}

	logger.info('Vote command for message: ', message.content);
	let messageArray = message.content.split(' ');
	let subCommand = messageArray[this.SUB_COMMAND_INDEX];

	let VoteObject = this.generateVoteObjectFromMessage(message);

	try {
		this.SUB_COMMANDS[subCommand](VoteObject, message);
	} catch(e) {
		logger.error(e);
	}
};

Vote.prototype.generateVoteObjectFromMessage = function (message) {
	if(!message.content) {
		return { word: null, response: null };
	}

	let byUser = '',
		forUser = '',
		messageArray = message.content.split(' ');

	//removes the command and sub command
	messageArray.splice(0, this.COMMAND_COUNT);

	byUser = message.author.id;
	forUser = messageArray[0];

	return { by: byUser, for: forUser };
};

Vote.prototype.VoteStart = function (VoteObject, message) {
	if(!HAS_ROLE(message.member.roles, this.MOD_ROLES)) {
		logger.info('User does not have the correct role');
		return;
	}

	logger.info('starting a new vote');
	controller.show({ open: true })
		.then(vote => {
			if(vote != 'null') {
				message.reply('There is already an active vote.');
				return;
			} else {
				controller.createOrUpdate(VoteObject)
					.then((vote) => {
						logger.info('success starting vote: ');
						this._emitter.emit('Vote:start');
						message.reply(this.MESSAGES.START);
					})
					.catch(logger.error);
			}
		});

};

Vote.prototype.VoteEnd = function (VoteObject, message) {
	if(!HAS_ROLE(message.member.roles, this.MOD_ROLES)) {
		logger.info('User does not have the correct role');
		return;
	}
	logger.info('ending the current vote');
	VoteObject.open = false;
	controller.show({ open: true })
		.then(vote => {
			if(vote=='null') {
				message.reply('There is no active vote to close.');
				return;
			} else {
				controller.createOrUpdate(VoteObject)
					.then((vote) => {
						logger.info('success ending vote');
						this._emitter.emit('Vote:end');
						message.reply(this.MESSAGES.END);
						const COUNTS = COUNT_VOTES(vote.nominations)
						printVotes(message, COUNTS);
					})
					.catch(logger.error);
			}
		});

};

Vote.prototype.VoteAdd = function (VoteObject, message) {
	logger.info(`adding Vote:`);
	controller.vote(VoteObject)
		.then(() => {
			logger.info('success adding Vote');
			//new Vote word event
			this._emitter.emit('Vote:create');
			message.reply('recorded your vote!');
		})
		.catch(logger.error);
};

Vote.prototype.VoteRemove = function (VoteObject, message) {
	logger.info(`removing Vote`);
};

const COUNT_VOTES = function (nominations) {

	const COUNTS = nominations.reduce((acc, nom) => {
		const count = acc[nom.for] ? acc[nom.for] + 1 : 1;
		return {
			...acc,
			[nom.for]: count
		}
	}, {});
	return COUNTS;
};

const HAS_ROLE = function (memberRoles, allowedRoles) {
	return memberRoles.some((memberRole) => {
		return allowedRoles.some(allowedRole => {
			return memberRole.name === allowedRole;
		});
	});
};

const printVotes = function(message, countObject) {
	let response = '';
	const countArray = Object.entries(countObject).sort((a, b) => a - b)
	response += `The winner is: ${countArray[0][0]}\n`;
	response += `Scoreboard: \n`;
	for (var i = 0; i < countArray.length; i++) {
		response += `${countArray[i][0]} - ${countArray[i][1]}\n`;
	}
	message.channel.sendMessage(response);
}

module.exports = Vote;
