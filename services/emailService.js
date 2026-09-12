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
    if (!toEmail) return { success: false, reason: 'No recipient email provided' };
    const mailer = await getTransporter();
    const mailOptions = {
      from: process.env.SMTP_FROM || '"Drodul Phendey Ling Foundation" <donations@drodulphendeyling.org>',
      to: toEmail,
      subject: `Official Charitable Donation Receipt [${receiptNumber}] - Drodul Phendey Ling Foundation`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <div style="background-color: #4A0E17; color: #ffffff; padding: 20px; text-align: center; border-radius: 6px 6px 0 0;">
            <h2 style="margin: 0; color: #D4AF37;">༄༅། །དྲོ་བདུལ་ཕན་བདེ་གླིང་དགོན་པ།</h2>
            <h3 style="margin: 5px 0 0 0;">Drodul Phendey Ling Foundation</h3>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #f3f4f6;">Gelephu, Sarpang Dzongkhag, Kingdom of Bhutan</p>
          </div>
          <div style="padding: 20px; background-color: #ffffff;">
            <p>Dear <strong>${donorName || 'Noble Patron'}</strong>,</p>
            <p>Tashi Delek!</p>
            <p>On behalf of the monastic community and Sangha of Drodul Phendey Ling Foundation, we express our heartfelt gratitude for your contribution of <strong>${currency || 'INR'} ${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>.</p>
            <p>Your official charitable receipt (Receipt No: <strong>${receiptNumber}</strong>) is attached to this email for your records.</p>
            <div style="background-color: #FAF5F0; border-left: 4px solid #D4AF37; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; font-style: italic; color: #4B5563;">"Peace comes from within. Do not seek it without." — Lord Buddha</p>
            </div>
            <p>May your merits bring peace, prosperity, and boundless blessings to all beings.</p>
            <p>With prayers and blessings,<br><strong>Drodul Phendey Ling Foundation</strong></p>
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

// Send Recurring Subscription Alert Email (Charge Confirmation or Failure Warning)
async function sendSubscriptionAlertEmail({ toEmail, donorName, eventType, amount, currency, nextBillingDate, failureReason }) {
  try {
    if (!toEmail) return { success: false, reason: 'No recipient email' };
    const mailer = await getTransporter();

    const isFailure = eventType === 'failed';
    const subject = isFailure
      ? `Action Required: Recurring Donation Payment Failed — Drodul Phendey Ling`
      : `Recurring Contribution Processed Successfully — Drodul Phendey Ling`;

    const html = isFailure ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #fee2e2; border-radius: 8px;">
        <div style="background-color: #991b1b; color: #ffffff; padding: 15px; text-align: center; border-radius: 6px 6px 0 0;">
          <h3 style="margin: 0;">Recurring Contribution Payment Notice</h3>
        </div>
        <div style="padding: 20px; background-color: #ffffff;">
          <p>Dear <strong>${donorName || 'Devotee'}</strong>,</p>
          <p>We were unable to process your recurring donation of <strong>${currency} ${amount}</strong>.</p>
          <p>Reason: <em>${failureReason || 'Payment authorization declined by card issuer.'}</em></p>
          <p>Please log in to your Member Portal to update your payment method to ensure uninterrupted support for the Sangha.</p>
          <p>With blessings,<br>Drodul Phendey Ling Administration</p>
        </div>
      </div>
    ` : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #d1fae5; border-radius: 8px;">
        <div style="background-color: #065f46; color: #ffffff; padding: 15px; text-align: center; border-radius: 6px 6px 0 0;">
          <h3 style="margin: 0; color: #D4AF37;">Recurring Contribution Received</h3>
        </div>
        <div style="padding: 20px; background-color: #ffffff;">
          <p>Dear <strong>${donorName || 'Devotee'}</strong>,</p>
          <p>Thank you for your ongoing recurring contribution of <strong>${currency} ${amount}</strong>.</p>
          <p>Next Scheduled Date: <strong>${nextBillingDate || 'Next month'}</strong></p>
          <p>With deep appreciation and prayers,<br>Drodul Phendey Ling Foundation</p>
        </div>
      </div>
    `;

    const info = await mailer.sendMail({
      from: process.env.SMTP_FROM || '"Drodul Phendey Ling" <donations@drodulphendeyling.org>',
      to: toEmail,
      subject,
      html
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Subscription Alert Email Error]:', error.message);
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

// Send Pending Verification Acknowledgement Email (UTR Submitted, Awaiting Bank Reconciliation)
async function sendPendingVerificationEmail({ toEmail, donorName, receiptNumber, amount, currency, transactionRef, cause }) {
  try {
    if (!toEmail) return { success: false, reason: 'No recipient email provided' };
    const mailer = await getTransporter();
    const mailOptions = {
      from: process.env.SMTP_FROM || '"Drodul Phendey Ling Foundation" <donations@drodulphendeyling.org>',
      to: toEmail,
      subject: `Offering Proof Logged [Ref: ${transactionRef}] - Awaiting Monastic Verification`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <div style="background-color: #4A0E17; color: #ffffff; padding: 20px; text-align: center; border-radius: 6px 6px 0 0;">
            <h2 style="margin: 0; color: #D4AF37;">༄༅། །དྲོ་བདུལ་ཕན་བདེ་གླིང་དགོན་པ།</h2>
            <h3 style="margin: 5px 0 0 0;">Drodul Phendey Ling Foundation</h3>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #f3f4f6;">Gelephu, Sarpang Dzongkhag, Kingdom of Bhutan</p>
          </div>
          <div style="padding: 20px; background-color: #ffffff;">
            <p>Dear <strong>${donorName || 'Devotee'}</strong>,</p>
            <p>Tashi Delek!</p>
            <p>We have received your sacred merit offering submission of <strong>${currency || 'INR'} ${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong> for <em>${cause || 'Great Druk Wangyel Peace Stupa'}</em>.</p>
            
            <div style="background-color: #FEF3C7; border: 1px solid #F59E0B; border-radius: 6px; padding: 15px; margin: 15px 0;">
              <p style="margin: 0 0 8px 0; font-weight: bold; color: #92400E;">Payment Status: Pending Bank Reconciliation</p>
              <p style="margin: 0; font-size: 13px; color: #78350F;">
                Submitted Transaction Ref / UTR: <strong>${transactionRef}</strong><br>
                Provisional Reference: <strong>${receiptNumber}</strong>
              </p>
            </div>

            <p style="font-size: 13px; line-height: 1.6; color: #374151;">
              Our monastic treasury team will reconcile your submitted UTR proof against our official Bank of Bhutan account statement. 
              <strong>Once verified and confirmed by our finance administrator, your official certified Section 80G tax receipt will be automatically emailed to this address.</strong>
            </p>

            <div style="background-color: #FAF5F0; border-left: 4px solid #D4AF37; padding: 12px; margin: 15px 0;">
              <p style="margin: 0; font-style: italic; font-size: 12px; color: #4B5563;">"Giving Dana is the gateway to liberation and boundless merit."</p>
            </div>
            
            <p style="margin-top: 20px; font-size: 13px; color: #4B5563;">With heartfelt prayers and blessings,<br><strong>Drodul Phendey Ling Monastic Foundation</strong></p>
          </div>
        </div>
      `
    };

    const info = await mailer.sendMail(mailOptions);
    console.log(`[Email Service] Pending verification acknowledgement sent to ${toEmail}. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email Service Error] Failed to send pending email:`, error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendReceiptEmail,
  sendPendingVerificationEmail,
  sendSubscriptionAlertEmail,
  sendCampaignEmail
};
