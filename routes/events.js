const express = require('express');
const mongoose = require('mongoose');
const Events = require('../models/events');
const Review = require('../models/review');
const Poll = require('../models/poll');
const ParticipationLog = require('../models/participationLog');
const FavoriteLog = require('../models/favoriteLog');
const catchErrors = require('../lib/async-error');
const Answer = require('../models/answer');

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
    const logs = await ParticipationLog.find({event: events.id}).populate('author');
    const answers = await Answer.find({reviews: reviews.id}).populate('author'); 
    events.numReads++;    // TODO: 동일한 사람이 본 경우에 Read가 증가하지 않도록???
    await events.save();
    res.render('events/show', {events: events, reviews: reviews, logs: logs, answers: answers});
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
      group: req.body.group,
      describeGroup: req.body.describeGroup
    });
    await events.save();
    req.flash('success', 'Successfully posted');
    res.redirect('/events');
  }));

  router.post('/:id/reviews', needAuth, catchErrors(async (req, res, next) => {
    const user = req.user;
    const events = await Events.findById(req.params.id);
    const reviews = await Review.find({events: events.id}).populate('author');

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

  // Poll
  router.get('/:id/poll', needAuth, catchErrors(async (req, res, next) => {
    const events = await Events.findById(req.params.id).populate('author');
    const logs = await ParticipationLog.findOne({author: req.user._id, event: events});
    console.log("im in the fucking get poll");
    console.log(logs);
    if(events.numParticipation > events.numLimit) {
      console.log("the event is full");
      req.flash('danger', 'is full');
      res.redirect(`/events/${req.params.id}`);
    }
    if (logs) {
      if (logs.poll) {
        req.flash('danger', 'already enrolled it');
        return res.redirect(`/events/${req.params.id}`);
      }
      res.render('events/poll', {events: events});
    }
    else { 
      req.flash('danger', 'please participate first');
      return res.redirect(`/events/${req.params.id}`);
      }
  }));
  
  // Poll
  router.post('/:id/poll', needAuth, catchErrors(async (req, res, next) => {
    const user = req.user;
    const event = await Events.findById(req.params.id).populate('author');
    const logs = await ParticipationLog.findOne({author: req.user._id, event: event});
    console.log("logs");
    console.log(logs);
    if (logs && logs.poll) {
      res.redirect(`/events/${req.params.id}`);
    }
    var poll = new Poll({
      author: user._id,
      group: req.body.group,
      reason: req.body.reason
    });
    await poll.save();
    logs.poll = poll;
    await logs.save();
    console.log("poll");
    console.log(poll);
    req.flash('success', 'Successfully polled');
    res.redirect(`/events/${req.params.id}`);
  }));
  
  // answers
  router.post('/:id/answers', needAuth, catchErrors(async (req, res, next) => {
    const user = req.user;
    const review = await Review.findById(req.params.id);
    const events = review.events;
    console.log("im in answer post");
    console.log(events);
    if (!review) {
      req.flash('danger', 'Not exist review');
      return res.redirect('back');
    }

    var answer = new Answer({
      author: user._id,
      review: review._id,
      content: req.body.answer
    });
    await answer.save();
    await review.save();
    console.log("im in answer post2");
    console.log(answer);
    console.log("events id !!!!!"); 
    console.log(events.id);
    console.log("reviews author!!!");
    console.log(review.author);
    const url = `/events/${events.id}#${review._id}`;
    io.to(review.author.toString())
      .emit('answered', {url: url, review: review});
    console.log('SOCKET EMIT', review.author.toString(), 'answered', {url: url, review: review})
    req.flash('success', 'Successfully answered');
    res.redirect(`/events/${events}`);
  }));
  return router;
}
