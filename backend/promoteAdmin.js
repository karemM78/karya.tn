require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const promoteAdmin = async (email) => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/karya');
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.error(`User with email ${email} not found.`);
      process.exit(1);
    }
    
    user.role = 'admin';
    await user.save();
    
    console.log(`Successfully promoted ${user.name} (${user.email}) to Admin.`);
    process.exit(0);
  } catch (error) {
    console.error('Error promoting user:', error);
    process.exit(1);
  }
};

const email = process.argv[2];
if (!email) {
  console.log('Usage: node promoteAdmin.js <email>');
  process.exit(1);
}

promoteAdmin(email);
