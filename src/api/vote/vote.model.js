'use strict';

const mongoose = require('mongoose');

var VoteSchema = new mongoose.Schema({
	created: {
		type: Date,
		default: Date.now
	},
	nominations: [{
		by: String,
		for: String
	}],
	open: {
		type: Boolean,
		default: true
	}
});

module.exports = mongoose.model('Vote', VoteSchema);
