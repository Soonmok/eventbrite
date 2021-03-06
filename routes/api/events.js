const express = require('express');
const Event = require('../../models/events');
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
  const event = await Event.findById(req.params.id).populate('author');
  res.json(event);
}));

// Create
router.post('', catchErrors(async (req, res, next) => {
  var event = new Event({
    title: req.body.title,
    author: req.user._id,
    content: req.body.content,
    tags: req.body.tags.map(e => e.trim()),
  });
  await event.save();
  res.json(event);
}));

// Put
router.put('/:id', catchErrors(async (req, res, next) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return next({status: 404, msg: 'Not exist event'});
  }
  if (event.author && event.author._id != req.user._id) {
    return next({status: 403, msg: 'Cannot update'});
  }
  event.title = req.body.title;
  event.content = req.body.content;
  event.tags = req.body.tags;
  await event.save();
  res.json(event);
}));

// Delete
router.delete('/:id', catchErrors(async (req, res, next) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return next({status: 404, msg: 'Not exist event'});
  }
  if (event.author && event.author._id != req.user._id) {
    return next({status: 403, msg: 'Cannot update'});
  }
  await Event.findOneAndRemove({_id: s});
  res.json({msg: 'deleted'});
}));




module.exports = router;