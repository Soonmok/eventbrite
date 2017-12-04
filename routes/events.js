const express = require('express');
const mongoose = require('mongoose');
const Events = require('../models/events');
const Review = require('../models/review');
const Poll = require('../models/poll');
const ParticipationLog = require('../models/review');
const catchErrors = require('../lib/async-error');

module.exports = io => {
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


  /* GET events listing. */
  router.get('/', catchErrors(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    var query = {};
    const term = req.query.term;
    const setting = req.query.setting;
    const recommendation = req.query.recommendation;
    const recommendationSetting = req.query.recommendationSetting;
    if (term) {
      switch (setting) {
        case 'Keyword':
          console.log("im in Keyword");
          query = {$or: [
            {title: {'$regex': term, '$options': 'i'}},
            {content: {'$regex': term, '$options': 'i'}}
          ]};
          break;

        case 'Location':
          console.log("im in Location");
          query = {$or: [
            {location: {'$regex': term, '$options': 'i'}}
          ]};
          break;

        case 'Type':
          console.log("im in Type");
          query = {$or: [
            {eventType: {'$regex': term, '$options': 'i'}}
          ]};
          break;
      
        default:
          break;
      }
    }
    if (recommendation) {
      switch (recommendationSetting) {
        case 'Review':
          console.log("im in Review");
          query = {$or: [
            {title: {'$regex': recommendation, '$options': 'i'}},
            {content: {'$regex': recommendation, '$options': 'i'}}
          ]};
          break;

        case 'Location':
          console.log("im in Location");
          query = {$or: [
            {location: {'$regex': recommendation, '$options': 'i'}}
          ]};
          break;

        case 'participants':
          console.log("im in Type");
          query = {$or: [
            {eventType: {'$regex': recommendation, '$options': 'i'}}
          ]};
          break;
      
        default:
          break;
      }
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
    res.render('events/edit', {events: events});
  }));

  router.get('/:id', catchErrors(async (req, res, next) => {
    const events = await Events.findById(req.params.id).populate('author');
    const reviews = await Review.find({events: events.id}).populate('author');
    const logs = await ParticipationLog.find({events: events.id}).populate('author'); 
    events.numReads++;    // TODO: 동일한 사람이 본 경우에 Read가 증가하지 않도록???

    await events.save();
    res.render('events/show', {events: events, reviews: reviews, logs: logs});
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
    await Events.findOneAndRemove({_id: req.params.id});
    req.flash('success', 'Successfully deleted');
    res.redirect('/');
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
      eventContent: req.body.content,
      ticketPrice: req.body.ticketPrice,
      numLimit: req.body.numLimit,
    });
    await events.save();
    req.flash('success', 'Successfully posted');
    res.redirect('/events');
  }));

  router.post('/:id/reviews', needAuth, catchErrors(async (req, res, next) => {
    const user = req.user;
    const events = await Events.findById(req.params.id);

    if (!events) {
      req.flash('danger', 'Not exist events');
      return res.redirect('back');
    }

    var review = new Review({
      author: user._id,
      events: events._id,
      content: req.body.content
    });
    await review.save();
    events.numReviews++;
    await events.save();
    const url = `/events/${events._id}#${review._id}`;
    io.to(events.author.toString())
      .emit('reviewed', {url: url, events: events});
    console.log('SOCKET EMIT', events.author.toString(), 'reviewed', {url: url, events: events})
    req.flash('success', 'Successfully reviewed');
    res.redirect(`/events/${req.params.id}`);
  }));



  return router;
}
