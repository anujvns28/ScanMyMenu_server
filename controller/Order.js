const Order = require("../models/order");
const Product = require("../models/Product");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const { shopId, cartItems, orderType, tableNo, phone, instructions } =
      req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No items in cart",
      });
    }

    // total from DB
    let subtotal = 0;
    const finalItems = [];

    for (let item of cartItems) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      subtotal += product.price * item.qty;

      finalItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        qty: item.qty,
        image: product.image,
      });

      await Product.findByIdAndUpdate(product._id, {
        $inc: { orderCount: item.qty },
      });
    }

    const gst = Math.round(subtotal * 0.05);
    const total = subtotal + gst;

    // Create Order
    const order = await Order.create({
      user: userId,
      shop: shopId,
      items: finalItems,
      orderType,
      tableNo,
      phone,
      instructions,
      subtotal,
      gst,
      total,
      status: "CREATED",
      paymentStatus: "PENDING",
    });

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: total * 100,
      currency: "INR",
      receipt: order._id.toString(),
    });

    // Save Razorpay Order
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    return res.status(200).json({
      success: true,
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: total,
      currency: "INR",
    });
  } catch (err) {
    console.error("Create Order Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    const order = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update order
    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;

    await order.save();

    // Sending frontend
    const orderData = {
      orderId: order._id,
      orderNumber: order.orderNumber,
      shopId: order.shop,
      items: order.items.map((item) => ({
        productId: item.product,
        name: item.name,
        qty: item.qty,
        price: item.price,
        image: item.image,
      })),
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
    };

    return res.status(200).json({
      success: true,
      message: "Payment verified, order placed",
      order: orderData,
    });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
};

exports.getKitchenOrders = async (req, res) => {
  try {
    const { shopId } = req.params;

    const orders = await Order.find({
      shop: shopId,
      status: { $in: ["PLACED", "PREPARING", "READY", "SERVED"] },
      paymentStatus: "PAID",
    })
      .sort({ createdAt: -1 }) // FIFO for kitchen
      .populate("user", "name");

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get Kitchen Orders Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch kitchen orders",
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, orderId } = req.body;

    const allowedNext = {
      PLACED: "PREPARING",
      PREPARING: "READY",
      READY: "SERVED",
    };

    const validStatuses = ["PREPARING", "READY", "SERVED"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.paymentStatus !== "PAID") {
      return res.status(400).json({
        success: false,
        message: "Order payment not completed",
      });
    }

    if (order.status === status) {
      return res.status(200).json({
        success: true,
        message: "Order already in this status",
        order,
      });
    }

    const expectedNext = allowedNext[order.status];

    if (status !== expectedNext) {
      return res.status(400).json({
        success: false,
        message: `Invalid status change. ${order.status} → ${status} not allowed`,
      });
    }

    order.status = status;
    await order.save();

    // 🔥 Future: socket emit to user & kitchen screen

    return res.status(200).json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (error) {
    console.error("Update Order Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};

exports.getMyActiveOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const order = await Order.findOne({
      user: userId,
      status: { $in: ["PLACED", "PREPARING", "READY", "SERVED"] },
      paymentStatus: "PAID",
    })
      .sort({ createdAt: -1 })
      .populate("shop", "name")
      .populate("items.product", "name image");

    if (!order) {
      return res.status(200).json({
        success: true,
        order: null,
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get My Active Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};