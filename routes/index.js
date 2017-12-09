var express = require('express');
var router = express.Router();
const User = require('../models/user');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/waiting', function(req, res, next) {
  res.render('waiting');
});

module.exports = router;
