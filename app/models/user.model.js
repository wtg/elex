var mongoose = require('mongoose');

// User DB Model
// module.exports allows us to pass this to other files when it is called
module.exports = mongoose.model('User', {
  name : String,
  ID   : mongoose.Schema.ObjectId
});
