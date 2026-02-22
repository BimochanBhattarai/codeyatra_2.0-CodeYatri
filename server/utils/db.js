import mongoose from "mongoose";

/**
 * Connect to the MongoDB database
 */
export const connect_to_db = async () => {
  try {
    // Connect to the MongoDB database using the MONGODB_URI and MONGODB_DBNAME environment variables
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DBNAME,
    });

    // Log a message when successfully connected to the MongoDB database
    mongoose.connection.on("connected", () => {
      console.log("Connected to MongoDB");
    });

    // Log an error message when there is an error connecting to the MongoDB database
    mongoose.connection.on("error", (err) => {
      console.log("Error connecting to MongoDB", err);
    });
  } catch (error) {
    // Log an error message if there is an error connecting to the MongoDB database
    console.log("Error connecting to MongoDB", error);
  }
};
