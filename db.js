// Mongoose import
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;


var notifications = new Schema({
	timestamp  		: Date,
	message  			: String
});


mongoose.model( 'notifications', notifications );

mongoose.connect( 'mongodb://localhost/surge' );