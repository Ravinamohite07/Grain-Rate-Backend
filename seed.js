import mongoose from 'mongoose';
import locationsData from './data/locations.json' assert { type: 'json' };
import Location from './models/location.model.js';
import dotenv from 'dotenv';

// Configure dotenv to load environment variables
dotenv.config();

// --- IMPORTANT ---
// Your MongoDB connection string is now accessed from process.env
const MONGO_URI = process.env.MONGO_URI;

const seedDatabase = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error('MONGO_URI is not defined in your .env file');
    }
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected...');

    // Clear existing data to prevent duplicates
    await Location.deleteMany({});
    console.log('Old location data cleared.');

    // The data in your JSON is under a "states" key
    const statesToInsert = locationsData.states;

    // Insert the data
    await Location.insertMany(statesToInsert);
    console.log('Location data has been successfully seeded!');

  } catch (error) {
    console.error('Error seeding the database:', error);
  } finally {
    // Disconnect from the database
    await mongoose.disconnect();
    console.log('MongoDB Disconnected.');
  }
};

// Run the seeder
seedDatabase();