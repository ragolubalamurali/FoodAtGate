const mongoose = require('mongoose');
require('dotenv').config();

const Restaurant = require('./models/restaurant');
const Food = require('./models/food');

async function seedRestaurants() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connection SUCCESS');

        // Check if restaurants already exist
        let rest1 = await Restaurant.findOne({ name: "Campus Bites" });
        let rest2 = await Restaurant.findOne({ name: "Student Cafe" });

        if (!rest1) {
            rest1 = await new Restaurant({
                name: "Campus Bites",
                location: "North Gate",
                contact: "1234567890",
                isActive: true
            }).save();
            console.log("Created Restaurant 1");
        }

        if (!rest2) {
            rest2 = await new Restaurant({
                name: "Student Cafe",
                location: "South Gate",
                contact: "0987654321",
                isActive: true
            }).save();
            console.log("Created Restaurant 2");
        }

        const foods = await Food.find({});
        for (let i = 0; i < foods.length; i++) {
            if (!foods[i].restaurantId) {
                foods[i].restaurantId = i < foods.length / 2 ? rest1._id : rest2._id;
                await foods[i].save();
            }
        }

        console.log("Foods updated with restaurants");
        process.exit(0);

    } catch (error) {
        console.error('Error running script:', error);
        process.exit(1);
    }
}

seedRestaurants();
