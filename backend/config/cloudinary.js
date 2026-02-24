const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

console.log("Cloudinary Configured with name:", process.env.CLOUDINARY_NAME);

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "multi-vendor-products",
        allowed_formats: ["jpg", "png", "jpeg", "webp"],
    },
});

const upload = multer({ storage });

module.exports = { cloudinary, storage, upload };
