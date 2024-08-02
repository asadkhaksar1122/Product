const express = require("express");
const { islogin } = require("../middleware/middleware");
const { User } = require("../schema/User");
const bcrypt = require("bcrypt");
const router = express.Router();
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Profile-picture", 
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 500, height: 500, crop: "limit" }], // Optional - specify any transformations
  },
});
const upload = multer({ storage: storage });

router.get("/profile", islogin, (req, res) => {
  res.render("route/profile.ejs");
});
router.post("/profile", islogin, upload.single("profile"), (req, res) => {
   
  User.findByIdAndUpdate(req.user._id, { profile: req.file.path })
    .then((result) => {
      req.flash("success", "Profile picture has been updated successfully");
      res.redirect("/profile");
    })
    .catch((error) => {
      console.log(error);
      req.flash("error", error.message);
      res.redirect("/profile");
    });
}); 

router.get("/changename", islogin, (req, res) => {
  res.render("route/changename.ejs");
});
router.post("/changename", islogin, async (req, res) => {
  try {
    let { firstname, secondname } = req.body;
    let user = await User.findById(req.user._id);
    user.firstname = firstname;
    user.secondname = secondname;
    await user.save();
    req.flash("success", "Name changed successfully");
    res.redirect("/profile");
  } catch (error) {
    console.log(error);
    req.flash("error", error.message);
    res.redirect("/profile");
  }
});
router.get("/changepassword", islogin, (req, res) => {
  res.render("route/changepassword.ejs");
});
router.post("/changepassword", islogin, async (req, res) => {
  try {
    let { oldpassword, password } = req.body;
    let user = await User.findById(req.user._id);
    let isPasswordValid = await bcrypt.compare(oldpassword, user.password);
    if (isPasswordValid) {
      let passwordhash = await bcrypt.hash(password, 10);
      user.password = passwordhash;
      await user.save();
      req.flash("success", "The password has been successfully changed");
      res.redirect("/profile");
    } else {
      req.flash("error", "You enter the wrong password");
      res.redirect("/changepassword");
    }
  } catch (error) {
    console.log(error);
    req.flash("error", error.message);
    res.redirect("/changepassword");
  }
});

module.exports = router;
