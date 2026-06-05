const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(process.env.EMAIL_PASS);

    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.log("❌ DB Error:", error);

    process.exit(1);
  }
};

module.exports = connectDB;