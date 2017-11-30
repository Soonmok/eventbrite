const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

var schema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  title: {type: String, trim: true, required: true},
  content: {type: String, trim: true, required: true},
  location: {type: String, trim: true, required: true},
  startTime: {type: String, trim: true, required: true},
  finishTime: {type: String, trim: true, required: true},
  free: {type: String, trim: true, required: true},
  eventType: {type: String, trim: true, required: true},
  eventTopic: {type: String, trim: true, required: true},
  numParticipation: {type: Number, default: 0},
  numLimit: {type: Number, default: 10},
  numReads: {type: Number, default: 0},
  createdAt: {type: Date, default: Date.now},
  ticketPrice: {type: Number, default: 0},
  numReviews: {type: Number, default: 0},
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
schema.plugin(mongoosePaginate);
var Event = mongoose.model('Event', schema);

module.exports = Event;
