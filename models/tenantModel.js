var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var tenantSchema = new Schema({
	'name': {
		type: String,
		required: true,
		trim: true
	},
	'created': {
		type: Date,
		default: Date.now
	},
	'password': {
		type: String,
		required: true,
	},
	'email': {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('tenant', tenantSchema);