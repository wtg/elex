var mongoose = require('mongoose');

// Vote DB Model
// module.exports allows us to pass this to other files when it is called
module.exports = mongoose.model('Vote', {
  result      : String,
  meeting     : Number,
  user        : Number,
  name        : String,
  Description : String,
  ID          : mongoose.Schema.ObjectId
});
