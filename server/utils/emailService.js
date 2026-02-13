// server/utils/emailService.js
const nodemailer = require('nodemailer');

// Create transporter
const getTransporter = () => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

// Base email wrapper
const emailWrapper = (title, content) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { margin: 0; padding: 0; background: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
  .header { background: linear-gradient(135deg, #7c3aed, #4f46e5); padding: 32px 24px; text-align: center; }
  .header h1 { color: #fff; font-size: 24px; margin: 0 0 4px; }
  .header p { color: rgba(255,255,255,0.8); margin: 0; font-size: 13px; }
  .body { padding: 32px 24px; }
  .footer { background: #f9fafb; padding: 24px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
  .btn { display: inline-block; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff !important; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; }
  .card { background: #f9fafb; border-radius: 12px; padding: 20px; margin: 16px 0; }
  .table { width: 100%; border-collapse: collapse; }
  .table th { text-align: left; font-size: 12px; color: #6b7280; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
  .table td { padding: 8px 0; font-size: 14px; border-bottom: 1px solid #f3f4f6; }
  .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
  .badge-green { background: #dcfce7; color: #16a34a; }
  .badge-yellow { background: #fef3c7; color: #d97706; }
  .badge-blue { background: #dbeafe; color: #2563eb; }
  .badge-purple { background: #ede9fe; color: #7c3aed; }
  h2 { color: #111827; font-size: 20px; margin: 0 0 8px; }
  p { color: #4b5563; font-size: 14px; line-height: 1.6; }
  .total-row { font-weight: 700; font-size: 16px; color: #111827; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>AURA Maniac</h1>
    <p>Unleash Your Style.</p>
  </div>
  <div class="body">
    ${content}
  </div>
  <div class="footer">
    <p>&copy; ${new Date().getFullYear()} AURA Maniac. All rights reserved.</p>
    <p style="margin:8px 0 0;">If you have questions, reply to this email or contact <a href="mailto:support@vibepick.com" style="color:#7c3aed;">support@vibepick.com</a></p>
  </div>
</div>
</body>
</html>
`;

// Send email utility
const sendMail = async (to, subject, htmlContent) => {
    const transporter = getTransporter();
    if (!transporter) {
        console.log(`📧 Email (SMTP not configured):`);
        console.log(`  To: ${to}`);
        console.log(`  Subject: ${subject}`);
        return;
    }
    try {
        await transporter.sendMail({
            from: `${process.env.FROM_NAME || 'VibePick'} <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
            to,
            subject,
            html: htmlContent
        });
        console.log(`📧 Email sent to ${to}: ${subject}`);
    } catch (err) {
        console.error(`❌ Email failed to ${to}:`, err.message);
    }
};

// Send with attachment
const sendMailWithAttachment = async (to, subject, htmlContent, attachments) => {
    const transporter = getTransporter();
    if (!transporter) {
        console.log(`📧 Email+Attachment (SMTP not configured): ${subject} → ${to}`);
        return;
    }
    try {
        await transporter.sendMail({
            from: `${process.env.FROM_NAME || 'VibePick'} <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
            to,
            subject,
            html: htmlContent,
            attachments
        });
        console.log(`📧 Email+Attachment sent to ${to}: ${subject}`);
    } catch (err) {
        console.error(`❌ Email failed to ${to}:`, err.message);
    }
};

// ─── 1. WELCOME EMAIL ───
const sendWelcomeEmail = async (user) => {
    const html = emailWrapper('Welcome!', `
        <h2>Welcome to VibePick, ${user.name}! 🎉</h2>
        <p>We're thrilled to have you on board. Get ready to discover fashion that matches your unique vibe.</p>
        <div class="card">
            <p style="margin:0;"><strong>Your Account</strong></p>
            <p style="margin:4px 0 0;">${user.email}</p>
        </div>
        <p>Start exploring our curated collection:</p>
        <p style="text-align:center; margin:24px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/products" class="btn">Browse Products</a>
        </p>
    `);
    await sendMail(user.email, 'Welcome to VibePick! 🎉', html);
};

// ─── 2. ORDER CONFIRMATION ───
const sendOrderConfirmation = async (order, user) => {
    const itemsHtml = order.items.map(item => `
        <tr>
            <td>${item.title}</td>
            <td style="text-align:center;">${item.size || '-'}</td>
            <td style="text-align:center;">${item.quantity}</td>
            <td style="text-align:right;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
        </tr>
    `).join('');

    const addr = order.shippingAddress || {};
    const html = emailWrapper('Order Confirmed', `
        <h2>Order Confirmed! 📦</h2>
        <p>Hi ${user.name}, your order has been placed successfully.</p>
        <div class="card">
            <table style="width:100%;">
                <tr><td><strong>Order #</strong></td><td style="text-align:right;">${order.orderNumber}</td></tr>
                <tr><td><strong>Date</strong></td><td style="text-align:right;">${new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
                <tr><td><strong>Payment</strong></td><td style="text-align:right;"><span class="badge ${order.paymentInfo?.method === 'cod' ? 'badge-yellow' : 'badge-purple'}">${order.paymentInfo?.method === 'cod' ? 'Cash on Delivery' : 'Online'}</span></td></tr>
            </table>
        </div>
        <table class="table">
            <thead><tr><th>Item</th><th style="text-align:center;">Size</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Amount</th></tr></thead>
            <tbody>${itemsHtml}</tbody>
        </table>
        <div class="card" style="margin-top:16px;">
            <table style="width:100%; font-size:14px;">
                <tr><td>Subtotal</td><td style="text-align:right;">₹${order.itemsTotal?.toLocaleString('en-IN')}</td></tr>
                ${order.discount > 0 ? `<tr style="color:#16a34a;"><td>Discount</td><td style="text-align:right;">-₹${order.discount}</td></tr>` : ''}
                <tr><td>Shipping</td><td style="text-align:right;">${order.shippingCharge === 0 ? 'FREE' : '₹' + order.shippingCharge}</td></tr>
                <tr class="total-row"><td style="padding-top:8px; border-top:2px solid #e5e7eb;">Total</td><td style="text-align:right; padding-top:8px; border-top:2px solid #e5e7eb;">₹${order.totalAmount?.toLocaleString('en-IN')}</td></tr>
            </table>
        </div>
        <div class="card">
            <p style="margin:0;"><strong>Shipping To:</strong></p>
            <p style="margin:4px 0 0;">${addr.fullName} · ${addr.phone}<br>${addr.addressLine1}, ${addr.city}, ${addr.state} — ${addr.pincode}</p>
        </div>
        <p style="text-align:center; margin:24px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/orders" class="btn">View My Orders</a>
        </p>
    `);
    await sendMail(user.email, `Order Confirmed #${order.orderNumber} ✓`, html);
};

// ─── 3. PAYMENT SUCCESS ───
const sendPaymentSuccess = async (order, user) => {
    const html = emailWrapper('Payment Successful', `
        <h2>Payment Successful! ✅</h2>
        <p>Hi ${user.name}, we've received your payment for Order #${order.orderNumber}.</p>
        <div class="card">
            <table style="width:100%;">
                <tr><td><strong>Order #</strong></td><td style="text-align:right;">${order.orderNumber}</td></tr>
                <tr><td><strong>Amount Paid</strong></td><td style="text-align:right; font-weight:700; color:#16a34a;">₹${order.totalAmount?.toLocaleString('en-IN')}</td></tr>
                <tr><td><strong>Payment ID</strong></td><td style="text-align:right; font-family:monospace; font-size:12px;">${order.paymentInfo?.razorpayPaymentId || 'N/A'}</td></tr>
                <tr><td><strong>Status</strong></td><td style="text-align:right;"><span class="badge badge-green">Paid</span></td></tr>
            </table>
        </div>
        <p>We'll start processing your order right away. You'll get a shipping update soon!</p>
        <p style="text-align:center; margin:24px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/orders" class="btn">Track Order</a>
        </p>
    `);
    await sendMail(user.email, `Payment Received — Order #${order.orderNumber} ✅`, html);
};

// ─── 4. PAYMENT FAILED ───
const sendPaymentFailed = async (order, user) => {
    const html = emailWrapper('Payment Failed', `
        <h2>Payment Failed ❌</h2>
        <p>Hi ${user.name}, unfortunately your payment for Order #${order.orderNumber} could not be processed.</p>
        <div class="card">
            <table style="width:100%;">
                <tr><td><strong>Order #</strong></td><td style="text-align:right;">${order.orderNumber}</td></tr>
                <tr><td><strong>Amount</strong></td><td style="text-align:right;">₹${order.totalAmount?.toLocaleString('en-IN')}</td></tr>
                <tr><td><strong>Status</strong></td><td style="text-align:right;"><span class="badge" style="background:#fee2e2;color:#dc2626;">Failed</span></td></tr>
            </table>
        </div>
        <p>Please try again or use a different payment method.</p>
        <p style="text-align:center; margin:24px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/orders" class="btn">Retry Payment</a>
        </p>
    `);
    await sendMail(user.email, `Payment Failed — Order #${order.orderNumber}`, html);
};

// ─── 5. ORDER SHIPPED ───
const sendOrderShipped = async (order, user) => {
    const tracking = order.trackingInfo || {};
    const html = emailWrapper('Order Shipped', `
        <h2>Your Order is On Its Way! 🚚</h2>
        <p>Hi ${user.name}, great news — your order has been shipped!</p>
        <div class="card">
            <table style="width:100%;">
                <tr><td><strong>Order #</strong></td><td style="text-align:right;">${order.orderNumber}</td></tr>
                ${tracking.carrier ? `<tr><td><strong>Carrier</strong></td><td style="text-align:right;">${tracking.carrier}</td></tr>` : ''}
                ${tracking.trackingNumber ? `<tr><td><strong>Tracking #</strong></td><td style="text-align:right; font-family:monospace;">${tracking.trackingNumber}</td></tr>` : ''}
            </table>
        </div>
        ${tracking.trackingUrl ? `<p style="text-align:center; margin:24px 0;"><a href="${tracking.trackingUrl}" class="btn">Track Shipment</a></p>` : ''}
        <p>Estimated delivery: 3-7 business days. We'll notify you when it arrives!</p>
    `);
    await sendMail(user.email, `Order Shipped! #${order.orderNumber} 🚚`, html);
};

// ─── 6. PASSWORD RESET ───
const sendPasswordReset = async (user, resetUrl) => {
    const html = emailWrapper('Password Reset', `
        <h2>Reset Your Password 🔐</h2>
        <p>Hi ${user.name}, we received a request to reset your password.</p>
        <p style="text-align:center; margin:24px 0;">
            <a href="${resetUrl}" class="btn">Reset Password</a>
        </p>
        <p style="font-size:12px; color:#9ca3af;">This link expires in 10 minutes. If you didn't request this, please ignore this email.</p>
        <div class="card" style="font-size:12px;">
            <p style="margin:0; word-break:break-all;"><strong>Direct link:</strong> <a href="${resetUrl}" style="color:#7c3aed;">${resetUrl}</a></p>
        </div>
    `);
    await sendMail(user.email, 'Password Reset Request — VibePick', html);
};

// ─── 7. ADMIN NEW ORDER NOTIFICATION ───
const sendAdminNewOrder = async (order) => {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || process.env.FROM_EMAIL;
    if (!adminEmail) {
        console.log('📧 Admin email not configured, skipping admin notification');
        return;
    }
    const html = emailWrapper('New Order!', `
        <h2>New Order Received! 🎉</h2>
        <div class="card">
            <table style="width:100%;">
                <tr><td><strong>Order #</strong></td><td style="text-align:right;">${order.orderNumber}</td></tr>
                <tr><td><strong>Customer</strong></td><td style="text-align:right;">${order.shippingAddress?.fullName || 'N/A'}</td></tr>
                <tr><td><strong>Items</strong></td><td style="text-align:right;">${order.items?.length || 0}</td></tr>
                <tr><td><strong>Amount</strong></td><td style="text-align:right; font-weight:700; color:#16a34a;">₹${order.totalAmount?.toLocaleString('en-IN')}</td></tr>
                <tr><td><strong>Payment</strong></td><td style="text-align:right;">${order.paymentInfo?.method === 'cod' ? 'COD' : 'Online'}</td></tr>
            </table>
        </div>
        <p style="text-align:center; margin:24px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/admin/orders" class="btn">View in Admin</a>
        </p>
    `);
    await sendMail(adminEmail, `🛒 New Order #${order.orderNumber} — ₹${order.totalAmount?.toLocaleString('en-IN')}`, html);
};

// Legacy API-compatible sendEmail
const sendEmail = async (options) => {
    await sendMail(options.email, options.subject, options.message || options.html);
};

module.exports = {
    sendEmail,
    sendWelcomeEmail,
    sendOrderConfirmation,
    sendPaymentSuccess,
    sendPaymentFailed,
    sendOrderShipped,
    sendPasswordReset,
    sendAdminNewOrder,
    sendMailWithAttachment
};
