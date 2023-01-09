const mongoose = require("mongoose");

mongoose.connect(process.env.API_URL, {});

if (mongoose.connection) {
  console.log("Database has been connected");
} else if (!mongoose.connection) {
  console.log("Failed to connect to database");
}
