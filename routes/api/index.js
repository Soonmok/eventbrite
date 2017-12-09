const express = require('express');
const Event = require('../../models/events'); 
const Review = require('../../models/review'); 
const ParticipationLog = require('../../models/participationLog'); 
const FavoriteLog = require('../../models/favoriteLog'); 
const catchErrors = require('../../lib/async-error');

const router = express.Router();

function needAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash('danger', 'Please signin first.');
    res.redirect('/signin');
  }
}

router.use(catchErrors(async (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    next({status: 401, msg: 'Unauthorized'});
  }
}));

router.use('/events', require('./events'));

// Participation for Event
router.post('/events/:id/participation', catchErrors(async (req, res, next) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return next({status: 404, msg: 'Not exist event'});
  }
  var participationLog = await ParticipationLog.findOne({author: req.user._id, event: event._id});
  console.log("im in participation log");
  console.log(participationLog);
  if (!participationLog) {
    console.log("i dont have log");
    if(event.numParticipation >= event.numLimit) {
      console.log("the event is full");
      return res.json(event);
    }
    else {
      event.numParticipation++;
      await Promise.all([
        event.save(),
        participationLog = ParticipationLog.create({author: req.user._id, event: event._id})
      ]);
    }
    console.log("create log");
    console.log(participationLog);
    return res.json(event);
  }
  else {
    console.log("i have log");
    console.log("log already exist");
    return res.json(event);
  }
}));

router.post('/events/:id/favorite', catchErrors(async (req, res, next) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return next({status: 404, msg: 'Not exist event'});
  }
  var favoriteLog = await FavoriteLog.findOne({author: req.user._id, event: event});
  if (!favoriteLog) {
    await Promise.all([
      event.save(),
      FavoriteLog.create({author: req.user._id, event: event})
    ]);

  }
  else {
    req.flash('danger', 'already enrolled');
  }
  return res.json(favoriteLog);
}));



router.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
      status: err.status,
      msg: err.msg || err
    });
  });

module.exports = router;
