const mongoose = require("mongoose");
let {User}=require("./User")
let Schema = mongoose.Schema;
main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/Product");
}
let Productschema = new Schema({
  name: {
    type: String,
    required: [true, "The name can't be empty"],
    minLength: [2, "The name of Product is too short"],
  },
  price: {
    type: Number,
    required: [true, "price can't be empty"],
    min: [1, "The invalid price"],
  },
  company: {
    type: String,
    required: [true, "The company name should not be empty"],
    minLength: [2, "the company name is too short"],
  },
  description: {
    type: String,
    required: [true, "The description can't be empty"],
    minLength: [2, "The description is too short"],
  },
  picture: {
    type: String,
    required: [true, "The picture can't be empty"],
    default:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1744&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});
let Product = mongoose.model("Product", Productschema);
module.exports = { Product };