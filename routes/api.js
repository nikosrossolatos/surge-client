var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );

// var surge = require('../public/js/libs/surge-client.js')();
// surge.emit()
// surge.on('skata',function(data){
// 	console.log('pesane ta skata');
// 	console.log('data received : '+JSON.stringify(data));
// });

router.get('/', function(req, res) {
	res.render('index');
});

module.exports = router;