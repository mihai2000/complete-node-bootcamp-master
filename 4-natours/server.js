const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION, Shutting down ...');
  console.log(err.name, err.message);
  // 0: success, 1: uncaught exception
  // to uncaught exception is obligatory to shut down
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection succsefull');
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REGECTION, Shutting down server...');
  console.log(err.name, err.message);
  // 0: success, 1: uncaught exception
  // to uncaught exception is optional to shut down
  server.close(() => {
    process.exit(1);
  });
});
