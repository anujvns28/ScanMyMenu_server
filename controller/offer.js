const Offer = require("../models/offers");
const Shop = require("../models/shop");
const { uploadImageToCloudinary } = require("../utility/ImageUploader");

/* =====================================================
   1️⃣ CREATE OFFER
   ===================================================== */

exports.createOffer = async (req, res) => {
  try {
    const {
      title,
      description,
      offerPrice,
      startDate,
      endDate,
      shopId,
    } = req.body;

    const image = req.files?.image;

    /* ---------- PARSE ITEMS ---------- */
    let items = [];

    try {
      items = JSON.parse(req.body.items);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid items format",
      });
    }

    /* ---------- BASIC VALIDATION ---------- */
    if (!title || !shopId || !offerPrice) {
      return res.status(400).json({
        success: false,
        message: "Title, ShopId and OfferPrice are required",
      });
    }

    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    /* ---------- ITEMS VALIDATION ---------- */
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product is required",
      });
    }

    for (const item of items) {
      if (!item.product) {
        return res.status(400).json({
          success: false,
          message: "Each item must contain product id",
        });
      }
    }

    /* ---------- IMAGE UPLOAD ---------- */
    const upload = await uploadImageToCloudinary(image);

    /* ---------- CREATE OFFER ---------- */
    const offer = await Offer.create({
      shop: shopId,
      title,
      description,
      image: upload.secure_url,
      offerPrice,
      items,
      startDate,
      endDate,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Offer created successfully",
      offer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




/* =====================================================
   2️⃣ FETCH ALL OFFERS (SHOPKEEPER PANEL)
   ===================================================== */

exports.getAllOffers = async (req, res) => {
  try {
    const userId = req.user.id;

    const shop = await Shop.findOne({ owner: userId });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found for this user",
      });
    }

    const offers = await Offer.find({ shop: shop._id })
      .populate({
        path: "items.product",
        select: "name price image", // jo chahiye wahi bhejo
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      offers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};





/* =====================================================
   3️⃣ FETCH ACTIVE OFFERS (FOR YOU PAGE)
   ===================================================== */

exports.getActiveOffers = async (req, res) => {
  try {
    const shopId = req.params.shopId || req.user.shopId;
    const now = new Date();

    const offers = await Offer.find({
      shop: shopId,
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).sort({ isFeatured: -1, createdAt: -1 });

    res.json({
      success: true,
      offers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




/* =====================================================
   4️⃣ EDIT OFFER (FIELD BY FIELD UPDATE)
   ===================================================== */

exports.updateOffer = async (req, res) => {
  try {
    const { offerId } = req.body;

    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    /* ---------------- ALLOWED FIELDS ---------------- */
    const {
      title,
      description,
      offerPrice,
      startDate,
      endDate,
      isActive,
    } = req.body;

    console.log(req.body)

    /* ---------------- UPDATE TEXT FIELDS ---------------- */
    if (title !== undefined) offer.title = title;
    if (description !== undefined) offer.description = description;
    if (offerPrice !== undefined) offer.offerPrice = offerPrice;
    if (startDate !== undefined) offer.startDate = startDate;
    if (endDate !== undefined) offer.endDate = endDate;
    if (isActive !== undefined) offer.isActive = isActive;

    /* ---------------- UPDATE ITEMS ---------------- */
    if (req.body.items !== undefined) {
      let items;

      try {
        items = JSON.parse(req.body.items);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid items format",
        });
      }

      if (!Array.isArray(items)) {
        return res.status(400).json({
          success: false,
          message: "Items must be an array",
        });
      }

      offer.items = items;
    }

    /* ---------------- UPDATE IMAGE ---------------- */
    if (req.files && req.files.image) {
      const image = req.files.image;

      const upload = await uploadImageToCloudinary(image);
      offer.image = upload.secure_url;
    }

    await offer.save();

    res.status(200).json({
      success: true,
      message: "Offer updated successfully",
      offer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};





/* =====================================================
   5️⃣ TOGGLE OFFER (ON / OFF)
   ===================================================== */

exports.toggleOfferStatus = async (req, res) => {
  try {
    const { offerId } = req.params;

    const offer = await Offer.findById(offerId);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    offer.isActive = !offer.isActive;
    await offer.save();

    res.json({
      success: true,
      message: `Offer ${offer.isActive ? "activated" : "deactivated"}`,
      isActive: offer.isActive,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
