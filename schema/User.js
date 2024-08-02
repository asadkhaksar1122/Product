const mongoose = require("mongoose");
let Schema = mongoose.Schema;
let { Product } = require("./product")
const passportLocalMongoose = require("passport-local-mongoose");
const { type } = require("express/lib/response");
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/Product");
}
const emailValidator = {  validator: function (v) {
    // Regular expression for email validation
    return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
  },
  message: (props) => `${props.value} is not a valid email address!`,
};
let userschema = new Schema({
  email: {
    type: String,
    required: [true, "The email should not be empty"],
    unique: [true, "The email already exists, please log in"],
    minLength: [4, "You entered the wrong email"],
    validate: [emailValidator],
  },
  firstname: {
    type: String,
    require: [true, "First name should not be empty"],
    minLength: [2, "Too short first name"],
  },
  secondname: {
    type: String,
    require: [true, "Second name should not be empty"],
    minLength: [2, "Too short second name"],
  },
  password: {
    type: String,
    require: [true, "Password should not be empty"],
    minLength: [8, "Too short password"],
  },
  verified: { type: Boolean, default: false },
  product: [
    {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  profile: {
    type: String,
    required:[true,"the profile can't be empty"],
    default: "https://res.cloudinary.com/diinrpqko/image/upload/v1721044995/Profile-picture/ypa7azp0aqstyfb6yadj.jpg",

  },
  verificationToken: {
    type: String,
    expires: 600,
  },
  resetPasswordToken: {
    type: String,
    expires: 600, 
  },
});

userschema.plugin(passportLocalMongoose, {
  usernameField: "email",
  passwordField: "password",
});

let User = mongoose.model("User", userschema);
// User.deleteMany({}).then(result => console.log(result));
userschema.pre('remove', async function(next) {
  await Product.deleteMany({ owner: this._id });
  next();
});

module.exports = { User };