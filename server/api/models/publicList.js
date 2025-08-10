const mongoose = require("mongoose");

const publicListSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    ownerUsername: { type: String, default: "guest" },
    bookIds: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("public_list", publicListSchema); 