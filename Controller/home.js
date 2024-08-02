const { Product } = require("../schema/product");
const { User } = require("../schema/User");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

module.exports.homeget = (req, res) => {
  Product.find({}).then((products) => {
    res.render("route/home.ejs", { products });
  });
};
module.exports.newproductget = (req, res) => {
  res.render("route/addnew.ejs", { error: null });
};
module.exports.newproductpost = (req, res) => {
    let newproduct = new Product({
      name: req.body.productname,
      price: req.body.price,
      company: req.body.companyname,
      description: req.body.description,
    });
  newproduct.owner = req.user._id;
  if (req.file) {
    newproduct.picture=req.file.path;
  }
  newproduct.save().then((result) => {
    User.findByIdAndUpdate(req.user._id, { $push: { product: result._id } }).catch((error) => console.log(error));
    req.flash("success", "The new product has been added successfully");
    res.redirect("/");
  })
   

};
module.exports.destroy = (req, res) => {
  let { id } = req.params;
  Product.findByIdAndDelete(id).then((result) => { 
    User.findByIdAndUpdate(req.user._id, { $pull: { product: id } }).catch((error) => console.log(error));
    req.flash("error", "The product has been successfully deleted");
    res.redirect("/");
  })
  }
  module.exports.editget = (req, res) => {
    let { id } = req.params;
    Product.findById(id)
      .then((product) => {
        if (!product) {
          return res.status(404).send("Product not found");
        }
        res.render("route/edit.ejs", { product, error: null });
      })
      .catch((error) => {
        res.status(404).send("page not found");
      });
  };
module.exports.editpost = (req, res) => {
    let { id } = req.params;
  let { productname, companyname, price, description } = req.body;
  Product.findByIdAndUpdate(id, { name: productname, company: companyname, price: price, description: description }, { runValidators: true }).then((result) => {
    if (req.file) {
      result.picture = req.file.path;
    }
   result.save().then(result => {
      console.log(result)
      req.flash("success", "The post has been edited successfully")
      res.redirect("/")
    }).catch(error => console.log(error))

  }).catch((error) => {
    Product.findById(id).then((product) => {
      console.log(error);
      res.render("route/edit.ejs", { product, error: error });
    }).catch(error => console.log(error))
  })
};
