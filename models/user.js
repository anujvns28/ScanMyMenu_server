import mongoose from "mongoose";


const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    googleId: {
      type: String,
    },

    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
    },

    phone: {
      type: String,
    },

    password: {
      type: String,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["owner", "Admin"],
      default: "owner",
    },

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      default: null,
    },

    menuViews: {
      type: Number,
      default: 0,
    },

    qrScans: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);



export default mongoose.model("User", userSchema);

