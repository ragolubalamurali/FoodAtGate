const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const {
  createRestaurant,
  getRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  toggleRestaurant
} = require("../controllers/restaurantController");

router.get("/", getRestaurants);
router.get("/:id", getRestaurantById);
router.post("/", protect, authorize("admin"), createRestaurant);
router.put("/:id", protect, authorize("admin"), updateRestaurant);
router.put("/:id/toggle", protect, authorize("admin"), toggleRestaurant);
router.delete("/:id", protect, authorize("admin"), deleteRestaurant);

module.exports = router;