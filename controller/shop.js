const Shop = require("../models/shop");
const { uploadImageToCloudinary } = require("../utility/ImageUploader");

exports.updateShopProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const image = req.files?.image;
    const userId = req.userId;

    let shop = await Shop.findOne({ owner: userId });
    if (!shop) {
      shop = await Shop.create({ owner: userId });
    }

    shop.shopProfile = shop.shopProfile || {};

    if (name) {
      shop.shopProfile.name = name;
      shop.shopProfile.slug = name.toLowerCase().replace(/\s+/g, "-");
    }

    if (image) {
      const url = await uploadImageToCloudinary(image, process.env.FOLDER_NAME);
      shop.shopProfile.logo = url.secure_url;
    }

    shop.progress = Math.max(shop.progress, 10);
    shop.status.creationStep = Math.max(shop.status.creationStep, 1);
    

    await shop.save();

    return res.status(200).json({
      success: true,
      message: "Shop profile updated",
      data: shop,
    });
  } catch (err) {
    console.log("Shop Profile Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update shop profile",
    });
  }
};


exports.updateContactInfo = async (req, res) => {
  try {
    const { phone, email, ownerName } = req.body;
    const userId = req.userId;

    let shop = await Shop.findOne({ owner: userId });
    if (!shop) {
      shop = await Shop.create({ owner: userId });
    }

    shop.contactInfo = shop.contactInfo || {};

    if (ownerName) shop.contactInfo.ownerName = ownerName;
    if (phone) shop.contactInfo.phone = phone;
    if (email) shop.contactInfo.email = email;

    shop.progress = Math.max(shop.progress, 20);
    shop.status.creationStep = Math.max(shop.status.creationStep, 2);

    await shop.save();

    return res.status(200).json({
      success: true,
      message: "Contact info updated",
      data: shop,
    });
  } catch (err) {
    console.log("Contact Info Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update contact info",
    });
  }
};


exports.updateShopAddress = async (req, res) => {
  try {
    const { area, city, pincode } = req.body;
    const userId = req.userId;

    let shop = await Shop.findOne({ owner: userId });
    if (!shop) {
      shop = await Shop.create({ owner: userId });
    }

    shop.address = shop.address || {};

    if (area) shop.address.area = area;
    if (city) shop.address.city = city;
    if (pincode) shop.address.pincode = pincode;

    shop.progress = Math.max(shop.progress, 30);
    shop.status.creationStep = Math.max(shop.status.creationStep, 3);

    await shop.save();

    return res.status(200).json({
      success: true,
      message: "Shop address updated",
      data: shop,
    });
  } catch (err) {
    console.log("Address Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update address",
    });
  }
};


exports.updateShopTiming = async (req, res) => {
  try {
    const { openTime, closeTime } = req.body;
    const userId = req.userId;

    let shop = await Shop.findOne({ owner: userId });
    if (!shop) {
      shop = await Shop.create({ owner: userId });
    }

    shop.timing = shop.timing || {};
    shop.timing.openTime = openTime;
    shop.timing.closeTime = closeTime;

    shop.progress = Math.max(shop.progress, 10);
    shop.status.creationStep = Math.max(shop.status.creationStep, 1);

    // Check if profile is fully completed
    const isComplete =
      shop.shopProfile?.name &&
      shop.contactInfo?.ownerName &&
      shop.contactInfo?.phone &&
      shop.address?.area &&
      shop.address?.city &&
      shop.address?.pincode &&
      shop.timing?.openTime &&
      shop.timing?.closeTime;

    shop.status.isProfileComplete = Boolean(isComplete);

    if (isComplete) {
      shop.status.creationStep = 5;
    }

    await shop.save();

    return res.status(200).json({
      success: true,
      message: "Shop timing updated",
      data: shop,
    });
  } catch (err) {
    console.log("Timing Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update timing",
    });
  }
};


exports.getMyShop = async (req, res) => {
  try {
    const userId = req.userId;

    const shop = await Shop.findOne({ owner: userId });

    if (!shop) {
      return res.status(200).json({
        success: true,
        data: null,
        message: "No shop created yet",
      });
    }

    return res.status(200).json({
      success: true,
      data: shop,
    });
  } catch (err) {
    console.log("Fetch Shop Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch shop details",
    });
  }
};




