'use strict';

const mongoose = require('mongoose');

var TriggerWordSchema = new mongoose.Schema({
	word: String,
	response: [String]
});

module.exports = mongoose.model('TriggerWord', TriggerWordSchema);
