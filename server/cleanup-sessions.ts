import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in .env");
  process.exit(1);
}

const SessionSchema = new mongoose.Schema({
  status: String,
  documentId: mongoose.Schema.Types.ObjectId,
});

const Session = mongoose.model("Session", SessionSchema);

const cleanup = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Delete all closed sessions
    const result = await Session.deleteMany({ status: "closed" });
    console.log(`✅ Deleted ${result.deletedCount} closed sessions`);

    // Or alternatively, delete ALL sessions to start fresh
    // const result = await Session.deleteMany({});
    // console.log(`✅ Deleted ${result.deletedCount} sessions`);

    await mongoose.disconnect();
    console.log("Cleanup complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error during cleanup:", error);
    process.exit(1);
  }
};

cleanup();
