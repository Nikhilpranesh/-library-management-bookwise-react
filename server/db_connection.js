const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
require("dotenv").config();

mongoose.set("strictQuery", false);

async function connectToDatabase() {
  const databaseUrlFromEnvironment = process.env.DB_URL;
  const connectionOptions = { useNewUrlParser: true, useUnifiedTopology: true };

  try {
    if (databaseUrlFromEnvironment && databaseUrlFromEnvironment.trim().length > 0) {
      await mongoose.connect(databaseUrlFromEnvironment, connectionOptions);
      console.log("Connected To Database");
      return;
    }

    // Fallback to in-memory MongoDB when DB_URL is not provided
    const inMemoryServer = await MongoMemoryServer.create();
    const inMemoryUri = inMemoryServer.getUri();
    await mongoose.connect(inMemoryUri, connectionOptions);
    console.log("Connected to in-memory MongoDB (fallback). Note: Data will reset on restart.");
  } catch (error) {
    console.log("Error while connecting to the database", error);
  }
}

connectToDatabase();