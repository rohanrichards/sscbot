'use strict';

const logger = require('winston'),
	TriggerWord = require('./triggerWord.model.js');

var TriggerWordController = function () {

	this.createOrUpdate = function (data) {
		return TriggerWord.findOne({word: data.word})
			.exec()
			.then(triggerWord => {
				if(!triggerWord){
					//create new triggerWord
					return TriggerWord.create(data)
						.catch(logger.error);
				}
				triggerWord.response.push(data.response);
				return triggerWord.save();
			});
	};

	this.index = function() {
		return TriggerWord.find()
			.lean()
			.exec()
			.then(JSON.stringify);
	};

	this.show = function (data) {
		return TriggerWord.findOne({word: data})
			.lean()
			.exec()
			.then(JSON.stringify);
	};

};

module.exports = new TriggerWordController();
