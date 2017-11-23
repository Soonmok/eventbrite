const express = require('express');
const mongoose = require('mongoose');
const Events = require('../models/events');
//const Answer = require('../models/answer'); 
const catchErrors = require('../lib/async-error');

const router = express.Router();

// 동일한 코드가 users.js에도 있습니다. 이것은 나중에 수정합시다.
function needAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash('danger', 'Please signin first.');
    res.redirect('/signin');
  }
}


/* GET eventss listing. */
router.get('/', catchErrors(async (req, res, next) => {
  console.log("please");
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  var query = {};
  const term = req.query.term;
  if (term) {
    query = {$or: [
      {title: {'$regex': term, '$options': 'i'}},
      {content: {'$regex': term, '$options': 'i'}}
    ]};
  }
  const events = await Events.paginate(query, {
    sort: {createdAt: -1}, 
    populate: 'author', 
    page: page, limit: limit
  });
  res.render('events/index', {events: events, term: term, query: req.query});
}));

router.get('/new', needAuth, (req, res, next) => {
 
  res.render('events/new', {events: {}});
});

router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
  const events = await Events.findById(req.params.id);
  res.render('events/index', {event: event});
}));

router.get('/:id', catchErrors(async (req, res, next) => {
  const events = await Events.findById(req.params.id).populate('author');
  //const answers = await Answer.find({events: events.id}).populate('author');
  events.numReads++;    // TODO: 동일한 사람이 본 경우에 Read가 증가하지 않도록???

  await events.save();
  //res.render('events/index', {events: events, answers: answers});
  res.render('events/show', {events: events});
}));

router.put('/:id', catchErrors(async (req, res, next) => {
  const events = await Events.findById(req.params.id);

  if (!events) {
    req.flash('danger', 'Not exist events');
    return res.redirect('back');
  }
  events.title = req.body.title;
  events.content = req.body.content;
  events.tags = req.body.tags.split(" ").map(e => e.trim());

  await events.save();
  req.flash('success', 'Successfully updated');
  res.redirect('/events/index');
}));

router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
  await events.findOneAndRemove({_id: req.params.id});
  req.flash('success', 'Successfully deleted');
  res.redirect('/events/index');
}));

router.post('/', needAuth, catchErrors(async (req, res, next) => {
  const user = req.user;
  var events = new Events({
    title: req.body.title,
    content: req.body.content,
    location: req.body.location,
    author: user._id,
    startTime: req.body.startTime,
    finishTime: req.body.finishTime,
    free: req.body.free,
    eventType: req.body.eventType,
    eventTopic: req.body.eventTopic,
    eventContent: req.body.content
  });
  await events.save();
  req.flash('success', 'Successfully posted');
  res.redirect('/events');
}));

router.post('/:id/answers', needAuth, catchErrors(async (req, res, next) => {
  const user = req.user;
  const events = await Events.findById(req.params.id);

  if (!events) {
    req.flash('danger', 'Not exist events');
    return res.redirect('back');
  }

  var answer = new Answer({
    author: user._id,
    events: events._id,
    content: req.body.content
  });
  await answer.save();
  events.numAnswers++;
  await events.save();

  
  req.flash('success', 'Successfully answered');
  res.redirect(`/events/${req.params.id}`);
}));



module.exports = router;
