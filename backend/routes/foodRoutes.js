const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const {
  createFood,
  getFoods,
  getFoodById,
  updateFood,
  deleteFood
} = require("../controllers/foodController");

router.get("/", getFoods);
router.get("/:id", getFoodById);
router.post("/", protect, authorize("admin"), createFood);
router.put("/:id", protect, authorize("admin"), updateFood);
router.delete("/:id", protect, authorize("admin"), deleteFood);

module.exports = router;