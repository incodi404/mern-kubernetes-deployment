import mongoose from "mongoose";

const reelSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
            maxlength: [150, "Title cannot exceed 150 characters"],
        },
        url: {
            type: String,
            required: [true, "Reel URL is required"],
            trim: true,
        },
        active: {
            type: Boolean,
            default: true,
        },
        slug: {
            type: String,
            unique: true,
            index: true,
            lowercase: true,
            trim: true,
        },
    },
    { timestamps: true }
);

// Convert a normal reel URL into an iframe-friendly embed URL
reelSchema.virtual("embedUrl").get(function () {
    const clean = this.url.split("?")[0].replace(/\/$/, "");
    return `${clean}/embed`;
});

reelSchema.set("toJSON", { virtuals: true });
reelSchema.set("toObject", { virtuals: true });

const slugify = (text) =>
    String(text)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

// Auto-generate a unique slug from the title
reelSchema.pre("validate", async function () {
    if (this.slug && !this.isModified("title")) return;

    const base = slugify(this.title) || "reel";
    let slug = base;
    let count = 1;

    while (await this.constructor.exists({ slug, _id: { $ne: this._id } })) {
        slug = `${base}-${count++}`;
    }

    this.slug = slug;
});

const Reel = mongoose.model("Reel", reelSchema);

export default Reel;