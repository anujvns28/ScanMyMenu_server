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

    const {
      name,
      description,
      price,
      categoryId,
    } = req.body;

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
      process.env.FOLDER_NAME
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
    ];

    if (!allowedFields.includes(field)) {
      return res.status(400).json({
        success: false,
        message: "Invalid field",
      });
    }

    if (field == "tags") {
      value = req.body["value[]"];
    }

    if (field === "image") {
      if (!req.files) {
        return res.status(400).json({
          success: false,
          message: "Image file is required",
        });
      }

      const upload = await uploadImageToCloudinary(
        req.files.value,
        process.env.FOLDER_NAME
      );

      value = upload.secure_url;
    }

    const updatedItem = await Product.findByIdAndUpdate(
      itemId,
      { [field]: value },
      { new: true }
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

