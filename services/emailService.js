const nodemailer = require('nodemailer');
const fs = require('fs');

// Configure Nodemailer transporter (Fallback to Ethereal / test account if no real credentials)
let transporter;

async function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass && user !== 'mock_smtp_user') {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  } else {
    // Generate test Ethereal SMTP transporter for development/sandbox
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log(`[Email Service] Using Ethereal sandbox SMTP: ${testAccount.user}`);
    } catch (e) {
      // Fallback dummy transporter
      transporter = nodemailer.createTransport({
        jsonTransport: true
      });
      console.log(`[Email Service] Using JSON test transport.`);
    }
  }

  return transporter;
}

// Send Donation Money Receipt Email with PDF attachment
async function sendReceiptEmail({ toEmail, donorName, receiptNumber, amount, currency, pdfPath }) {
  try {
    const mailer = await getTransporter();
    const mailOptions = {
      from: process.env.SMTP_FROM || '"Drodul Phendey Ling Foundation" <donations@drodulphendeyling.org>',
      to: toEmail,
      subject: `Official Donation Receipt [${receiptNumber}] - Drodul Phendey Ling Foundation`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <div style="background-color: #4A0E17; color: #ffffff; padding: 20px; text-align: center; border-radius: 6px 6px 0 0;">
            <h2 style="margin: 0; color: #D4AF37;">༄༅། །དྲོ་བདུལ་ཕན་བདེ་གླིང་དགོན་པ།</h2>
            <h3 style="margin: 5px 0 0 0;">Drodul Phendey Ling Foundation</h3>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #f3f4f6;">Gelephu, Sarpang Dzongkhag, Bhutan</p>
          </div>
          <div style="padding: 20px; background-color: #ffffff;">
            <p>Dear <strong>${donorName}</strong>,</p>
            <p>Tashi Delek!</p>
            <p>On behalf of the Sangha and monastery community of Drodul Phendey Ling Foundation, we extend our heartfelt gratitude for your generous contribution of <strong>${currency} ${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong> towards our sacred mission.</p>
            <p>Your official tax-deductible receipt (Receipt No: <strong>${receiptNumber}</strong>) is attached with this email for your records.</p>
            <div style="background-color: #FAF5F0; border-left: 4px solid #D4AF37; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; font-style: italic; color: #4B5563;">"Peace comes from within. Do not seek it without." — Lord Buddha</p>
            </div>
            <p>May your meritorious support bring peace, long life, and boundless blessings to you and your family.</p>
            <p>With blessings and prayers,<br><strong>Khenpo Tashi Dorji & Sangha Community</strong><br>Drodul Phendey Ling Foundation</p>
          </div>
          <div style="text-align: center; font-size: 11px; color: #9CA3AF; padding: 15px; border-top: 1px solid #e5e7eb;">
            Tax Exemption Registration: DPL/TAX-EXEMPT/BTN/2026/80G-092 | contact@drodulphendeyling.org | +975 17556559
          </div>
        </div>
      `,
      attachments: pdfPath && fs.existsSync(pdfPath) ? [
        {
          filename: `Receipt-${receiptNumber}.pdf`,
          path: pdfPath
        }
      ] : []
    };

    const info = await mailer.sendMail(mailOptions);
    console.log(`[Email Service] Receipt sent to ${toEmail}. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email Service Error] Failed to send receipt email:`, error.message);
    return { success: false, error: error.message };
  }
}

// Broadcast Email Campaign
async function sendCampaignEmail({ toEmails, subject, bodyHtml }) {
  try {
    const mailer = await getTransporter();
    let sentCount = 0;

    for (const email of toEmails) {
      try {
        await mailer.sendMail({
          from: process.env.SMTP_FROM || '"Drodul Phendey Ling Foundation" <updates@drodulphendeyling.org>',
          to: email,
          subject: subject,
          html: bodyHtml
        });
        sentCount++;
      } catch (e) {
        console.error(`[Email Service] Failed sending to ${email}:`, e.message);
      }
    }

    return { success: true, sentCount };
  } catch (error) {
    console.error(`[Email Campaign Error]:`, error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendReceiptEmail,
  sendCampaignEmail
};
