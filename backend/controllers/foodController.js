const Food = require("../models/food");

exports.createFood = async (req, res) => {
  try {
    const food = await Food.create(req.body);
    const populated = await Food.findById(food._id).populate("restaurantId");
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getFoods = async (req, res) => {
  try {
    const { restaurantId, category } = req.query;
    const filter = {};
    if (restaurantId) filter.restaurantId = restaurantId;
    if (category) filter.category = category;
    const foods = await Food.find(filter)
      .populate("restaurantId")
      .sort({ createdAt: -1 });
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id).populate("restaurantId");
    if (!food) return res.status(404).json({ message: "Food not found" });
    res.json(food);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate("restaurantId");
    if (!food) return res.status(404).json({ message: "Food not found" });
    res.json(food);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) return res.status(404).json({ message: "Food not found" });
    res.json({ message: "Food deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};