const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const User = require("./models/user");
    const Food = require("./models/food");

    // Update admin user role
    const adminResult = await User.findOneAndUpdate(
        { email: "admin@foodatgate.com" },
        { role: "admin" },
        { new: true }
    );
    if (adminResult) {
        console.log("Admin user role updated:", adminResult.email);
    } else {
        console.log("Admin user not found, registering...");
    }

    // Seed food items
    const existingFoods = await Food.countDocuments();
    if (existingFoods > 0) {
        console.log(`Already have ${existingFoods} food items, skipping seed.`);
    } else {
        const foods = [
            {
                name: "Margherita Pizza",
                description: "Classic pizza with tomato sauce, mozzarella, and fresh basil",
                price: 250,
                category: "veg",
                image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400"
            },
            {
                name: "Chicken Burger",
                description: "Juicy grilled chicken patty with lettuce, tomato, and mayo",
                price: 180,
                category: "non-veg",
                image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400"
            },
            {
                name: "Caesar Salad",
                description: "Fresh romaine lettuce with Caesar dressing and croutons",
                price: 150,
                category: "veg",
                image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400"
            },
            {
                name: "Chocolate Brownie",
                description: "Rich chocolate brownie with vanilla ice cream",
                price: 120,
                category: "veg",
                image: "https://images.unsplash.com/photo-1607478900766-efe13248b125?w=400"
            },
            {
                name: "French Fries",
                description: "Crispy golden fries with ketchup",
                price: 80,
                category: "veg",
                image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400"
            },
            {
                name: "Cold Coffee",
                description: "Refreshing cold coffee with ice cream",
                price: 100,
                category: "veg",
                image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400"
            },
            {
                name: "Paneer Butter Masala",
                description: "Creamy paneer curry with rich tomato gravy and spices",
                price: 220,
                category: "veg",
                image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400"
            },
            {
                name: "Chicken Biryani",
                description: "Aromatic basmati rice with tender chicken and spices",
                price: 280,
                category: "non-veg",
                image: "https://images.unsplash.com/photo-1563379091339-03246963d4ad?w=400"
            },
            {
                name: "Veg Fried Rice",
                description: "Wok-tossed rice with mixed vegetables and soy sauce",
                price: 160,
                category: "veg",
                image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400"
            },
            {
                name: "Fish Curry",
                description: "Fresh fish in coconut-based curry with traditional spices",
                price: 320,
                category: "non-veg",
                image: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=400"
            },
            {
                name: "Mushroom Pasta",
                description: "Creamy pasta with sauteed mushrooms and herbs",
                price: 240,
                category: "veg",
                image: "https://images.unsplash.com/photo-1551892370-c85696784b0d?w=400"
            },
            {
                name: "Tandoori Chicken",
                description: "Marinated chicken grilled in tandoor oven",
                price: 260,
                category: "non-veg",
                image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400"
            },
            {
                name: "Dosa",
                description: "Crispy fermented crepe served with sambar and chutney",
                price: 120,
                category: "veg",
                image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400"
            },
            {
                name: "Butter Chicken",
                description: "Tender chicken in rich, creamy tomato-based curry",
                price: 290,
                category: "non-veg",
                image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae391?w=400"
            },
            {
                name: "Chole Bhature",
                description: "Spicy chickpea curry served with deep-fried bread",
                price: 160,
                category: "veg",
                image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400"
            }
        ];

        await Food.insertMany(foods);
        console.log(`Seeded ${foods.length} food items`);
    }

    await mongoose.disconnect();
    console.log("Done!");
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
