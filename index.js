const express = require("express");
const app = express();
const path=require("path")
const port = 3000;
const bcrypt=require("bcrypt")
const engine = require("ejs-mate");
const homeroute = require("./routes/home")
const userroute = require("./routes/user")
const user2route = require("./routes/user2")
const mongoose = require("mongoose");
const session = require("express-session");
var flash = require("connect-flash");
const passport =require("passport")
const LocalStrategy = require("passport-local");
const passportLocalMongoose = require('passport-local-mongoose');
const { User } = require("./schema/User");
main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/Product");
}
app.set("views", path.join(__dirname ,"/views"));
app.set("view engine","ejs")
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.engine("ejs", engine);

app.use(
  session({
    secret: "my superduber secret key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        let user = await User.findOne({ email: email });
        if (!user) {
          return done(null, false, { message: "Email not exists" });
        }
        if (!user.verified) {
          return done(null, false, {
            message: "Please verify your email address",
          });
        }
        let isPasswordValid = await bcrypt.compare(password, user.password);
        if (isPasswordValid) {
          return done(null, user);
        } else {
          return done(null, false, { message: "Invalid password" });
        }
      } catch (error) {
        return done(error);
      }
    }
  )
);
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next) => {
  res.locals.currentuser = req.user;
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    next()
})

app.use("/",homeroute)
app.use("/",userroute)
app.use("/",user2route)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
