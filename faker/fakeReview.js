const mongoose = require("mongoose");
const path = require("path");
const { faker } = require("@faker-js/faker");
const fs = require("fs");


const Product = require("../models/Product");
const Review = require("../models/rating&review");
const OverAllRating = require("../models/overallRating&Review");
const Shop = require("../models/shop");
const User = require("../models/user");

const { getRandomImageByCategory } = require("../faker/foodImages");
const { uploadLocalImageToCloudinary } = require("../utility/ImageUploader");

/* ---------------- REVIEW TEXT POOL ---------------- */

const SKIP_CATEGORIES = ["Starters", "Main Course"];


const reviewTexts = {
  5: [
    "Absolutely amazing taste, highly recommended!",
    "Best dish on the menu, loved it!",
    "Perfect flavor and great quantity.",
  ],
  4: [
    "Really good taste and presentation.",
    "Worth the price, enjoyed the food.",
    "Good quality and nice portion.",
  ],
  3: [
    "Average taste, but filling.",
    "Okay experience, could be better.",
    "Decent food for the price.",
  ],
};

/* ---------------- HELPERS ---------------- */

const getReviewTextByRating = (rating) => {
  const texts = reviewTexts[rating] || reviewTexts[4];
  return texts[Math.floor(Math.random() * texts.length)];
};

const getAbsolutePath = (relativePath) => {
  // "/public/food/Momos1.jpg" -> absolute path
  return path.join(__dirname, "..", relativePath);
};

const uploadRandomImages = async (categoryName) => {
  const imageCount = faker.number.int({ min: 1, max: 5 });
  const urls = [];

  let attempts = 0;

  while (urls.length < imageCount && attempts < 10) {
    attempts++;

    const localImage = getRandomImageByCategory(categoryName);
    if (!localImage) continue;

    const absolutePath = getAbsolutePath(localImage);

    // 🔥 CHECK: file exist karti hai ya nahi
    if (!fs.existsSync(absolutePath)) {
      console.warn(`⚠️ Image not found, skipping: ${absolutePath}`);
      continue; // ⬅️ skip this iteration
    }

    try {
      const uploaded = await uploadLocalImageToCloudinary(
        absolutePath,
        "scanmymenu/reviews"
      );

      urls.push(uploaded.secure_url);
    } catch (err) {
      console.warn("⚠️ Cloudinary upload failed, skipping image");
      continue; // ⬅️ skip and move ahead
    }
  }

  return urls;
};


/* ---------------- MAIN SEED FUNCTION ---------------- */

const seedFakeReviews = async () => {
  try {

    const products = await Product.find().populate("category shop");
    const users = await User.find({ role: "user" });

    if (!products.length) {
      console.log("❌ No products found");
      return;
    }


    /* 🔥 RESET PRODUCT & SHOP RATINGS */
    await Product.updateMany({}, {
      rating: 0,
      reviewsCount: 0,
      orderCount: 0,
    });

    await Shop.updateMany({}, {
      rating: 0,
      reviewCount: 0,
    });


    const shopStats = {};

    for (const product of products) {

       if (!SKIP_CATEGORIES.includes(product.category.displayName)) {
    console.log(
      `⏭️ Skipping category: ${product.category.displayName}`
    );
    continue; // ⬅️ next product
  }

      const reviewCount = faker.number.int({ min: 10, max: 15 });

      let ratingSum = 0;
      let starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

      for (let i = 0; i < reviewCount; i++) {
        const rating = faker.number.int({ min: 3, max: 5 });
        ratingSum += rating;
        starCounts[rating]++;

        const reviewer =
          users.length > 0
            ? users[Math.floor(Math.random() * users.length)]._id
            : new mongoose.Types.ObjectId();

        const images = await uploadRandomImages(product.category.displayName);

        await Review.create({
          user: reviewer,
          product: product._id,
          shop: product.shop._id,
          rating,
          reviewText: getReviewTextByRating(rating),
          images,
          isVerifiedPurchase: faker.datatype.boolean(),
        });
      }

      const avgRating = Number((ratingSum / reviewCount).toFixed(1));

      /* PRODUCT UPDATE */
      await Product.findByIdAndUpdate(product._id, {
        rating: avgRating,
        reviewsCount: reviewCount,
        orderCount: faker.number.int({ min: 100, max: 900 }),
      });

      await OverAllRating.findOneAndDelete({product:product._id})

      /* OVERALL RATING */
      await OverAllRating.create({
        product: product._id,
        averageRating: avgRating,
        totalRatings: reviewCount,
        starCounts,
      });

      /* SHOP AGGREGATION */
      const shopId = product.shop._id.toString();
      if (!shopStats[shopId]) {
        shopStats[shopId] = { sum: 0, count: 0 };
      }
      shopStats[shopId].sum += ratingSum;
      shopStats[shopId].count += reviewCount;
    }

    /* SHOP UPDATE */
    for (const shopId in shopStats) {
      const { sum, count } = shopStats[shopId];
      const shopRating = Number((sum / count).toFixed(1));

      await Shop.findByIdAndUpdate(shopId, {
        rating: shopRating,
        reviewCount: count,
      });
    }

    console.log("🎉 Fake reviews created with Cloudinary images");
    process.exit(0);

  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
};

module.exports = { seedFakeReviews };
