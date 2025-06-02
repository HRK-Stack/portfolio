import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderName: {
    type: String,
    required: [true, "Sender name is required"],
    minlength: [2, "Name should be at least 2 characters long"],
  },
  subject: {
    type: String,
    required: [true, "Subject is required"],
    minlength: [2, "Subject should be at least 2 characters long"],
  },
  message: {
    type: String,
    required: [true, "Message content is required"],
    minlength: [2, "Message should be at least 2 characters long"],
  },
}, {
  timestamps: true, // adds createdAt and updatedAt automatically
});


export const Message = mongoose.model("Message" , messageSchema);