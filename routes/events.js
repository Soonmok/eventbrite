const express = require('express');
const Event = require('../../models/events');
const catchErrors = require('../../lib/async-error');

const router = express.Router();

// Index
router.get('/', catchErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const events = await Event.paginate({}, {
    sort: {createdAt: -1}, 
    populate: 'author',
    page: page, limit: limit
  });
  res.json({events: events.docs, page: events.page, pages: events.pages});   
}));

// Read
router.get('/:id', catchErrors(async (req, res, next) => {
  const events = await Event.findById(req.params.id).populate('author');
  res.json(events);
}));

// Create
router.post('', catchErrors(async (req, res, next) => {
  var events = new Event({
    title: req.body.title,
    author: req.user._id,
    content: req.body.content,
    tags: req.body.tags.map(e => e.trim()),
  });
  await events.save();
  res.json(events)
}));

// Put
router.put('/:id', catchErrors(async (req, res, next) => {
  const events = await Event.findById(req.params.id);
  if (!events) {
    return next({status: 404, msg: 'Not exist events'});
  }
  if (events.author && events.author._id != req.user._id) {
    return next({status: 403, msg: 'Cannot update'});
  }
  events.title = req.body.title;
  events.content = req.body.content;
  events.tags = req.body.tags;
  await events.save();
  res.json(events);
}));

// Delete
router.delete('/:id', catchErrors(async (req, res, next) => {
  const events = await Event.findById(req.params.id);
  if (!events) {
    return next({status: 404, msg: 'Not exist event'});
  }
  if (events.author && events.author._id != req.user._id) {
    return next({status: 403, msg: 'Cannot update'});
  }
  await Event.findOneAndRemove({_id: req.params.id});
  res.json({msg: 'deleted'});
}));


module.exports = router;