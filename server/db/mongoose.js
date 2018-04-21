let mongoose = require('mongoose');

mongoose.Promise = global.Promise;

let dbpath = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/TodoApp';

mongoose.connect(dbpath);

module.exports = {mongoose};

