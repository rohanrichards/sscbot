'use strict';

const logger = require('winston'),
	Vote = require('./Vote.model.js'),
	_merge = require('lodash/merge'),
	_unionWith = require('lodash/unionWith');

var VoteController = function () {

	this.createOrUpdate = function (data) {
		return Vote.findOne({ open: true })
			.sort('created')
			.exec()
			.then(vote => {
				if(!vote) {
					//create new Vote
					return Vote.create(data)
						.catch(logger.error);
				}
				_merge(vote, data);
				return vote.save();
			});
	};

	this.vote = function (data) {
		return Vote.findOne({ open: true })
			.sort('created')
			.exec()
			.then(vote => {
				if(!vote) {
					//create new Vote
					throw 'No open votes';
				}
				return Vote.update(
					{ '_id': vote._id, 'nominations.by': {$ne: data.by} }, // query
					{ $push: { nominations: data } } // update
				)
					.then((info) => {
						logger.info(info);
						if(!info.nModified){
							return Vote.update(
								{ '_id': vote._id, 'nominations.by': data.by }, // query
								{ $set: { 'nominations.$.for': data.for } } // update
							);
						}
					});
			});
	};

	this.index = function () {
		return Vote.find()
			.exec()
			.then(JSON.stringify);
	};

	this.show = function (data) {
		return Vote.findOne(data)
			.sort('created')
			.exec()
			.then(JSON.stringify);
	};

};

module.exports = new VoteController();
