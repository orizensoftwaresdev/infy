// server/utils/invoiceGenerator.js
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const generateInvoice = (order, res) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Pipe to response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderNumber}.pdf`);
    doc.pipe(res);

    // Also save to file
    const invoiceDir = path.join(__dirname, '../../uploads/invoices');
    if (!fs.existsSync(invoiceDir)) fs.mkdirSync(invoiceDir, { recursive: true });
    const filePath = path.join(invoiceDir, `invoice-${order.orderNumber}.pdf`);
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // ─── HEADER ───
    doc.rect(0, 0, 595, 110).fill('#d97706'); // Gold color
    doc.font('Helvetica-Bold').fontSize(28).fillColor('#fff').text('AURA Maniac', 50, 30);
    doc.font('Helvetica').fontSize(10).fillColor('rgba(255,255,255,0.8)').text('Unleash Your Style.', 50, 62);

    // Invoice title
    doc.fontSize(12).fillColor('#fff').text('TAX INVOICE', 430, 35, { align: 'right', width: 120 });
    doc.fontSize(9).text(`#INV-${order.orderNumber}`, 430, 52, { align: 'right', width: 120 });
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 430, 65, { align: 'right', width: 120 });

    // ─── COMPANY / CUSTOMER ───
    doc.fillColor('#111827');
    const yStart = 130;

    // Company (left)
    doc.font('Helvetica-Bold').fontSize(10).text('From:', 50, yStart);
    doc.font('Helvetica').fontSize(9).fillColor('#4b5563');
    doc.text('AURA Maniac Fashions Pvt. Ltd.', 50, yStart + 15);
    doc.text('Hyderabad, Telangana — 500081', 50, yStart + 28);
    doc.text('GSTIN: 36AAECV0000A1Z0', 50, yStart + 41);
    doc.text('Email: billing@auramaniac.com', 50, yStart + 54);

    // Customer (right)
    const addr = order.shippingAddress || {};
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#111827').text('Bill To:', 350, yStart);
    doc.font('Helvetica').fontSize(9).fillColor('#4b5563');
    doc.text(`${addr.fullName || 'Customer'}`, 350, yStart + 15);
    doc.text(`${addr.addressLine1 || ''}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}`, 350, yStart + 28);
    doc.text(`${addr.city || ''}, ${addr.state || ''} — ${addr.pincode || ''}`, 350, yStart + 41);
    doc.text(`Phone: ${addr.phone || 'N/A'}`, 350, yStart + 54);

    // ─── ORDER INFO ───
    const orderInfoY = yStart + 80;
    doc.rect(50, orderInfoY, 500, 25).fill('#f3f4f6');
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#6b7280');
    doc.text('ORDER NUMBER', 60, orderInfoY + 8);
    doc.text('PAYMENT METHOD', 200, orderInfoY + 8);
    doc.text('PAYMENT STATUS', 340, orderInfoY + 8);
    doc.text('PAYMENT ID', 460, orderInfoY + 8);

    doc.font('Helvetica').fontSize(8).fillColor('#111827');
    const valY = orderInfoY + 28;
    doc.text(order.orderNumber, 60, valY);
    doc.text(order.paymentInfo?.method === 'cod' ? 'COD' : 'Online (Razorpay)', 200, valY);
    doc.text(order.paymentInfo?.status?.toUpperCase() || 'PENDING', 340, valY);
    doc.text(order.paymentInfo?.razorpayPaymentId || 'N/A', 460, valY, { width: 80 });

    // ─── ITEMS TABLE ───
    const tableY = orderInfoY + 55;
    doc.rect(50, tableY, 500, 22).fill('#7c3aed');
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#fff');
    doc.text('#', 58, tableY + 7, { width: 20 });
    doc.text('ITEM', 80, tableY + 7, { width: 190 });
    doc.text('SIZE', 275, tableY + 7, { width: 40 });
    doc.text('QTY', 320, tableY + 7, { width: 35, align: 'center' });
    doc.text('PRICE', 365, tableY + 7, { width: 70, align: 'right' });
    doc.text('TOTAL', 445, tableY + 7, { width: 95, align: 'right' });

    let y = tableY + 28;
    doc.font('Helvetica').fontSize(8).fillColor('#374151');
    order.items.forEach((item, i) => {
        const bg = i % 2 === 0 ? '#f9fafb' : '#ffffff';
        doc.rect(50, y - 5, 500, 20).fill(bg);
        doc.fillColor('#374151');
        doc.text(String(i + 1), 58, y, { width: 20 });
        doc.text(item.title?.substring(0, 38) || 'Product', 80, y, { width: 190 });
        doc.text(item.size || '-', 275, y, { width: 40 });
        doc.text(String(item.quantity), 320, y, { width: 35, align: 'center' });
        doc.text(`₹${item.price?.toLocaleString('en-IN')}`, 365, y, { width: 70, align: 'right' });
        doc.text(`₹${(item.price * item.quantity)?.toLocaleString('en-IN')}`, 445, y, { width: 95, align: 'right' });
        y += 20;

        if (y > 700) { doc.addPage(); y = 50; }
    });

    // ─── TOTALS ───
    y += 10;
    doc.moveTo(350, y).lineTo(550, y).stroke('#e5e7eb');
    y += 10;

    const totalX = 350;
    const valRight = 550;

    doc.font('Helvetica').fontSize(9).fillColor('#4b5563');
    doc.text('Subtotal', totalX, y);
    doc.text(`₹${order.itemsTotal?.toLocaleString('en-IN')}`, totalX, y, { width: 200, align: 'right' });
    y += 18;

    if (order.discount > 0) {
        doc.fillColor('#16a34a');
        doc.text(`Discount${order.couponUsed ? ' (' + order.couponUsed + ')' : ''}`, totalX, y);
        doc.text(`-₹${order.discount?.toLocaleString('en-IN')}`, totalX, y, { width: 200, align: 'right' });
        y += 18;
    }

    doc.fillColor('#4b5563');
    doc.text('Shipping', totalX, y);
    doc.text(order.shippingCharge === 0 ? 'FREE' : `₹${order.shippingCharge}`, totalX, y, { width: 200, align: 'right' });
    y += 18;

    // GST Breakdown (18% assumed)
    const taxableAmount = order.itemsTotal - (order.discount || 0);
    const gstRate = 18;
    const gstAmount = Math.round(taxableAmount * gstRate / (100 + gstRate)); // Tax inclusive
    const cgst = Math.round(gstAmount / 2);
    const sgst = gstAmount - cgst;

    doc.fontSize(8).fillColor('#6b7280');
    doc.text(`CGST (${gstRate / 2}%)`, totalX, y);
    doc.text(`₹${cgst.toLocaleString('en-IN')}`, totalX, y, { width: 200, align: 'right' });
    y += 15;
    doc.text(`SGST (${gstRate / 2}%)`, totalX, y);
    doc.text(`₹${sgst.toLocaleString('en-IN')}`, totalX, y, { width: 200, align: 'right' });
    y += 15;

    // Grand Total
    doc.moveTo(350, y).lineTo(550, y).stroke('#7c3aed');
    y += 8;
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#7c3aed');
    doc.text('GRAND TOTAL', totalX, y);
    doc.text(`₹${order.totalAmount?.toLocaleString('en-IN')}`, totalX, y, { width: 200, align: 'right' });

    // ─── FOOTER ───
    const footerY = 760;
    doc.moveTo(50, footerY).lineTo(550, footerY).stroke('#e5e7eb');
    doc.font('Helvetica').fontSize(7).fillColor('#9ca3af');
    doc.text('This is a computer-generated invoice and does not require a physical signature.', 50, footerY + 8, { align: 'center', width: 500 });
    doc.text('Thank you for shopping with AURA Maniac! | support@auramaniac.com | www.auramaniac.com', 50, footerY + 20, { align: 'center', width: 500 });

    doc.end();
};

module.exports = generateInvoice;
