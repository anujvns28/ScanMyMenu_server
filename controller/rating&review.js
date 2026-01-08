import OverAllRatingAndReview from "../models/overallRating&Review.js"
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

    // Check if user already reviewed
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

    // 1️⃣ Upload review images
    let uploadedImages = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const upload = await uploadImageToCloudinary(
          file,
          process.env.FOLDER_NAME
        );
        uploadedImages.push(upload.secure_url);
      }
    }

    // 2️⃣ Create Review
    const review = await RatingandReview.create({
      user: userId,
      product: productId,
      shop: shopId,
      rating,
      reviewText,
      images: uploadedImages,
      isVerifiedPurchase: true,
    });

    // 3️⃣ Update Rating Summary
    let ratingDoc = await OverAllRatingAndReview.findOne({ product: productId });

    if (!ratingDoc) {
      ratingDoc = await OverAllRatingAndReview.create({
        product: productId,
        averageRating: rating,
        totalRatings: 1,
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

      ratingDoc.averageRating = (
        totalStars / ratingDoc.totalRatings
      ).toFixed(1);

      await ratingDoc.save();
    }

    const shop = await Shop.findById(shopId);
    const newCount = shop.reviewCount + 1;
    const newAvg = (shop.rating * shop.reviewCount + rating) / newCount;

    shop.rating = newAvg.toFixed(1);
    shop.reviewCount = newCount;
    await shop.save();

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: review,
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
    const { reviewId, rating, reviewText } = req.body;
    const userId = req.user.id;

   
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

    const oldRating = review.rating;

    //  Upload new images if any
    let uploadedImages = review.images;

    if (req.files && req.files.length > 0) {
      uploadedImages = [];

      for (const file of req.files) {
        const upload = await uploadImageToCloudinary(
          file,
          process.env.FOLDER_NAME
        );
        uploadedImages.push(upload.secure_url);
      }
    }

    //  Update Review
    review.rating = rating || review.rating;
    review.reviewText = reviewText || review.reviewText;
    review.images = uploadedImages;

    await review.save();

    //  Update Rating Summary
    const ratingDoc = await OverAllRatingAndReview.findOne({ product: review.product });

    if (ratingDoc) {
      // Remove old star
      ratingDoc.starCounts[oldRating] -= 1;

      // Add new star
      ratingDoc.starCounts[review.rating] += 1;

      // Recalculate average
      const totalStars =
        ratingDoc.starCounts[1] * 1 +
        ratingDoc.starCounts[2] * 2 +
        ratingDoc.starCounts[3] * 3 +
        ratingDoc.starCounts[4] * 4 +
        ratingDoc.starCounts[5] * 5;

      ratingDoc.averageRating = (
        totalStars / ratingDoc.totalRatings
      ).toFixed(1);

      await ratingDoc.save();
    }

    const shop = await Shop.findById(shopId);
    const newCount = shop.reviewCount + 1;
    const newAvg = (shop.rating * shop.reviewCount + rating) / newCount;

    shop.rating = newAvg.toFixed(1);
    shop.reviewCount = newCount;
    await shop.save();

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review,
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


