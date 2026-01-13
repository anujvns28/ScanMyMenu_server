import OverAllRatingAndReview from "../models/overallRating&Review.js"
import Product from "../models/Product.js";
import RatingandReview from "../models/rating&review.js";
import Shop from "../models/shop.js";
import { uploadImageToCloudinary } from "../utility/ImageUploader.js";

export const addReview = async (req, res) => {
  try {
    const { productId, rating, reviewText, shopId } = req.body;
    const userId = req.user.id;

    if (!productId || !rating || !shopId) {
      return res.status(400).json({
        success: false,
        message: "Product, rating and shop are required",
      });
    }

    // 1️⃣ Block duplicate review
    const alreadyReviewed = await RatingandReview.findOne({
      user: userId,
      product: productId,
    });

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "You already reviewed this product",
      });
    }

    // 2️⃣ Upload images
    let files = req.files?.images;
    if (!files) files = [];
    else if (!Array.isArray(files)) files = [files];

    let uploadedImages = [];

    if (files.length > 0) {
      for (const file of files) {
        const upload = await uploadImageToCloudinary(
          file,
          process.env.FOLDER_NAME
        );
        uploadedImages.push(upload.secure_url);
      }
    }

    // 3️⃣ Create review
    const review = await RatingandReview.create({
      user: userId,
      product: productId,
      shop: shopId,
      rating,
      reviewText,
      images: uploadedImages,
      isVerifiedPurchase: true,
    });

    // 4️⃣ Update product star stats
    let ratingDoc = await OverAllRatingAndReview.findOne({
      product: productId,
    });

    if (!ratingDoc) {
      ratingDoc = await OverAllRatingAndReview.create({
        product: productId,
        totalRatings: 1,
        averageRating: rating,
        starCounts: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
          [rating]: 1,
        },
      });
    } else {
      ratingDoc.totalRatings += 1;
      ratingDoc.starCounts[rating] += 1;

      const totalStars =
        ratingDoc.starCounts[1] * 1 +
        ratingDoc.starCounts[2] * 2 +
        ratingDoc.starCounts[3] * 3 +
        ratingDoc.starCounts[4] * 4 +
        ratingDoc.starCounts[5] * 5;

      ratingDoc.averageRating = (totalStars / ratingDoc.totalRatings).toFixed(
        1
      );

      await ratingDoc.save();
    }

    // 5️⃣ Sync Product from ratingDoc (🔥 no rounding bug)
    await Product.findByIdAndUpdate(productId, {
      rating: ratingDoc.averageRating,
      reviewsCount: ratingDoc.totalRatings,
    });

    // 6️⃣ Recalculate Shop rating correctly
    const shopReviews = await RatingandReview.find({ shop: shopId });

    const shopAvg =
      shopReviews.reduce((sum, r) => sum + r.rating, 0) / shopReviews.length;

    await Shop.findByIdAndUpdate(shopId, {
      rating: shopAvg.toFixed(1),
      reviewCount: shopReviews.length,
    });

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review,
      productRating: ratingDoc.averageRating,
      productReviewCount: ratingDoc.totalRatings,
    });
  } catch (error) {
    console.log("Add Review Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add review",
    });
  }
};

export const editReview = async (req, res) => {
  try {
    const { reviewId, rating, reviewText, keepImages } = req.body;
    const userId = req.user.id;

    // 1️⃣ Find review
    const review = await RatingandReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You cannot edit this review",
      });
    }

    const oldRating = Number(review.rating);
    const newRating = rating ? Number(rating) : oldRating;

    // 2️⃣ Normalize keepImages
    let finalImages = [];
    if (keepImages) {
      finalImages = JSON.parse(keepImages); // frontend sends JSON string
    }

    // 3️⃣ Normalize new uploaded files
    let files = req.files?.images;
    if (!files) files = [];
    else if (!Array.isArray(files)) files = [files];

    // 4️⃣ Upload new images & merge
    for (const file of files) {
      const upload = await uploadImageToCloudinary(
        file,
        process.env.FOLDER_NAME
      );
      finalImages.push(upload.secure_url);
    }

    // 5️⃣ Update review
    review.rating = newRating;
    review.reviewText = reviewText || review.reviewText;
    review.images = finalImages;
    await review.save();

    // 6️⃣ Update rating summary
    const ratingDoc = await OverAllRatingAndReview.findOne({
      product: review.product,
    });

    if (!ratingDoc) {
      return res.status(400).json({
        success: false,
        message: "Rating summary not found",
      });
    }

    if (oldRating !== newRating) {
      ratingDoc.starCounts[oldRating] -= 1;
      ratingDoc.starCounts[newRating] += 1;
    }

    const totalStars =
      ratingDoc.starCounts[1] * 1 +
      ratingDoc.starCounts[2] * 2 +
      ratingDoc.starCounts[3] * 3 +
      ratingDoc.starCounts[4] * 4 +
      ratingDoc.starCounts[5] * 5;

    const newAverage = Number((totalStars / ratingDoc.totalRatings).toFixed(1));

    ratingDoc.averageRating = newAverage;
    await ratingDoc.save();

    // 7️⃣ Sync Product
    await Product.findByIdAndUpdate(review.product, {
      rating: newAverage,
      reviewsCount: ratingDoc.totalRatings,
    });

    // 8️⃣ Sync Shop
    const shopReviews = await RatingandReview.find({ shop: review.shop });
    const shopAvg =
      shopReviews.reduce((sum, r) => sum + r.rating, 0) / shopReviews.length;

    await Shop.findByIdAndUpdate(review.shop, {
      rating: shopAvg.toFixed(1),
      reviewCount: shopReviews.length,
    });

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review,
      productRating: newAverage,
      productReviewCount: ratingDoc.totalRatings,
    });
  } catch (error) {
    console.log("Edit Review Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update review",
    });
  }
};

export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.body;

    const reviews = await RatingandReview.find({ product: productId })
      .populate("user", "name image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    console.log("Get Reviews Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
};

export const getProductRatingSummary = async (req, res) => {
  try {
    const { productId } = req.body;

    const rating = await OverAllRatingAndReview.findOne({ product: productId });

    if (!rating) {
      return res.status(200).json({
        success: true,
        data: {
          averageRating: 0,
          totalRatings: 0,
          starCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        },
      });
    }

    res.status(200).json({
      success: true,
      data: rating,
    });
  } catch (error) {
    console.log("Rating Summary Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch rating summary",
    });
  }
};

export const hasReviewed = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const review = await RatingandReview.findOne({
      user: userId,
      product: productId,
    });

    if (review) {
      return res.status(200).json({
        success: true,
        hasReviewed: true,
        review,
      });
    }

    return res.status(200).json({
      success: true,
      hasReviewed: false,
    });
  } catch (error) {
    console.error("hasReviewed error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


