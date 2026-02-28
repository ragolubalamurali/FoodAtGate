const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    image: String,
    category: {
      type: String,
      enum: ["veg", "non-veg"],
      default: "veg"
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Food", foodSchema);