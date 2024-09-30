const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const app = express();
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
// 1) MIDDLEWARE
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json()); //middleware, function that can modify the request data, without it , the data we post is undefined
app.use(express.static(`${__dirname}/public`)); //search for the file .html on public folder and we can search iot like /overveiw.html on web

//express now we are defining a middleware, cause of the next prop added (the third argument)

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 2) ROUTES

//mounting the routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
// all http mnethods, if a url is not existent
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`), 404);
});
// by putting all these 4 methods, err,req,res,next express
// will now that this is a middleware error handling expression
app.use(globalErrorHandler);

module.exports = app;
// Test