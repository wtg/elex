var mongoose = require('mongoose');

// Group DB Model
// module.exports allows us to pass this to other files when it is called
module.exports = mongoose.model('Group', {
  name    : String,
  desc    : String,
  admin   : String,
  allowed : Array,
  ID      : ObjectId
});
