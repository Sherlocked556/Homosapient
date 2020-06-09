 //app config
var bodyParser=require("body-parser"),
method =require("method-override"),
expressSanitizer=require("express-sanitizer"),
mongoose      =require("mongoose"),
express       =require("express"),
app           =express()
mongoose.connect("mongodb+srv://dev:dev1@cluster0-9e1vn.mongodb.net/<dbname>?retryWrites=true&w=majority");
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

app.use(require("express-session")({
    secret: "this is the session secret",
    resave: false,
    saveUninitialized: false,
  }));

  app.use((req,res,next)=>{
    res.locals.currentUser=req.session.logged?req.session.logged:false;
    console.log(res.locals.currentUser,"here");
    next();
  });
  
 app.get("/login", (req, res) => {
    res.render("login");
  });

  app.post("/login",  (req, res) => {
      console.log(req)
    if(req.body.password==='devkey123')
    {
        ssn=req.session
        ssn.logged=true
         res.status(200).json({"ssn":ssn})
    }
    else
    {
        res.status(401).json({"err":"bad key"})
    }
    res.end("ended")
  });
  app.get("/logout", (req,res)=>{
    ssn=req.session
        ssn.logged=false
    res.redirect("/blogs");
  });

  function isLoggedIn(req,res,next){
    if(req.session.logged){
      return next();
    }
    else
    res.redirect("/");
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

