var mongoose = require('mongoose');

// Poll DB Model
// module.exports allows us to pass this to other files when it is called
module.exports = mongoose.model('Poll', {
  result      : String,
  meeting     : Number,
  name        : String,
  description : String,
  options     : [String],
  ID          : mongoose.Schema.ObjectId
});
