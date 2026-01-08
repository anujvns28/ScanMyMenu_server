const Category  = require("../models/category");
const { uploadImageToCloudinary } = require("../utility/ImageUploader");


exports.createCategory = async (req, res) => {
  try {
    const { name, description, dietType } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "Name and description are required",
      });
    }

    if (!req.files || !req.files.image) {
      return res.status(400).json({
        success: false,
        message: "Category image is required",
      });
    }

    const categoryImg = req.files.image;

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    const uploadImage = await uploadImageToCloudinary(
      categoryImg,
      process.env.FOLDER_NAME
    );

    await Category.create({
      name,
      description,
      image: uploadImage.secure_url,
      dietType: dietType,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
    });
  } catch (err) {
    console.error("Error creating category:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while creating category",
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { categoryId, name, description, dietType } = req.body;

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return res.status(409).json({
          success: false,
          message: "Category with this name already exists",
        });
      }
      category.name = name;
    }

    if (description) {
      category.description = description;
    }

    if (req.files && req.files.image) {
      const categoryImg = req.files.image;

      const uploadResult = await uploadImageToCloudinary(
        categoryImg,
        process.env.FOLDER_NAME
      );

      category.image = uploadResult.secure_url;
    }

    if (dietType) {
      category.dietType = dietType;
    }

    await category.save();

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (err) {
    console.error("Error updating category:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while updating category",
    });
  }
};


exports.toggleCategoryStatus = async (req, res) => {
  try {
    const { categoryId } = req.body;

    
    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
    }


    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    
    category.isActive = !category.isActive;

    
    await category.save();

    return res.status(200).json({
      success: true,
      message: `Category ${
        category.isActive ? "enabled" : "disabled"
      } successfully`,
    });

  } catch (err) {
    console.error("Error toggling category status:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while toggling category status",
    });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({})
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: categories,
    });

  } catch (err) {
    console.error("Error fetching categories:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching categories",
    });
  }
};

exports.getActiveCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .select("name description image")
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      data: categories,
    });

  } catch (err) {
    console.error("Error fetching active categories:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching active categories",
    });
  }
};







