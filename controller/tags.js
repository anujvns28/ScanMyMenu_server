const Tag = require("../models/tags");

// slug helper
const slugify = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
};

// ================= CREATE TAG =================
exports.createTag = async (req, res) => {
  try {
    const { name, color, type } = req.body;

    //  Validation
    if (!name || !color || !type) {
      return res.status(400).json({
        success: false,
        message: "Name, color and type are required",
      });
    }

    // 2 Validate type
    if (!["category", "product"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be either 'food' or 'shop'",
      });
    }

    //  Generate slug
    const slug = slugify(name);

    //  Check duplicate (same name or slug with same type)
    const existingTag = await Tag.findOne({
      $or: [{ name }, { slug }],
      type,
    });

    if (existingTag) {
      return res.status(409).json({
        success: false,
        message: "Tag already exists",
      });
    }

    //  Create tag
    const tag = await Tag.create({
      name,
      slug,
      color,
      type,
    });

    //  Response
    return res.status(201).json({
      success: true,
      message: "Tag created successfully",
    });
  } catch (error) {
    console.error("Create Tag Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ================= UPDATE TAG =================
exports.updateTag = async (req, res) => {
  try {
    const { tagId, name, color, type, isActive } = req.body;

    // Check tag exists
    const tag = await Tag.findById(tagId);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: "Tag not found",
      });
    }

    //  Validate type (if provided)
    if (type && !["category", "product"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be either 'food' or 'shop'",
      });
    }

    //  If name is updated → regenerate slug
    if (name && name !== tag.name) {
      const newSlug = slugify(name);

      // check duplicate (same type)
      const duplicateTag = await Tag.findOne({
        slug: newSlug,
        type: type || tag.type,
        _id: { $ne: tagId },
      });

      if (duplicateTag) {
        return res.status(409).json({
          success: false,
          message: "Tag with this name already exists",
        });
      }

      tag.name = name;
      tag.slug = newSlug;
    }

    //  Update other fields
    if (color) tag.color = color;
    if (type) tag.type = type;
    if (typeof isActive === "boolean") tag.isActive = isActive;

    //  Save
    await tag.save();

    //  Response
    return res.status(200).json({
      success: true,
      message: "Tag updated successfully",
    });
  } catch (error) {
    console.error("Update Tag Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.toggleTagStatus = async (req, res) => {
  try {
    const { tagId } = req.body;

    //  Validation
    if (!tagId) {
      return res.status(400).json({
        success: false,
        message: "Tag ID is required",
      });
    }

    //  Find tag
    const tag = await Tag.findById(tagId);

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: "Tag not found",
      });
    }

    //  Toggle status
    tag.isActive = !tag.isActive;
    await tag.save();

    //  Response
    return res.status(200).json({
      success: true,
      message: `Tag ${tag.isActive ? "activated" : "disabled"} successfully`,
    });
  } catch (error) {
    console.error("Toggle Tag Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


exports.getAllTags = async(req,res) =>{
    try{
        const tags = await Tag.find({});

        return res.status(200).json({
            success:true,
            message:"All Tags fetched successfully",
            tags:tags
        })
    }
    catch(err){
        console.log("Fetch all Tag error",err);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}


exports.getActiveTags = async(req,res) =>{
    try{
        const tags = await Tag.find({isActive:true});

        return res.status(200).json({
            success:true,
            message:"All Tags fetched successfully",
            tags:tags
        })
    }
    catch(err){
        console.log("Fetch all active Tag error",err);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
