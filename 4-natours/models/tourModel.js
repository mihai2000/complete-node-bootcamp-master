const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must havea name'],
      unique: true,
      trim: true,
      // data validation only for strings
      maxLength: [40, 'A tour name must have less or equal than 40 characters'],
      minLength: [10, 'A tour name must have more or equal than 10 characters'],
      // validate: [validator.isAlpha, 'A tour name must have only letters'], the whitespace doesnt allow to create
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      // data validatons,  enum :only for strings
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either:easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      // data validations,  min max are for numbers and Dates
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: { type: Number, default: 0 },
    price: { type: Number, required: [true, 'A tour must have a price'] },
    priceDiscount: {
      type: Number,
      // only needs to return true or false
      validate: {
        validator: function (val) {
          // this only points to current docu, on NEW document creation
          // this keyword, will not be able to the update, only on create
          return val < this.price; //100<200: true
        },
        // only for mongo, de message has acces to the value, of the dicount price, so we can put it in the message as shown below
        message: 'Discount price ({VALUE}) should be below the regulat price',
      },
    },
    summary: {
      type: String,
      //trim only works for strings: remove all the white space in the beggining or end
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover iamge'],
    },
    //[String ]=>defines array of strings the [ ]
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      //select :false represents if i dont want this field to be shown in the return response
      //select:false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
// the virtuals can not be used in query, because they are not part of the database
//only regualar function get 'this' keyword,     when wanted 'this' , do not use the arrow function
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7; //WEEKS IN DAYS
});
//DOCUMENT MIDDLEWARE, runs before .save() and .create(), can have many .pre hooks
//pre middleware, run before an actual event, this function will be called before and after a doc is saved
tourSchema.pre('save', function (next) {
  //create a string for a precise field that we have , that takes its value
  this.slug = slugify(this.name, { lower: true });
  next();
});
// tourSchema.pre('save', function (next) {
//   //create a string for a precise field that we have , that takes its value
//   Console.log('will save doc...');
//   next();
// });
// //post are executed after the rpe were finished
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

//QUERY MIDDLEWARE , allows to run functions before or after certain queries  is executed
// query that is executed before other queries executed
// find=>point to a query not a document
// if we have a secre tour that need for only a certain users to see, we can put it so only those can get the retunr of it

// all the stirngs that starts with find, lie findOne, findById etc throw a regex
tourSchema.pre(/^find/, function (next) {
  // tourSchema.pre('find', function (next) {
  // 'this' is a object
  // filter out the secretTour
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
tourSchema.post(/^find/, function (docs, next) {
  console.log(`query took ${Date.now() - this.start}miliseconds`);
  next();
});
// AGGREGATION MIDDLEWARE, ALLOWS TO ADD HOOKS BEFORE OR AFTER AGGREGATION HAPPENS
tourSchema.pre('aggregate', function (next) {
  //unshift:= add at the beggining of the array,  shift := add at the end of an array
  this.pipeline().unshift({
    $match: { secretTour: { $ne: true } },
  });
  next();
});
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
