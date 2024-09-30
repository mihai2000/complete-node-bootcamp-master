// const fs = require('fs');
const { query } = require('express');
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
///////////////////////////////////////////////
// 5) ALIASING
// 5 best and cheapest tours (sorting ratings first and then the price)
// {{domain_port}}/api/v1/tours?limit=5&sort=-ratingsAverage, price

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage, price';
  req.query.fields = 'name, price,ratingsAverage, summary, difficulty';
  next();
};

//CRUD for operating from a real database
exports.getAllTours = catchAsync(async (req, res, next) => {
  //EXECUTE QUERY
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  //SEND RESPONSE
  console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTourById = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  //Tour.findOne({_id:req.params.id})
  // if not tour false, else true
  if (!tour) {
    return next(new AppError('No tour found with that id', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  //called the function directly on the document
  // const newTour = new Tour({})
  // newTour.save();
  //called the function directly on the module
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'created with success',
    data: {
      tour: newTour,
    },
  });
});

exports.updateTourById = catchAsync(async (req, res, next) => {
  const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    // new: true=> return the new updated document
    new: true,
    runValidators: true,
  });
  if (!updatedTour) {
    return next(new AppError('No tour found with that id', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour: updatedTour,
    },
  });
});
exports.deleteTourById = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError('No tour found with that id', 404));
  }
  res.status(204).json({
    //204 no content , deleted
    status: 'success',
    data: null,
  });
});

//Tour Statistics
exports.getTourStats = catchAsync(async (req, res, next) => {
  //aggregation manipulate the data in different stats
  const stats = await Tour.aggregate([
    {
      // match => select or filter selected doc
      $match: {
        ratingsAverage: { $gte: 4.5 },
      },
    },
    {
      $group: {
        //have everything in one group , thats why we put null to id
        // _id: null,
        _id: { $toUpper: '$difficulty' }, //show the difficulty instead of id as id field
        numRatings: { $sum: '$ratingsQuantity' },
        numTours: { $sum: 1 }, //for each doc from this return will add one to calculate each tour
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        avgPrice: 1, //1 for ascending
      },
    },
    // {
    //   $match: {
    //     _id: { $ne: 'EASY' },//not equal to 'EASY'
    //   },
    // },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; //2021
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    //match is to select documents
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        //grouping by the month
        _id: { $month: '$startDates' },
        numToursStarts: { $sum: 1 },
        //put to an array the name field with the $push
        tours: { $push: '$name' },
      },
    },
    { $addFields: { month: '$_id' } },
    {
      $project: {
        _id: 0, //id no logner shows up
      },
    },
    {
      $sort: {
        numTourStarts: -1, //descending show
      },
    },
    {
      $limit: 12, //only 12 documents
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

///////////////////////////////////////////////
//CRUD for operatin from a file
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

//fourth param , the value of the parammeter
// exports.checkID = (req, res, next, val) => {
//   if (val > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID',
//     });
//   }
//   next();
// };
// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price',
//     });
//   }
//   next();
// };
// exports.getAllTours = (req, res) => {
//   console.log(req.requestTime);
//   res.status(200).json({
//     status: 'success',
//     requestedAt: req.requestTime,
//     results: tours.length,
//     data: { tours },
//   });
// };

// exports.getTourById = (req, res) => {
//   const id = req.params.id * 1; //multiply a string with a number, will convert that string to a number
//   const tour = tours.find((el) => el.id === id); //find the data for the id we need

//   res.status(200).json({
//     status: 'success',
//     data: { tour },
//   });
// };
// exports.createTour = (req, res) => {
//   // need middleware: data to put is available in req
//   const newId = tours[tours.length - 1].id + 1; // get the last item on tours db(json), and increment it with 1 to put next item id
//   const newTour = Object.assign({ id: newId }, req.body);
//   tours.push(newTour);
//   fs.writeFile(
//     `${__dirname}/../dev-data/data/tours-simple.json`,
//     //with json.stringify with make the body to a json mode, without it is just an object
//     JSON.stringify(tours),
//     (err) => {
//       //created status
//       res.status(201).json({
//         status: 'created with success',
//         data: {
//           tour: newTour,
//         },
//       });
//     }
//   );
// };

// exports.updateTourById = (req, res) => {
//   const id = req.params.id * 1;
//   const tour = tours.find((tour) => tour.id === id);
//   const updatedTour = { ...tour, ...req.body };
//   const updatedTours = tours.map((tour) =>
//     tour.id === updatedTour.id ? updatedTour : tour
//   );
//   fs.writeFile(
//     `${__dirname}/../dev-data/data/tours-simple.json`,
//     JSON.stringify(updatedTours),
//     (err) => {
//   res.status(200).json({
//     status: 'success',
//     data: updatedTour,
//   });
//     }
//   );
// };
// exports.deleteTourById = (req, res) => {
//   const id = req.params.id * 1;
//   //need to find the index of the tour we want to delete
//   const tour = tours.findIndex((tour) => tour.id === id);

//   if (tour === -1) {
//     // no tour fond in the array
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID',
//     });
//   }
//   //remove the tour from the array
//   tours.splice(tour, 1);
//   fs.writeFile(
//     `${__dirname}/../dev-data/data/tours-simple.json`,
//     JSON.stringify(tours),
//     (err) => {
//       if (err) {
//         return res.status(500).json({
//           status: 'error',
//           message: 'Could not delete the tour',
//         });
//       }

//   res.status(204).json({
//     //204 no content , deleted
//     status: 'success',
//     data: null,
//   });
//     }
//   );
// };
