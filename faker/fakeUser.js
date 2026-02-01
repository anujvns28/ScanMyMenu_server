const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");

const User = require("../models/user");

exports.seedUsers = async () => {
  try {

    // agar pehle se users hain to dobara mat banao
    const existingUsers = await User.find({ role: "user" });
    if (existingUsers.length >= 20) {
      console.log("✅ Fake users already exist");
      process.exit();
    }

    const users = [];

    for (let i = 1; i <= 20; i++) {
      users.push({
        name: faker.person.fullName(),              // required
        email: faker.internet.email().toLowerCase(),// unique + required
        phone: faker.phone.number("9#########"),    // optional
        password: faker.internet.password(8),       // minlength 6
        role: "user",                               // enum allowed
        restaurant: null,                           // default
        menuViews: faker.number.int({ min: 0, max: 50 }),
        qrScans: faker.number.int({ min: 0, max: 30 }),
      });
    }

    await User.insertMany(users);
    console.log("🎉 Fake users created successfully");

    process.exit();
  } catch (error) {
    console.error("❌ Error creating fake users:", error);
    process.exit(1);
  }
};

