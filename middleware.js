const ExpressError = require("./errorHandlers/ExpressError");
const JoipostSchema = require("./schemas");
const Post = require("./models/post");
const User = require('./models/user');

module.exports.isLoggedIn = (req,res,next) => {
    if (!req.isAuthenticated()) {
      req.session.returnTo = req.originalUrl;  
      req.flash("error", "You must be logged in!!");
      return res.redirect("/login");
    }
    next();
}

module.exports.validatePost = (req, res, next) => {
  const { error } = JoipostSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  if (!post.author.equals(req.user._id)) {
    req.flash("error", "You don't have permission to do that");
    return res.redirect(`/viewPost/${id}`);
  }
  next();
};

module.exports.Auth = async (req,res,next) => {
  const { id } = req.params;
  if(!req.user._id.equals(id)){
    req.flash("error", "You don't have permission to do that");
    return res.redirect(`/`);
  }
  next();
}