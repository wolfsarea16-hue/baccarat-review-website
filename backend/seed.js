// backend/seed.js
// Run this file once to populate the database with sample data
// Command: node seed.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');
const Product = require('./models/Product');

dotenv.config();

const sampleProducts = [
  { name: 'Wireless Bluetooth Headphones', description: 'High-quality over-ear headphones with noise cancellation' },
  { name: 'Smart Watch', description: 'Fitness tracker with heart rate monitor' },
  { name: 'Laptop Stand', description: 'Ergonomic aluminum laptop stand' },
  { name: 'USB-C Hub', description: '7-in-1 USB-C adapter with HDMI and USB ports' },
  { name: 'Mechanical Keyboard', description: 'RGB gaming keyboard with blue switches' },
  { name: 'Wireless Mouse', description: 'Ergonomic wireless mouse with precision tracking' },
  { name: 'Phone Case', description: 'Protective case with shock absorption' },
  { name: 'Power Bank', description: '20000mAh portable charger with fast charging' },
  { name: 'Screen Protector', description: 'Tempered glass screen protector' },
  { name: 'Cable Organizer', description: 'Cable management system for desk' },
  { name: 'LED Desk Lamp', description: 'Adjustable brightness desk lamp with USB charging' },
  { name: 'Webcam HD', description: '1080p webcam with auto-focus' },
  { name: 'External SSD', description: '1TB portable solid state drive' },
  { name: 'Bluetooth Speaker', description: 'Waterproof portable speaker' },
  { name: 'Gaming Mouse Pad', description: 'Large RGB gaming mouse pad' },
  { name: 'Phone Holder', description: 'Adjustable phone stand for desk' },
  { name: 'Earbuds', description: 'True wireless earbuds with charging case' },
  { name: 'Monitor Arm', description: 'Dual monitor arm mount' },
  { name: 'Webcam Cover', description: 'Privacy slider for webcam' },
  { name: 'Laptop Backpack', description: 'Anti-theft backpack with USB charging port' },
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/product-review-db');

    console.log('Connected to MongoDB');

    // Clear existing data
    await Admin.deleteMany({});
    await Product.deleteMany({});

    console.log('Cleared existing data');

    // Create admin account
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const admin = new Admin({
      username: 'admin',
      password: hashedPassword
    });

    await admin.save();
    console.log('Admin account created (username: admin, password: admin123)');

    // Create sample products
    const products = sampleProducts.map(p => new Product(p));
    await Product.insertMany(products);

    console.log(`${products.length} sample products added`);

    console.log('\nDatabase seeded successfully!');
    console.log('\nAdmin Login Credentials:');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('\nYou can now start the server with: npm run dev');

    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

seedDatabase();