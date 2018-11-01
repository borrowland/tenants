var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var tenantSchema = new Schema({
	'name' : String,
	'created' : Date,
	'password' : String,
	'email' : String
});

module.exports = mongoose.model('tenant', tenantSchema);
