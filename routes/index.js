const mongoose = require('mongoose');
const express = require('express');
var router = express.Router();
const path = require('path');
const Events = require('../models/events');
const catchErrors = require('../lib/async-error');

/* GET home page. */
router.get('/', catchErrors(async (req, res, next) => {
  const props = await Events.find();
  console.log("qweqweqwe");
  console.log(props);
  res.render('index', {events: props});
}));

router.get('/waiting', function(req, res, next) {
  res.render('waiting');
});

module.exports = router;
