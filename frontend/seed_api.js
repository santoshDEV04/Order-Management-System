import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/v1';

async function seedData() {
  try {
    console.log('1. Logging in as Admin...');
    const loginRes = await axios.post(`${API_BASE}/users/login`, {
      email: 'dashsantosh2004@gmail.com',
      password: 'Admin@123',
    });

    const token = loginRes.data?.message?.accessToken || loginRes.data?.data?.accessToken;
    console.log('✅ Admin logged in. Token acquired.');

    const headers = { Authorization: `Bearer ${token}` };

    console.log('2. Fetching users to locate managers...');
    const usersRes = await axios.get(`${API_BASE}/users/all-users`, { headers });
    const users = usersRes.data?.data || [];
    
    const indiaManager = users.find(u => u.role === 'MANAGER' && u.country === 'INDIA');
    const usManager = users.find(u => u.role === 'MANAGER' && u.country === 'AMERICA');

    if (!indiaManager || !usManager) {
      console.error('❌ Could not find managers for both INDIA and AMERICA');
      return;
    }

    console.log(`✅ India Manager: ${indiaManager.name} (${indiaManager._id})`);
    console.log(`✅ US Manager: ${usManager.name} (${usManager._id})`);

    const newRestaurants = [
      // 🇮🇳 INDIA RESTAURANTS
      {
        name: 'Tandoori Nights',
        address: '100 Feet Road, Indiranagar, Bangalore',
        country: 'INDIA',
        manager: indiaManager._id,
        dishes: [
          { name: 'Butter Chicken', description: 'Tender chicken simmered in rich creamy tomato and butter gravy', price: 14.99 },
          { name: 'Garlic Butter Naan', description: 'Freshly baked clay oven flatbread with roasted garlic', price: 3.99 },
          { name: 'Mutton Rogan Josh', description: 'Kashmiri style aromatic lamb curry with saffron', price: 16.99 },
          { name: 'Chicken Tikka Kebab', description: 'Charcoal grilled spiced boneless chicken skewers', price: 12.99 },
          { name: 'Mango Lassi', description: 'Chilled yogurt smoothie blended with sweet Alphonso mangoes', price: 3.50 },
        ],
      },
      {
        name: 'Royal Punjab Dhaba',
        address: 'Sector 17 Commercial Complex, Chandigarh',
        country: 'INDIA',
        manager: indiaManager._id,
        dishes: [
          { name: 'Dal Makhani', description: 'Overnight slow-cooked black lentils with cream and spices', price: 11.99 },
          { name: 'Amritsari Stuffed Kulcha', description: 'Crispy layered leavened bread stuffed with spiced potatoes', price: 5.99 },
          { name: 'Tandoori Chicken Platter', description: 'Half roasted chicken marinated in yogurt and red chilies', price: 15.50 },
          { name: 'Paneer Tikka Masala', description: 'Grilled cottage cheese cubes in spiced onion tomato gravy', price: 12.50 },
          { name: 'Gulab Jamun (2 pcs)', description: 'Warm milk-solid dumplings soaked in rose sugar syrup', price: 4.50 },
        ],
      },
      {
        name: 'Coastal Spice & Seafood',
        address: 'Marine Drive Promenade, Mumbai',
        country: 'INDIA',
        manager: indiaManager._id,
        dishes: [
          { name: 'Goan Fish Curry', description: 'Fresh kingfish simmered in tangy coconut tamarind curry', price: 15.99 },
          { name: 'Malabar Prawn Masala', description: 'Jumbo prawns tossed in roasted coconut and curry leaves', price: 17.50 },
          { name: 'Neer Dosa (3 pcs)', description: 'Delicate paper-thin rice crepes with coconut chutney', price: 4.99 },
          { name: 'Crispy Bombil Fry', description: 'Semolina crusted golden fried Bombay duck fish', price: 11.50 },
          { name: 'Solkadhi Refresher', description: 'Digestive drink made from kokum and fresh coconut milk', price: 2.99 },
        ],
      },
      {
        name: 'Dakshin Aromas',
        address: 'T Nagar Shopping District, Chennai',
        country: 'INDIA',
        manager: indiaManager._id,
        dishes: [
          { name: 'Ghee Podi Masala Dosa', description: 'Crisp golden crepe smeared with aromatic spiced lentil powder', price: 7.99 },
          { name: 'Steamed Idli Sambar Platter', description: 'Fluffy steamed rice cakes served with hot lentil vegetable stew', price: 6.50 },
          { name: 'Chettinad Pepper Chicken', description: 'Spicy regional chicken roasted with freshly crushed black peppercorns', price: 13.99 },
          { name: 'Traditional Filter Coffee', description: 'Freshly brewed South Indian chicory decoction with frothy milk', price: 2.50 },
          { name: 'Ghee Mysore Pak', description: 'Melt-in-mouth traditional sweet made of gram flour and pure ghee', price: 4.00 },
        ],
      },
      {
        name: 'Kolkata Heritage Kitchen',
        address: 'Park Street Dining Row, Kolkata',
        country: 'INDIA',
        manager: indiaManager._id,
        dishes: [
          { name: 'Kolkata Mutton Biryani', description: 'Fragrant basmati rice with spiced lamb and golden fried potato', price: 16.50 },
          { name: 'Kosha Mangsho', description: 'Slow-cooked velvety dark mutton gravy with Bengali spices', price: 15.99 },
          { name: 'Chicken Kathi Roll', description: 'Flaky paratha wrap stuffed with charcoal grilled spiced chicken', price: 8.50 },
          { name: 'Baked Rasgulla (2 pcs)', description: 'Classic cottage cheese dumplings caramel baked in creamy rabri', price: 4.50 },
          { name: 'Mishti Doi Earthen Pot', description: 'Traditional sweetened caramelized yogurt set in clay pot', price: 3.50 },
        ],
      },

      // 🇺🇸 AMERICA RESTAURANTS
      {
        name: 'Empire State Smokehouse',
        address: '450 Flatbush Ave, Brooklyn, New York',
        country: 'AMERICA',
        manager: usManager._id,
        dishes: [
          { name: 'Smoked Texas Brisket', description: '14-hour hickory smoked prime beef brisket with house BBQ sauce', price: 22.99 },
          { name: 'BBQ Pulled Pork Sandwich', description: 'Slow-smoked pulled pork shoulder on toasted brioche with slaw', price: 15.50 },
          { name: 'Smoked St. Louis Ribs', description: 'Half rack tender ribs basted in brown sugar bourbon glaze', price: 24.99 },
          { name: 'Four-Cheese Macaroni', description: 'Cavatappi pasta baked in sharp cheddar, gruyere, and parmesan', price: 7.99 },
          { name: 'Skillet Cornbread', description: 'Warm southern cornbread served with whipped honey butter', price: 4.50 },
        ],
      },
      {
        name: 'Golden Gate Pizzeria',
        address: '820 Valencia St, Mission District, San Francisco',
        country: 'AMERICA',
        manager: usManager._id,
        dishes: [
          { name: 'Truffle Mushroom Pizza', description: 'Wood-fired crust with wild mushrooms, fontina, and truffle oil', price: 19.99 },
          { name: 'Spicy Hot Honey Pepperoni', description: 'Artisan pepperoni, fresh mozzarella, and chili-infused honey', price: 18.50 },
          { name: 'Classic Caesar Salad', description: 'Crisp romaine hearts, shaved parmigiano, and garlic croutons', price: 9.50 },
          { name: 'Garlic Parmesan Knots', description: 'Freshly baked dough knots tossed in roasted garlic and herbs', price: 5.99 },
          { name: 'Espresso Tiramisu', description: 'Layered ladyfingers soaked in dark roast espresso and mascarpone', price: 7.50 },
        ],
      },
      {
        name: 'Austin Craft Tacos',
        address: '1600 South Congress Ave, Austin, Texas',
        country: 'AMERICA',
        manager: usManager._id,
        dishes: [
          { name: 'Birria Tacos with Consommé (3 pcs)', description: 'Slow-braised beef with melted cheese and rich dipping broth', price: 14.99 },
          { name: 'Carne Asada Tacos', description: 'Charred skirt steak with pickled onions, cilantro, and salsa verde', price: 13.50 },
          { name: 'Fresh Guacamole & Tortilla Chips', description: 'Hand-mashed Hass avocados, lime, jalapeño, and warm chips', price: 8.00 },
          { name: 'Loaded Queso Blanco', description: 'Melted white cheese dip topped with chorizo and pico de gallo', price: 7.50 },
          { name: 'Cinnamon Sugar Churros', description: 'Warm crispy churros served with warm Mexican chocolate dip', price: 6.00 },
        ],
      },
      {
        name: 'Chicago Deep Dish Kitchen',
        address: '220 Michigan Ave, Downtown Chicago',
        country: 'AMERICA',
        manager: usManager._id,
        dishes: [
          { name: 'The Windy City Deep Dish', description: 'Thick butter crust packed with Italian sausage and crushed plum tomatoes', price: 24.99 },
          { name: 'Chicago Italian Beef Sandwich', description: 'Thinly sliced seasoned roast beef dipped in au jus with spicy giardiniera', price: 13.99 },
          { name: 'Crispy Buffalo Wings (10 pcs)', description: 'Tossed in spicy cayenne pepper sauce with blue cheese and celery', price: 12.50 },
          { name: 'Golden Mozzarella Sticks', description: 'Panko breaded mozzarella with marinara dipping sauce', price: 8.50 },
          { name: 'Classic New York Cheesecake', description: 'Dense rich cheesecake with strawberry compote topping', price: 6.99 },
        ],
      },
      {
        name: 'Pacific Wave Seafood Grill',
        address: '1200 Alaskan Way, Waterfront, Seattle',
        country: 'AMERICA',
        manager: usManager._id,
        dishes: [
          { name: 'Wild Alaskan King Salmon', description: 'Pan-seared salmon fillet over lemon herb quinoa and asparagus', price: 27.99 },
          { name: 'Dungeness Crab Cakes', description: 'Pan-browned sweet crab cakes with whole grain mustard remoulade', price: 19.50 },
          { name: 'Pacific Clam Chowder Bowl', description: 'Creamy chowder with tender sea clams served in a sourdough bread bowl', price: 11.99 },
          { name: 'Beer-Battered Fish & Chips', description: 'Crispy Alaskan cod with seasoned steak fries and tartar sauce', price: 16.50 },
          { name: 'Key Lime Pie', description: 'Tangy Florida key lime custard with graham cracker crust', price: 7.00 },
        ],
      },
    ];

    for (const restData of newRestaurants) {
      const { dishes, ...restPayload } = restData;
      console.log(`\n3. Creating restaurant "${restPayload.name}" in ${restPayload.country}...`);
      
      const restRes = await axios.post(`${API_BASE}/resturants`, restPayload, { headers });
      const createdRest = restRes.data?.data || restRes.data?.message || restRes.data;
      const restId = createdRest?._id;

      if (!restId) {
        console.error('❌ Failed to get created restaurant ID:', restRes.data);
        continue;
      }

      console.log(`✅ Restaurant created: ${createdRest.name} (ID: ${restId})`);

      for (const dish of dishes) {
        console.log(`   → Adding dish "${dish.name}" ($${dish.price})...`);
        await axios.post(`${API_BASE}/menu/${restId}`, dish, { headers });
      }
      console.log(`   ✅ All 5 dishes added for ${createdRest.name}.`);
    }

    console.log('\n🎉 Successfully seeded 10 restaurants (5 for INDIA, 5 for AMERICA) with 5 dishes each!');
  } catch (error) {
    console.error('❌ Error during seeding:', error.response?.data || error.message);
  }
}

seedData();
