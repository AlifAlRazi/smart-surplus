const mongoose = require('mongoose');

// We use the URI from your .env.local
const MONGODB_URI = "mongodb+srv://alif1212:alif1212@cluster0.f1hkf.mongodb.net/smartsurplus";

async function makeAdmin(email) {
  if (!email) {
    console.log("Usage: node scripts/make-admin.js your-email@example.com");
    process.exit(1);
  }

  try {
    console.log(`Connecting to database...`);
    await mongoose.connect(MONGODB_URI);
    
    // Minimal User Schema for the script
    const userSchema = new mongoose.Schema({ email: String, role: String, isVerified: Boolean });
    const User = mongoose.models.User || mongoose.model('User', userSchema);
    
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { $set: { role: 'admin', isVerified: true } },
      { new: true }
    );

    if (user) {
      console.log(`----------------------------------------`);
      console.log(`SUCCESS!`);
      console.log(`User: ${user.email}`);
      console.log(`New Role: ${user.role}`);
      console.log(`----------------------------------------`);
      console.log(`You can now log in and visit /admin`);
    } else {
      console.log(`ERROR: User with email "${email}" not found in the database.`);
    }
    process.exit(0);
  } catch (err) {
    console.error("Connection Error:", err);
    process.exit(1);
  }
}

makeAdmin(process.argv[2]);
