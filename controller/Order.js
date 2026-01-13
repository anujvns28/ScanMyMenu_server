const Order = require("../models/order");
const Product = require("../models/Product");
const Razorpay = require("razorpay");
const crypot = require("crypto")

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      shopId,
      items,
      orderType,
      tableNo,
      phone,
      instructions,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No items in cart",
      });
    }

    // total from DB 
    let subtotal = 0;
    const finalItems = [];

    for (let item of items) {
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
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // Create expected signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");

    // Verify signature
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // Find order
    const order = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    //  Mark order as PAID + PLACED
    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;

    await order.save();
    

    return res.status(200).json({
      success: true,
      message: "Payment verified, order placed",
      orderId: order._id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
};
