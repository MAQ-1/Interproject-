import mongoose, { Schema, Document } from "mongoose";

// 1. Define the Interface (for TypeScript)
export interface INote extends Document {
  title: string;
  content: string;
  user: mongoose.Types.ObjectId; // Links the note to a specific user
  createdAt: Date;
}

// 2. Define the Schema (for MongoDB)
const NoteSchema: Schema = new Schema(
  {
    title: { 
      type: String, 
      required: [true, "Please add a title"], 
      trim: true 
    },
    content: { 
      type: String, 
      required: [true, "Please add some content"] 
    },
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

// 3. Export the Model
export default mongoose.model<INote>("Note", NoteSchema);