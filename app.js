 //app config
var bodyParser=require("body-parser"),
method =require("method-override"),
expressSanitizer=require("express-sanitizer"),
mongoose      =require("mongoose"),
express       =require("express"),
app           =express(),
passport = require("passport"),
LocalStrategy = require("passport-local"),
passportLocalMongoose=require("passport-local-mongoose");
mongoose.connect("mongodb://u5kyxnwgwelwhqkmyqna:AMzmv6YfnwzYJ9ghKkSx@bkyobuj9jyra5z2-mongodb.services.clever-cloud.com:27017/bkyobuj9jyra5z2");
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());
app.use(method("_method"));
//mongoose mondel config
var blogSchema=new mongoose.Schema({
    title:String,
    image:String,
    body:String,
    created: {type: Date,default: Date.now} 

});
var Blog=mongoose.model("Blog", blogSchema);
var UserSchema=new mongoose.Schema({
   username:String,
   password:String
});
UserSchema.plugin(passportLocalMongoose);
var User=mongoose.model("User",UserSchema);
//Passport config
app.use(require("express-session")({
    secret: "achchA ji aapko sab pata hai chalo dekhte hau",
    resave: false,
    saveUninitialized: false,
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  passport.use(new LocalStrategy(User.authenticate()));
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());
  app.use((req,res,next)=>{
    res.locals.currentUser=req.user;
    console.log(res.locals.currentUser);
    next();
  });
  
 app.get("/login", (req, res) => {
    res.render("login");
  });

  app.post("/login", passport.authenticate("local", {
    successRedirect: "/blogs",
    failureRedirect: "/login"
  }), (req, res) => {
    //middleware waala
  });
  app.get("/logout", (req,res)=>{
    req.logout();
    res.redirect("/blogs");
  });

  function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
      return next();
    }
    res.redirect("/login");
  };
// Restful routes
app.get("/",(req,res)=>{
    res.redirect("/blogs");
});
app.get("/blogs",(req,res)=>{
    Blog.find({},(err,blogs)=>{
        if(err){
            console.log(err);
        }
        else{
            res.render("index",{blogs:blogs});
        }
    });
    
});
//new route
app.get("/blogs/new",isLoggedIn,(req,res)=>{
    res.render("new");
});
//create route
app.post("/blogs",isLoggedIn,(req,res)=>{
    req.body.blog.body=req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog,(err, newBlog)=>{
        if(err){
            res.render("new");
        }
        else{
            res.redirect("/blogs");
        }
    })
});
app.get("/blogs/:id",(req,res)=>{
    Blog.findById(req.params.id,(err,foundBlog)=>{
        if (err) {
            res.redirect("/blogs")
            
        } else {
            res.render("show",{blog:foundBlog})
            
        }
    })
});
app.get("/blogs/:id/edit",isLoggedIn,(req,res)=>{
    Blog.findById(req.params.id,(err ,foundBlog)=>{
        if (err) {
            res.redirect("/blogs");
            
        } else {
            res.render("edit",{blog:foundBlog});
        }
    });
    
});
app.put("/blogs/:id",isLoggedIn,(req,res)=>{
    req.body.blog.body=req.sanitize(req.body.blog.body);
       Blog.findByIdAndUpdate(req.params.id,req.body.blog,(err,updatedBlog)=>{
        if (err) {
            res.redirect("/blogs");
            
        } else {
            res.redirect("/blogs/"+req.params.id);
            
        }
    })
    
});

app.delete("/blogs/:id",isLoggedIn,(req,res)=>{
    Blog.findByIdAndRemove(req.params.id,(err)=>{
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.redirect("/blogs");
        }
    })
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.listen(port,process.env.IP,()=>{
    console.log("started");

});

