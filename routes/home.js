const express = require("express");
const router = express.Router();
const { Product } = require("../schema/product");
const homeroute=require("../Controller/home");
const { islogin, isowner } = require("../middleware/middleware");
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
    folder: "Product-picture", // Optional - specify the folder in Cloudinary to store the files
    allowed_formats: ["jpg", "png", "jpeg"], // Specify only image formats allowed for upload
    transformation: [{ width: 500, height: 500, crop: "limit" }], // Optional - specify any transformations
  },
});
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Only JPG, JPEG, and PNG file formats are allowed!"));
    }
    cb(null, true);
  },
});
router.get("/", homeroute.homeget);
router.get("/delete/:id" ,islogin,isowner, homeroute.destroy);
router.get('/edit/:id',islogin,isowner, homeroute.editget)
router.post("/edit/:id",islogin,isowner,upload.single("productpicture"), homeroute.editpost);
router
  .route("/newproduct")
  .get(islogin, homeroute.newproductget)
  .post(islogin, upload.single("productpicture"), homeroute.newproductpost);
module.exports = router;
