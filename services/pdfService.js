const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { uploadDir } = require('../middleware/upload');

// Generate Money Receipt PDF
function generateReceiptPdf(receiptData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const filename = `receipt-${receiptData.receipt_number.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
      const filePath = path.join(uploadDir, filename);
      const writeStream = fs.createWriteStream(filePath);

      doc.pipe(writeStream);

      // Outer Decorative Border
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
         .lineWidth(2)
         .strokeColor('#5A121E')
         .stroke();

      doc.rect(24, 24, doc.page.width - 48, doc.page.height - 48)
         .lineWidth(0.5)
         .strokeColor('#D4AF37')
         .stroke();

      // Header Banner
      doc.rect(25, 25, doc.page.width - 50, 90)
         .fillColor('#4A0E17')
         .fill();

      // Tibetan Line & Header Text
      doc.fontSize(12).fillColor('#D4AF37').text('༄༅། །དྲོ་བདུལ་ཕན་བདེ་གླིང་དགོན་པ།', 40, 35, { align: 'center' });
      doc.fontSize(18).fillColor('#FFFFFF').font('Helvetica-Bold').text('DRODUL PHENDEY LING FOUNDATION', 40, 52, { align: 'center' });
      doc.fontSize(9).fillColor('#E5E7EB').font('Helvetica').text('Building Peace. Empowering Lives. | Gelephu, Sarpang Dzongkhag, Bhutan', 40, 74, { align: 'center' });
      doc.fontSize(8).fillColor('#F3F4F6').text(`Tax Exemption Reg: ${receiptData.tax_exemption_number || 'DPL/TAX-EXEMPT/BTN/2026/80G-092'} (Eligible for 80G)`, 40, 88, { align: 'center' });

      // Receipt Title Box
      doc.moveDown(2);
      const titleY = 135;
      doc.rect(180, titleY, doc.page.width - 360, 26)
         .fillColor('#FAF5F0')
         .strokeColor('#D4AF37')
         .lineWidth(1)
         .fillAndStroke();

      doc.fontSize(12).fillColor('#5A121E').font('Helvetica-Bold')
         .text('OFFICIAL MONEY RECEIPT', 40, titleY + 7, { align: 'center' });

      // Meta Info Grid (Receipt No & Date)
      const metaY = 175;
      doc.fontSize(10).fillColor('#374151').font('Helvetica-Bold');
      doc.text('Receipt No: ', 45, metaY);
      doc.font('Helvetica').fillColor('#5A121E').text(receiptData.receipt_number, 115, metaY);

      doc.font('Helvetica-Bold').fillColor('#374151').text('Receipt Date: ', 380, metaY);
      doc.font('Helvetica').fillColor('#111827').text(new Date(receiptData.receipt_date).toLocaleDateString('en-GB'), 460, metaY);

      doc.font('Helvetica-Bold').fillColor('#374151').text('Financial Year: ', 45, metaY + 20);
      doc.font('Helvetica').fillColor('#111827').text(receiptData.financial_year || '2026-2027', 125, metaY + 20);

      doc.font('Helvetica-Bold').fillColor('#374151').text('Status: ', 380, metaY + 20);
      const isVoid = receiptData.status === 'VOID';
      doc.font('Helvetica-Bold').fillColor(isVoid ? '#DC2626' : '#059669')
         .text(receiptData.status || 'ISSUED', 460, metaY + 20);

      // Horizontal Divider
      doc.moveTo(45, metaY + 45).lineTo(doc.page.width - 45, metaY + 45).strokeColor('#E5E7EB').stroke();

      // Recipient & Payment Details Box
      const detailsY = 235;
      doc.rect(45, detailsY, doc.page.width - 90, 160)
         .fillColor('#FDFBF7')
         .strokeColor('#E5E7EB')
         .lineWidth(1)
         .fillAndStroke();

      let rowY = detailsY + 15;
      const printRow = (label, value) => {
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#4B5563').text(label, 60, rowY);
        doc.font('Helvetica').fillColor('#111827').text(String(value || 'N/A'), 200, rowY, { width: 310 });
        rowY += 24;
      };

      printRow('Received With Thanks From:', receiptData.recipient_name);
      printRow('Email / Contact Phone:', `${receiptData.recipient_email || 'N/A'} | ${receiptData.recipient_phone || 'N/A'}`);
      printRow('Purpose / Donation For:', receiptData.purpose || receiptData.receipt_type || 'Monastery & Stupa Development');
      printRow('Payment Mode & Ref:', `${receiptData.payment_mode || 'Online'} | Ref: ${receiptData.transaction_no || 'N/A'}`);
      printRow('Amount in Words:', receiptData.amount_in_words || 'INR Only');

      // Amount Highlight Box
      const amountBoxY = 415;
      doc.rect(45, amountBoxY, doc.page.width - 90, 45)
         .fillColor('#FDF2E9')
         .strokeColor('#D4AF37')
         .lineWidth(1.5)
         .fillAndStroke();

      doc.fontSize(12).font('Helvetica-Bold').fillColor('#5A121E')
         .text('TOTAL AMOUNT RECEIVED:', 60, amountBoxY + 15);
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#5A121E')
         .text(`${receiptData.currency || 'INR'} ${parseFloat(receiptData.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 320, amountBoxY + 13, { align: 'right', width: 200 });

      // Notes / Void Notice
      if (isVoid) {
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#DC2626')
           .text(`THIS RECEIPT HAS BEEN VOIDED. Reason: ${receiptData.void_reason || 'Administrative correction'}`, 45, 480, { align: 'center' });
      } else {
        doc.fontSize(9).font('Helvetica-Oblique').fillColor('#6B7280')
           .text('Thank you for your noble contribution. May your merits bring peace, prosperity, and joy to all sentient beings.', 45, 480, { align: 'center', width: doc.page.width - 90 });
      }

      // Signatures
      const sigY = 560;
      doc.moveTo(60, sigY + 50).lineTo(220, sigY + 50).strokeColor('#9CA3AF').stroke();
      doc.fontSize(9).font('Helvetica').fillColor('#4B5563').text('Prepared / Verified By', 60, sigY + 55, { align: 'center', width: 160 });

      doc.moveTo(350, sigY + 50).lineTo(510, sigY + 50).strokeColor('#9CA3AF').stroke();
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#5A121E').text('For Drodul Phendey Ling Foundation', 350, sigY + 55, { align: 'center', width: 160 });
      doc.fontSize(8).font('Helvetica').fillColor('#6B7280').text('Authorized Signatory & Seal', 350, sigY + 70, { align: 'center', width: 160 });

      // Footer
      doc.fontSize(8).font('Helvetica').fillColor('#9CA3AF')
         .text('This is a computer-generated official receipt verified with the foundation records.', 40, doc.page.height - 45, { align: 'center' });

      doc.end();

      writeStream.on('finish', () => resolve({ filename, filePath, relativeUrl: `/uploads/${filename}` }));
      writeStream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
}

// Generate Monastic Certificate PDF
function generateCertificatePdf(certData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 40 });
      const filename = `cert-${certData.certificate_number.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
      const filePath = path.join(uploadDir, filename);
      const writeStream = fs.createWriteStream(filePath);

      doc.pipe(writeStream);

      // Gold & Burgundy Certificate Border
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
         .lineWidth(4)
         .strokeColor('#5A121E')
         .stroke();

      doc.rect(28, 28, doc.page.width - 56, doc.page.height - 56)
         .lineWidth(1.5)
         .strokeColor('#D4AF37')
         .stroke();

      doc.rect(32, 32, doc.page.width - 64, doc.page.height - 64)
         .lineWidth(0.5)
         .strokeColor('#5A121E')
         .stroke();

      // Tibetan Header
      doc.fontSize(14).fillColor('#D4AF37').text('༄༅། །དྲོ་བདུལ་ཕན་བདེ་གླིང་བཤད་གྲྭ་ཆེན་མོ།', 40, 50, { align: 'center' });
      doc.fontSize(22).fillColor('#5A121E').font('Helvetica-Bold').text('DRODUL PHENDEY LING SHEDRA', 40, 75, { align: 'center' });
      doc.fontSize(11).fillColor('#4B5563').font('Helvetica').text('Monastic University & Buddhist Research Center | Gelephu, Bhutan', 40, 102, { align: 'center' });

      // Certificate Title
      doc.moveDown(1.5);
      doc.fontSize(26).fillColor('#D4AF37').font('Helvetica-Bold').text('CERTIFICATE OF COMPLETION', 40, 135, { align: 'center' });

      doc.fontSize(11).fillColor('#374151').font('Helvetica').text('This is to certify that monastic scholar', 40, 180, { align: 'center' });

      // Student Name
      doc.fontSize(24).fillColor('#5A121E').font('Helvetica-Bold')
         .text(certData.student_name || 'Monk Scholar', 40, 205, { align: 'center' });

      doc.fontSize(11).fillColor('#4B5563').font('Helvetica')
         .text(`Roll / Sangha ID: ${certData.roll_number || 'MNK-2026-001'}`, 40, 235, { align: 'center' });

      doc.fontSize(12).fillColor('#374151').font('Helvetica')
         .text('has successfully completed the formal curriculum and academic requirements of', 40, 260, { align: 'center' });

      // Course Name
      doc.fontSize(18).fillColor('#1F2937').font('Helvetica-Bold')
         .text(certData.course_title || 'Buddhist Philosophy & Logic', 40, 285, { align: 'center' });

      doc.fontSize(12).fillColor('#059669').font('Helvetica-Bold')
         .text(`Awarded with Grade: ${certData.grade || 'Distinction'}`, 40, 315, { align: 'center' });

      // Serial and Signatures
      const certBottomY = 400;
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#4B5563')
         .text(`Certificate No: ${certData.certificate_number}`, 60, certBottomY);
      doc.font('Helvetica').text(`Issue Date: ${new Date(certData.issue_date).toLocaleDateString('en-GB')}`, 60, certBottomY + 15);

      doc.moveTo(doc.page.width - 260, certBottomY + 20).lineTo(doc.page.width - 60, certBottomY + 20).strokeColor('#5A121E').stroke();
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#5A121E')
         .text(certData.signed_by || 'Khenpo Tashi Dorji, Abbot', doc.page.width - 260, certBottomY + 25, { align: 'center', width: 200 });
      doc.fontSize(8).font('Helvetica').fillColor('#6B7280')
         .text('Principal & Spiritual Director', doc.page.width - 260, certBottomY + 40, { align: 'center', width: 200 });

      doc.end();

      writeStream.on('finish', () => resolve({ filename, filePath, relativeUrl: `/uploads/${filename}` }));
      writeStream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
}

// Generate Salary Slip PDF
function generateSalarySlipPdf(slipData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const filename = `payslip-${slipData.slip_no.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
      const filePath = path.join(uploadDir, filename);
      const writeStream = fs.createWriteStream(filePath);

      doc.pipe(writeStream);

      // Header
      doc.rect(20, 20, doc.page.width - 40, 75).fillColor('#4A0E17').fill();
      doc.fontSize(16).fillColor('#FFFFFF').font('Helvetica-Bold').text('DRODUL PHENDEY LING FOUNDATION', 40, 35, { align: 'center' });
      doc.fontSize(10).fillColor('#E5E7EB').font('Helvetica').text('Monastery Administration & HRM | Gelephu, Bhutan', 40, 55, { align: 'center' });
      doc.fontSize(12).fillColor('#D4AF37').font('Helvetica-Bold').text(`SALARY PAYSLIP - ${slipData.month_name || ''} ${slipData.year}`, 40, 70, { align: 'center' });

      // Employee Info Grid
      const empY = 120;
      doc.rect(40, empY, doc.page.width - 80, 70).fillColor('#F9FAFB').strokeColor('#E5E7EB').fillAndStroke();

      doc.fontSize(9).font('Helvetica-Bold').fillColor('#374151').text('Employee Name:', 50, empY + 10);
      doc.font('Helvetica').fillColor('#111827').text(slipData.employee_name, 150, empY + 10);

      doc.font('Helvetica-Bold').fillColor('#374151').text('Designation:', 320, empY + 10);
      doc.font('Helvetica').fillColor('#111827').text(slipData.designation, 400, empY + 10);

      doc.font('Helvetica-Bold').fillColor('#374151').text('Employee Code:', 50, empY + 30);
      doc.font('Helvetica').fillColor('#111827').text(slipData.employee_code, 150, empY + 30);

      doc.font('Helvetica-Bold').fillColor('#374151').text('Department:', 320, empY + 30);
      doc.font('Helvetica').fillColor('#111827').text(slipData.department, 400, empY + 30);

      doc.font('Helvetica-Bold').fillColor('#374151').text('Slip Number:', 50, empY + 50);
      doc.font('Helvetica').fillColor('#5A121E').text(slipData.slip_no, 150, empY + 50);

      doc.font('Helvetica-Bold').fillColor('#374151').text('Payment Status:', 320, empY + 50);
      doc.font('Helvetica-Bold').fillColor('#059669').text(slipData.payment_status || 'PAID', 400, empY + 50);

      // Earnings & Deductions Table
      const tableY = 210;
      const colWidth = (doc.page.width - 80) / 2;

      // Table Headers
      doc.rect(40, tableY, colWidth, 25).fillColor('#4A0E17').fill();
      doc.fontSize(10).fillColor('#FFFFFF').font('Helvetica-Bold').text('EARNINGS', 50, tableY + 7);
      doc.text('AMOUNT (INR)', colWidth - 60, tableY + 7, { align: 'right', width: 90 });

      doc.rect(40 + colWidth, tableY, colWidth, 25).fillColor('#5A121E').fill();
      doc.fontSize(10).fillColor('#FFFFFF').font('Helvetica-Bold').text('DEDUCTIONS', 50 + colWidth, tableY + 7);
      doc.text('AMOUNT (INR)', doc.page.width - 130, tableY + 7, { align: 'right', width: 90 });

      // Rows
      let rowEarningsY = tableY + 35;
      const printEarning = (label, amt) => {
        doc.fontSize(9).font('Helvetica').fillColor('#374151').text(label, 50, rowEarningsY);
        doc.text(`₹ ${parseFloat(amt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, colWidth - 60, rowEarningsY, { align: 'right', width: 90 });
        rowEarningsY += 20;
      };

      printEarning('Basic Salary', slipData.basic_salary);
      printEarning('Housing Allowance', slipData.housing_allowance);
      printEarning('Monastic / Special Stipend', slipData.monastic_stipend);
      printEarning('Medical Allowance', slipData.medical_allowance);

      let rowDeductY = tableY + 35;
      const printDeduction = (label, amt) => {
        doc.fontSize(9).font('Helvetica').fillColor('#374151').text(label, 50 + colWidth, rowDeductY);
        doc.text(`₹ ${parseFloat(amt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, doc.page.width - 130, rowDeductY, { align: 'right', width: 90 });
        rowDeductY += 20;
      };

      printDeduction('Provident Fund (PF)', slipData.pf_deduction);
      printDeduction('Income Tax / TDS', slipData.tax_deduction);
      printDeduction('Other Deductions', slipData.other_deductions);

      // Totals
      const totalY = Math.max(rowEarningsY, rowDeductY) + 15;
      doc.rect(40, totalY, colWidth, 25).fillColor('#F3F4F6').strokeColor('#E5E7EB').fillAndStroke();
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#111827').text('Total Gross Earnings:', 50, totalY + 7);
      doc.text(`₹ ${parseFloat(slipData.total_earnings).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, colWidth - 60, totalY + 7, { align: 'right', width: 90 });

      doc.rect(40 + colWidth, totalY, colWidth, 25).fillColor('#F3F4F6').strokeColor('#E5E7EB').fillAndStroke();
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#111827').text('Total Deductions:', 50 + colWidth, totalY + 7);
      doc.text(`₹ ${parseFloat(slipData.total_deductions).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, doc.page.width - 130, totalY + 7, { align: 'right', width: 90 });

      // Net Salary Highlight
      const netY = totalY + 40;
      doc.rect(40, netY, doc.page.width - 80, 45).fillColor('#ECFDF5').strokeColor('#059669').lineWidth(1.5).fillAndStroke();
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#065F46').text('NET TAKE-HOME PAY:', 55, netY + 15);
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#065F46').text(`INR ₹ ${parseFloat(slipData.net_salary).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, doc.page.width - 300, netY + 13, { align: 'right', width: 250 });

      // Signatures
      const sigY = netY + 100;
      doc.moveTo(60, sigY + 40).lineTo(200, sigY + 40).strokeColor('#9CA3AF').stroke();
      doc.fontSize(8).font('Helvetica').fillColor('#6B7280').text('Employee Signature', 60, sigY + 45, { align: 'center', width: 140 });

      doc.moveTo(doc.page.width - 240, sigY + 40).lineTo(doc.page.width - 100, sigY + 40).strokeColor('#9CA3AF').stroke();
      doc.fontSize(8).font('Helvetica').fillColor('#6B7280').text('Accountant / HR Signatory', doc.page.width - 240, sigY + 45, { align: 'center', width: 140 });

      doc.end();

      writeStream.on('finish', () => resolve({ filename, filePath, relativeUrl: `/uploads/${filename}` }));
      writeStream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  generateReceiptPdf,
  generateCertificatePdf,
  generateSalarySlipPdf
};
