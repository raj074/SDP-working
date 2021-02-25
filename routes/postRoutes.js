const express = require('express');
const router = express.Router();
const Post = require("../models/post");
const catchAsync = require("../errorHandlers/catchAsync");
const { isLoggedIn, validatePost, isAuthor } = require("../middleware");

  



router.get('/',catchAsync(async (req,res) =>{
    const posts = await Post.find({ parentReply: { $exists: true, $size: 0 } }).populate('author');
    res.render('home', { posts });
}))


router.get("/newPost",isLoggedIn ,  (req, res) => {
 
  res.render('new');
  
})

router.post('/newPost', isLoggedIn, validatePost, catchAsync(async (req,res) =>{
 
    const post = new Post(req.body.post);
    post.author = req.user._id;
    await post.save();
    req.flash('success' , 'Successfully created post!');
    res.redirect('/');
}))

router.get('/viewPost/:id',catchAsync((async (req,res) =>{
    const { id } = req.params;
    const post = await Post.findById(id).populate({ 
      path:'childReply',
      populate: {
        path: 'author'
      }
    }).populate({ 
      path:'parentReply',
      populate: {
        path: 'author'
      }
    }).populate('author');
   
    if(!post){
      req.flash('error',"Can't find that post!");
      return res.redirect('/');
    }
    // console.log(post.parentReply)
    res.render('show', {post});
})))

router.delete("/viewPost/:id", isLoggedIn,isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) {
      req.flash("error", "Can't find that post!");
      return res.redirect("/");
    }
    var toBeDeleted = [...post.childReply];
    for (let pivot = 0; pivot < toBeDeleted.length; pivot++) {
      const post = await Post.findById(toBeDeleted[pivot]);
      if (post) {
        if (post.childReply != "") {
          toBeDeleted.push(...post.childReply);
        } else {
          continue;
        }
      } else {
        continue;
      }
    }
    
    const parent = post.parentReply[0];
    // console.log(parent);
    await Post.findByIdAndUpdate(parent,{ $pull:{ childReply:post._id } });
    

    toBeDeleted.push(post._id);
    // console.log(toBeDeleted);

    await Post.deleteMany({ _id: { $in: toBeDeleted } });
    req.flash("success", "Post is deleted Successfully");
    res.redirect("/");
  })
)



router.post("/viewPost/:id/reply", isLoggedIn,validatePost, catchAsync(async (req, res) => {
    const parentPost = await Post.findById(req.params.id);
    const newPost = new Post(req.body.post);
    newPost.author = req.user._id;
    await parentPost.childReply.push(newPost);
    await newPost.parentReply.push(parentPost);

    await newPost.parentReply.push(...parentPost.parentReply);

    await newPost.save();
    await parentPost.save();
    req.flash("success", "Your reply is posted successfully");
    res.redirect(`/viewPost/${parentPost._id}`);
  })
)



module.exports = router;