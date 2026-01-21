const mongoose = require("mongoose");
const Product = require("../models/Product");
const Shop = require("../models/shop");
const ShopCategory = require("../models/shopCategory");
const Tag = require("../models/tags");
const { uploadImageToCloudinary } = require("../utility/ImageUploader");

// ================================
// Create Product
// ================================
exports.createProduct = async (req, res) => {
  try {
    const ownerId = req.user._id;

    const { name, description, price, categoryId } = req.body;

    // Image
    const image = req.files?.image;

    // --------  Validate --------
    if (!name || !price || !categoryId || !image) {
      return res.status(400).json({
        success: false,
        message: "Name, price, category and image are required",
      });
    }

    // --------  Find shop of owner --------
    const shop = await Shop.findOne({ owner: ownerId });
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found for this owner",
      });
    }

    // --------  Check category  --------
    const shopCategory = await ShopCategory.findOne({
      _id: categoryId,
      shop: shop._id,
    });

    if (!shopCategory) {
      return res.status(400).json({
        success: false,
        message: "Invalid category for this shop",
      });
    }

    // --------  Upload image --------
    const upload = await uploadImageToCloudinary(
      image,
      process.env.FOLDER_NAME,
    );

    // --------  Create product --------
    const product = await Product.create({
      name,
      description,
      price,
      image: upload.secure_url,
      shop: shop._id,
      category: shopCategory._id,
    });

    // -------- Add product to category --------
    await ShopCategory.findByIdAndUpdate(categoryId, {
      $push: { products: product._id },
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("Create product error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};

// ======================================
// Get products of a category
// ======================================
exports.getProductsByCategory = async (req, res) => {
  try {
    const { shopCategoryId } = req.body;
    console.log(req.body);
    if (!shopCategoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
    }

    // Find category
    const category = await ShopCategory.findById(shopCategoryId)
      .populate({
        path: "products",
        populate: {
          path: "tags",
        },
      })
      .populate("tags");

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Get products by category error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

exports.updateItemField = async (req, res) => {
  try {
    let { itemId, field, value } = req.body;

    if (!itemId || !field) {
      return res.status(400).json({
        success: false,
        message: "Item ID and field are required",
      });
    }

    const allowedFields = [
      "name",
      "price",
      "discountPrice",
      "description",
      "isAvailable",
      "isTodaySpecial",
      "preparationTime",
      "image",
      "tags",
      "portion",
      "ingredients",
      "spiceLevel",
      "type",
    ];

    if (!allowedFields.includes(field)) {
      return res.status(400).json({
        success: false,
        message: "Invalid field",
      });
    }

    if (field == "tags" || field == "ingredients") {
      value = req.body["value[]"];
    }

    console.log(req.body, "this is value");

    if (field === "image") {
      if (!req.files) {
        return res.status(400).json({
          success: false,
          message: "Image file is required",
        });
      }

      const upload = await uploadImageToCloudinary(
        req.files.value,
        process.env.FOLDER_NAME,
      );

      value = upload.secure_url;
    }

    const updatedItem = await Product.findByIdAndUpdate(
      itemId,
      { [field]: value },
      { new: true },
    ).populate("tags");

    res.status(200).json({
      success: true,
      data: updatedItem,
    });
  } catch (error) {
    console.error("Update item error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update item",
    });
  }
};

exports.getTopRatedProducts = async (req, res) => {
  try {
    const { shopId } = req.query;

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: "shopId is required",
      });
    }

    // Fetch all active products with score
    const products = await Product.aggregate([
      {
        $match: {
          shop: new mongoose.Types.ObjectId(shopId),
          isAvailable: true,
        },
      },
      {
        $addFields: {
          score: {
            $add: [
              { $multiply: ["$rating", 3] },
              { $ln: { $add: ["$reviewsCount", 1] } },
            ],
          },
        },
      },
      { $sort: { score: -1 } },
      {
        $project: {
          name: 1,
          price: 1,
          image: 1,
          type: 1,
          rating: 1,
          reviewsCount: 1,
          score: 1,
        },
      },
    ]);

    //  Overall ranking (ALL)
    products.forEach((p, i) => {
      p.overallRank = i + 1;
    });

    //  Type-wise ranking
    const veg = products.filter((p) => p.type === "veg");
    const nonVeg = products.filter((p) => p.type === "non-veg");

    veg.forEach((p, i) => (p.vegRank = i + 1));
    nonVeg.forEach((p, i) => (p.nonVegRank = i + 1));

    //  Normalize response
    const finalProducts = products.map((p) => ({
      ...p,
      vegRank: p.type === "veg" ? p.vegRank : null,
      nonVegRank: p.type === "non-veg" ? p.nonVegRank : null,
    }));

    return res.status(200).json({
      success: true,
      count: finalProducts.length,
      data: finalProducts,
    });
  } catch (error) {
    console.error("Top Rated Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch top rated products",
    });
  }
};

