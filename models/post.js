const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema({
  body: String,
  image: String,
  author: {
    type:Schema.Types.ObjectId,
    ref: "User"
  },
  parentReply: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  childReply: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
});



module.exports = mongoose.model('Post',postSchema);