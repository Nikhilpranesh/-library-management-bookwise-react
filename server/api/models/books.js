const mongoose = require("mongoose");

const bookSchema = mongoose.Schema(
    {
        Title: { type: String, required: true },
        Author: { type: String, required: true },
        Price: { type: Number, required: true },
        Genre: { type: String, required: true },
        Image: { type: String, default: "" },
        pdfUrl: { type: String, default: "" }, // URL to stored PDF
        copyType: { type: String, enum: ['hardcopy', 'softcopy', 'both'], default: 'hardcopy' }, // Available copy types
    },
    { timestamps: true }
);

bookSchema.index({ Title: "text" });
module.exports = mongoose.model("book", bookSchema);
