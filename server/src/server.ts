import app from "./app.js";
import mongoose from "mongoose";
import { config } from "./config.js";

const PORT = process.env.PORT || 5000;

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.get("/", (req, res) => {
  res.send("<h1>Backend is officially LIVE!</h1><p>MongoDB is connected and the server is running.</p>");
});
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });
