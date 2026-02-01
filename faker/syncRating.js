const Product = require("../models/Product");
const OverAllRating = require("../models/overallRating&Review");
const Shop = require("../models/shop");

/**
 * Sync product.rating & product.reviewsCount
 * using OverAllRatingAndReview collection
 */
const syncProductRatings = async () => {
  try {
    const allRatings = await OverAllRating.find();

    if (!allRatings.length) {
      console.log("❌ No overall ratings found");
      return;
    }

    for (const ratingDoc of allRatings) {
      await Product.findByIdAndUpdate(
        ratingDoc.product,
        {
          rating: ratingDoc.averageRating,
          reviewsCount: ratingDoc.totalRatings,
        },
        { new: true }
      );
    }

    console.log("✅ Product ratings & review counts synced successfully");
  } catch (err) {
    console.error("❌ Error syncing product ratings:", err);
  }
};



/**
 * Sync shop.rating & shop.reviewCount
 * based on OverAllRatingAndReview (product-level)
 */
const syncShopRatings = async () => {
  try {
    const shops = await Shop.find();

    if (!shops.length) {
      console.log("❌ No shops found");
      return;
    }

    for (const shop of shops) {
      // 🔹 shop ke saare products lao
      const products = await Product.find({ shop: shop._id });

      if (!products.length) {
        await Shop.findByIdAndUpdate(shop._id, {
          rating: 0,
          reviewCount: 0,
        });
        continue;
      }

      let totalRatingSum = 0;
      let totalReviewCount = 0;

      for (const product of products) {
        const overall = await OverAllRating.findOne({
          product: product._id,
        });

        if (!overall || overall.totalRatings === 0) continue;

        totalRatingSum +=
          overall.averageRating * overall.totalRatings;

        totalReviewCount += overall.totalRatings;
      }

      const shopRating =
        totalReviewCount === 0
          ? 0
          : Number(
              (totalRatingSum / totalReviewCount).toFixed(1)
            );

      await Shop.findByIdAndUpdate(shop._id, {
        rating: shopRating,
        reviewCount: totalReviewCount,
      });
    }

    console.log("✅ Shop ratings & review counts synced successfully");
  } catch (err) {
    console.error("❌ Error syncing shop ratings:", err);
  }
};



module.exports = { syncProductRatings,syncShopRatings };



