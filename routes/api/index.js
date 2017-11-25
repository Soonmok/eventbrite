const express = require('express');
const Event = require('../../models/events'); 
const Review = require('../../models/review'); 
const ParticipationLog = require('../../models/participation-log'); 
const catchErrors = require('../../lib/async-error');

const router = express.Router();

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
  console.log(req.params.id);
  console.log("im in post");
  console.log(event.title);
  if (!event) {
    return next({status: 404, msg: 'Not exist event'});
  }
  var participationLog = await ParticipationLog.findOne({author: req.user._id, event: event._id});
  if (!participationLog) {
    console.log("im increasing number");
    console.log("num == ")
    console.log(event.numParticipation);
    event.numParticipation++;
    console.log("num == ")
    console.log(event.numParticipation);
    await Promise.all([
      event.save(),
      ParticipationLog.create({author: req.user._id, event: event._id})
    ]);
  }
  return res.json(event);
}));

router.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
      status: err.status,
      msg: err.msg || err
    });
  });

module.exports = router;
