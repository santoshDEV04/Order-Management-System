/**
 * Seed Script: Adds demo restaurants and menu items
 * Run: node seed.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// ---- Inline Models ----
const UserSchema = new mongoose.Schema({ name: String, email: String, role: String, country: String });
const User = mongoose.model("User", UserSchema);

const resturantSchema = new mongoose.Schema({
  name: String, address: String, country: String, isActive: { type: Boolean, default: true }, manager: mongoose.Schema.Types.ObjectId
});
const Resturant = mongoose.model("Resturant", resturantSchema);

const menuItemSchema = new mongoose.Schema({
  resturant: mongoose.Schema.Types.ObjectId, name: String, description: String, price: Number, isAvailable: { type: Boolean, default: true }
});
const MenuItem = mongoose.model("MenuItem", menuItemSchema);

// ---- Restaurant + Menu Data ----
const INDIA_RESTAURANTS = [
  {
    name: "Spice Garden",
    address: "12 MG Road, Bangalore, Karnataka",
    menus: [
      { name: "Butter Chicken", description: "Creamy tomato-based curry with tender chicken pieces", price: 8.99 },
      { name: "Garlic Naan", description: "Soft leavened bread with garlic and butter", price: 2.49 },
      { name: "Dal Makhani", description: "Slow-cooked black lentils in rich buttery gravy", price: 6.99 },
      { name: "Paneer Tikka", description: "Chargrilled cottage cheese with spiced marinades", price: 7.49 },
      { name: "Mango Lassi", description: "Chilled yogurt drink blended with Alphonso mango pulp", price: 3.29 },
    ]
  },
  {
    name: "Mumbai Bites",
    address: "45 Juhu Beach Road, Mumbai, Maharashtra",
    menus: [
      { name: "Vada Pav", description: "Spiced potato fritter in a soft bun — Mumbai's iconic street food", price: 1.99 },
      { name: "Pav Bhaji", description: "Buttery mashed vegetable curry served with toasted buns", price: 5.49 },
      { name: "Chicken Biryani", description: "Fragrant basmati rice layered with marinated chicken and saffron", price: 9.99 },
      { name: "Samosa Chaat", description: "Crispy pastry shells topped with chickpeas, chutneys, and yogurt", price: 4.29 },
      { name: "Cutting Chai", description: "Strong half-cup Indian spiced tea, a Mumbai staple", price: 1.49 },
    ]
  },
  {
    name: "Delhi Darbar",
    address: "18 Connaught Place, New Delhi",
    menus: [
      { name: "Tandoori Chicken", description: "Whole chicken marinated in yogurt and spices, cooked in clay oven", price: 11.99 },
      { name: "Seekh Kebab", description: "Minced lamb kebab on skewers with herbs", price: 8.49 },
      { name: "Chole Bhature", description: "Spicy chickpeas served with deep-fried puffed bread", price: 5.99 },
      { name: "Raita", description: "Chilled yogurt with cucumber and cumin", price: 2.49 },
      { name: "Gulab Jamun", description: "Soft milk-solid dumplings soaked in rose-flavored sugar syrup", price: 3.49 },
    ]
  },
];

const AMERICA_RESTAURANTS = [
  {
    name: "Liberty Burgers",
    address: "88 5th Avenue, New York, NY",
    menus: [
      { name: "Classic Smash Burger", description: "Double smashed beef patty, American cheese, house sauce on brioche bun", price: 12.99 },
      { name: "BBQ Bacon Burger", description: "Crispy bacon, cheddar, onion rings, and smoky BBQ sauce", price: 14.49 },
      { name: "Truffle Fries", description: "Crispy shoestring fries tossed in truffle oil and Parmesan", price: 5.99 },
      { name: "Vanilla Milkshake", description: "Thick hand-spun shake with real vanilla bean ice cream", price: 6.49 },
      { name: "Onion Rings", description: "Beer-battered golden onion rings served with chipotle dip", price: 4.99 },
    ]
  },
  {
    name: "Pizza Republic",
    address: "224 Sunset Blvd, Los Angeles, CA",
    menus: [
      { name: "Margherita Pizza", description: "San Marzano tomatoes, fresh mozzarella, basil on thin crust", price: 13.99 },
      { name: "Pepperoni Feast", description: "Double-layer pepperoni with mozzarella and tomato sauce", price: 15.99 },
      { name: "BBQ Chicken Pizza", description: "Grilled chicken, red onion, mozzarella, BBQ sauce base", price: 16.49 },
      { name: "Caesar Salad", description: "Romaine lettuce, shaved Parmesan, croutons, Caesar dressing", price: 7.99 },
      { name: "Garlic Bread Sticks", description: "Warm butter-brushed breadsticks with marinara dipping sauce", price: 5.49 },
    ]
  },
];

async function seed() {
  console.log("🔗 Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Connected.");

  // Find managers for each country
  const indiaManagers = await User.find({ role: "MANAGER", country: "INDIA" }).lean();
  const americaManagers = await User.find({ role: "MANAGER", country: "AMERICA" }).lean();

  console.log(`\n🇮🇳 India Managers found: ${indiaManagers.length}`);
  indiaManagers.forEach(m => console.log(`   - ${m.name} (${m.email})`));
  console.log(`🇺🇸 America Managers found: ${americaManagers.length}`);
  americaManagers.forEach(m => console.log(`   - ${m.name} (${m.email})`));

  if (indiaManagers.length === 0 && americaManagers.length === 0) {
    console.error("\n❌ No managers found! Please register at least one MANAGER user first via the app.");
    process.exit(1);
  }

  let restaurantsCreated = 0;
  let menuItemsCreated = 0;

  // Seed INDIA restaurants
  if (indiaManagers.length > 0) {
    for (let i = 0; i < INDIA_RESTAURANTS.length; i++) {
      const data = INDIA_RESTAURANTS[i];
      const manager = indiaManagers[i % indiaManagers.length];
      
      // Check if restaurant already exists
      const existing = await Resturant.findOne({ name: data.name, country: "INDIA" });
      if (existing) {
        console.log(`⚠️  Skipping "${data.name}" — already exists.`);
        continue;
      }

      const restaurant = await Resturant.create({
        name: data.name, address: data.address, country: "INDIA", manager: manager._id
      });
      restaurantsCreated++;
      console.log(`\n✅ Created: ${restaurant.name} [INDIA] — Manager: ${manager.name}`);

      for (const item of data.menus) {
        await MenuItem.create({ resturant: restaurant._id, ...item });
        menuItemsCreated++;
        console.log(`   🍽️  Added: ${item.name} — $${item.price}`);
      }
    }
  }

  // Seed AMERICA restaurants
  if (americaManagers.length > 0) {
    for (let i = 0; i < AMERICA_RESTAURANTS.length; i++) {
      const data = AMERICA_RESTAURANTS[i];
      const manager = americaManagers[i % americaManagers.length];
      
      const existing = await Resturant.findOne({ name: data.name, country: "AMERICA" });
      if (existing) {
        console.log(`⚠️  Skipping "${data.name}" — already exists.`);
        continue;
      }

      const restaurant = await Resturant.create({
        name: data.name, address: data.address, country: "AMERICA", manager: manager._id
      });
      restaurantsCreated++;
      console.log(`\n✅ Created: ${restaurant.name} [AMERICA] — Manager: ${manager.name}`);

      for (const item of data.menus) {
        await MenuItem.create({ resturant: restaurant._id, ...item });
        menuItemsCreated++;
        console.log(`   🍔  Added: ${item.name} — $${item.price}`);
      }
    }
  }

  console.log(`\n🎉 Done! Created ${restaurantsCreated} restaurants and ${menuItemsCreated} menu items.`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
