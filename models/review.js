const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

var schema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  events: { type: Schema.Types.ObjectId, ref: 'Event' },
  content: {type: String, trim: true, required: true},
  createdAt: {type: Date, default: Date.now},
  answer: {type: String, trim: true }
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
schema.plugin(mongoosePaginate);
var Review = mongoose.model('Review', schema);

module.exports = Review;
