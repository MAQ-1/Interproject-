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

const DocumentSchema = new mongoose.Schema({
  lastOpenedSessionId: mongoose.Schema.Types.ObjectId,
});

const Document = mongoose.model("Document", DocumentSchema);

const cleanup = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear all lastOpenedSessionId references
    const result = await Document.updateMany(
      { lastOpenedSessionId: { $exists: true } },
      { $unset: { lastOpenedSessionId: "" } }
    );
    
    console.log(`✅ Cleared lastOpenedSessionId from ${result.modifiedCount} documents`);

    await mongoose.disconnect();
    console.log("Cleanup complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error during cleanup:", error);
    process.exit(1);
  }
};

cleanup();
