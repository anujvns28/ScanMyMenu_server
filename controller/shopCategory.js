const ShopCategory = require("../models/shopCategory");
const Category = require("../models/category");
const Tag = require("../models/tags")

exports.pickCategoriesForShop = async (req, res) => {
  try { 
    const { categories,shopId } = req.body; 

    if (!categories || categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one category"
      });
    }

    const created = [];

    for (let catId of categories) {
      const exists = await ShopCategory.findOne({
        shop:shopId,
        category:catId
      });

      if (!exists) {
        const adminCat = await Category.findById(catId);
        if (!adminCat || !adminCat.isActive) continue;

        const newCat = await ShopCategory.create({
          shop:shopId,
          category: adminCat,
          displayName: adminCat.name
        });

        created.push(newCat);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Categories added to shop",
      data: created
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to pick categories"
    });
  }
};


exports.getShopCategories = async (req, res) => {
  try {
    const shopId = req.body.shopId;
    const categories = await ShopCategory.find({
      shop: shopId,
      isEnabled: true,
    })
      .populate("category", "name image description dietType")
      .populate("tags", "name color")
      .sort({ order: 1 });

    return res.status(200).json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Failed to fetch shop categories"
    });
  }
};


exports.removeShopCategory = async (req, res) => {
  try {
    const shopId = req.body.shopId;
    const { shopCategoryId } = req.body;

    await ShopCategory.findOneAndDelete({
      _id: shopCategoryId,
      shop:shopId
    });

    return res.status(200).json({
      success: true,
      message: "Category removed from shop"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to remove category"
    });
  }
};


exports.toggleCategoryStatus = async (req, res) => {
  try {
    const shopId = req.body.shopId;
    const { shopCategoryId, isEnabled } = req.body;

    const updated = await ShopCategory.findOneAndUpdate(
      { _id: shopCategoryId,shop: shopId },
      { isEnabled },
      { new: true }
    ).populate("category")
    .populate("tags")
    
    return res.status(200).json({
      success: true,
      data: updated
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update category status"
    });
  }
};



exports.getSingleShopCategory = async (req, res) => {
  try {
    const { shopCategoryId } = req.params;

    const category = await ShopCategory.findById(shopCategoryId)
      .populate("category", "name image description ")
      .populate("tags", "name color");

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    // Count products inside this category
    const productsCount = await Product.countDocuments({
      shopCategoryId: shopCategoryId
    });

    return res.status(200).json({
      success: true,
      data: {
        ...category._doc,
        productsCount
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to load category"
    });
  }
};

exports.pickTags = async(req,res)=>{
  try{
    const {tags,shopCategoryId} = req.body;
    console.log(tags)

    if(!tags || tags.length ==0 ){
      return res.status(400).json({
        success:false,
        message:"Tags are required"
      })
    }

    if(!shopCategoryId){
      return res.status(400).json({
        success:false,
        message:"shop category id required"
      })
    }

    const category = await ShopCategory.findById(shopCategoryId)
    .populate("category")
    .populate("tags")

    if(!category){
      return res.status(400).json({
        success:false,
        message:"not vallied shop category id"
      })
    }

    const tagsIds = category.tags.map((tag)=>tag._id);
    const newTags = [];

    for(let tagId of tags){
      if(!tagsIds.includes(tagId)){
        const tagDetails = await Tag.findById(tagId);
        newTags.push(tagDetails);
      }
    }

    category.tags = [...category.tags,...newTags];
    await category.save();

    return res.status(200).json({
      success:true,
      message:"Tags picked success fully",
      data : category
    })
    
    
  }catch(err){
    console.log(err)
    return res.status(500).json({
      success:false,
      message:"Error occured in pick Tags"
    })
  }
}

exports.removeTag = async(req,res)=>{
  try{
    const {shopCatId,tagId} = req.body;

    if(!shopCatId || !tagId){
      return res.status(400).json({
        success:false,
        message:"All filds are required"
      })
    }

    const shopCat = await ShopCategory.findById(shopCatId)
    .populate("category")
    .populate("tags");

    if(!shopCat){
      return res.status(400).json({
        success:false,
        message:"ShopCat Id is not vallied"
      })
    }


    const tag = await Tag.findById(tagId);
    if(!tag){
      return res.status(400).json({
        success:false,
        message:"Tag Id is not vallied"
      })
    }
    
    shopCat.tags = shopCat.tags.filter((temp)=> String(temp._id) != String(tag._id));
    await shopCat.save();

    return res.status(200).json({
      success:true,
      message:"Tag remove successfully",
      data:shopCat
    })

  }catch(err){
    console.log(err )
    return res.status(500).json({
      success:false,
      message:"error occured in remove tag"
    })
  }
}