exports.getProductDetails = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "productId is required",
      });
    }

    const product = await Product.findById(productId)
      .populate("tags", "name")
      .populate("category", "name");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        _id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice,
        image: product.image,
        type: product.type,
        rating: product.rating,
        reviewsCount: product.reviewsCount,
        ingredients: product.ingredients,
        spiceLevel: product.spiceLevel,
        preparationTime: product.preparationTime,
        tags: product.tags,
        isTodaySpecial: product.isTodaySpecial,
      },
    });
  } catch (error) {
    console.error("Product Details Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch product details",
    });
  }
};

exports.getForYouData = async (req, res) => {
  try {
    const { shopId } = req.params;

    console.log(shopId);

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: "Shop ID is required",
      });
    }

    /* ------------------ SCORE BASED RANKING ------------------ */
    const scoredProducts = await Product.aggregate([
      {
        $match: {
          shop: new mongoose.Types.ObjectId(shopId),
          isAvailable: true,
        },
      },

      /* ------------------ SCORE CALCULATION ------------------ */
      {
        $addFields: {
          score: {
            $add: [
              { $multiply: ["$rating", 2] },
              { $multiply: ["$orderCount", 0.3] },
              { $multiply: ["$reviewsCount", 0.5] },
            ],
          },
        },
      },

      /* ------------------ TAG POPULATION ------------------ */
      {
        $lookup: {
          from: "tags", // collection name
          localField: "tags", // Product.tags
          foreignField: "_id", // Tag._id
          as: "tags",
        },
      },

      /* ------------------ SORT ------------------ */
      { $sort: { score: -1 } },

      /* ------------------ PROJECT ------------------ */
      {
        $project: {
          name: 1,
          image: 1,
          rating: 1,
          reviewsCount: 1,
          orderCount: 1,
          price: 1,
          discountPrice: 1,
          tags: {
            _id: 1,
            name: 1,
            color: 1,
          },
          isTodaySpecial: 1,
          score: 1,
        },
      },
    ]);

    /* ------------------ SPLIT LOGIC ------------------ */
    const mustTry = scoredProducts[0] || null;

    // Next 4 highest scored (excluding must try)
    const topRated = scoredProducts.slice(1, 5);

    // Owner controlled
    const todaysSpecial = scoredProducts.filter(
      (p) => p.isTodaySpecial === true,
    );

    return res.status(200).json({
      success: true,
      message: "For You data fetched successfully",
      data: {
        mustTry,
        topRated,
        todaysSpecial,
      },
    });
  } catch (error) {
    console.error("For You Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch For You data",
    });
  }
};

exports.getShopProductsForOffer = async (req, res) => {
  try {
    const userId = req.user.id;

    const shop = await Shop.findOne({ owner: userId });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found for this user",
      });
    }

    const products = await Product.find({ shop: shop._id })
      .select("_id name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error fetching shop products:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};
