const express = require("express");
const router = express.Router();
const usercontroller=require("../Controller/user")
const passport = require("passport");
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
    folder: "Profile-picture", // Optional - specify the folder in Cloudinary to store the files
    allowed_formats: ["jpg", "png", "jpeg"], // Specify only image formats allowed for upload
    transformation: [{ width: 500, height: 500, crop: "limit" }], // Optional - specify any transformations
  },
});
const upload = multer({ storage: storage });


router.get("/signup", usercontroller.signupget);

router.post(
  "/signup",
  upload.single("profile"),
  usercontroller.signuppost
);
router.get("/logout",usercontroller.logout);
router.get("/login", usercontroller.loginget);
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
 usercontroller.loginpost
);
router.get("/verify/:token", usercontroller.verifytoken);
router.get("/forgetpassword",usercontroller.forgetpasswordget);
router.post("/forgetpassword",usercontroller.forgetpasswordpost);
router.get("/resetpassword/:resettoken", usercontroller.resetpasswordget);
router.post("/resetpassword/:resettoken", usercontroller.resetpasswordpost);
router.get("/resendverificationtoken", usercontroller.resendverificationget);
router.post("/resendverificationtoken",usercontroller.resendverificationpost);
module.exports = router;
