const { Product } = require("../schema/product")

module.exports.islogin = (req,res,next) => {
    if (req.user) {
     return   next()
    }
    req.flash("error","Please login or signup first")
    res.redirect("/login")
}
module.exports.isowner = (req, res, next) => {
    let { id } = req.params;
    Product.findById(id).then((result) => {
        if (result.owner.equals(req.user._id)) { 
            return next()
        }
        req.flash("error","You are not the owner of this product")
        res.redirect("/")
    })
}