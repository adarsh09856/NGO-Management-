const crypto = require('crypto');
const Razorpay = require('razorpay');
const { pool } = require('../config/db');
const {
  processSuccessfulDonation,
  verifyRazorpaySignature,
  processSubscriptionCharge,
  processSubscriptionFailure
} = require('../services/paymentService');
const { logAudit } = require('../middleware/auditLogger');

// Helper to obtain initialized Razorpay SDK instance
function getRazorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_DPLFoundation2026';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_key_bhutan_peace';
  return new Razorpay({ key_id, key_secret });
}

// 1. Create Payment Order (Direct Razorpay Gateway Integration with Idempotency Key support)
async function createPaymentOrder(req, res) {
  try {
    const { amount, currency = 'INR', donorName, donorEmail, donorPhone, campaignId, donationFor } = req.body;
    const idempotencyKey = req.headers['x-idempotency-key'] || req.body.idempotencyKey;

    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid payment amount is required' });
    }

    // Check if order was already generated for this idempotency key
    if (idempotencyKey) {
      try {
        const [existing] = await pool.query(
          `SELECT order_id, amount, currency, payload FROM payment_idempotency_log 
           WHERE event_id = ? AND status = 'ORDER_CREATED' LIMIT 1`,
          [idempotencyKey]
        );
        if (existing.length > 0) {
          return res.json({
            success: true,
            isIdempotentReplay: true,
            data: {
              orderId: existing[0].order_id,
              amount: Math.round(parseFloat(existing[0].amount) * 100),
              currency: existing[0].currency,
              keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_DPLFoundation2026',
              orgName: 'Drodul Phendey Ling Foundation',
              themeColor: '#4A0E17'
            }
          });
        }
      } catch (idempErr) {
        // Continue if idempotency table lookup fails
      }
    }

    const amountInPaise = Math.round(parseFloat(amount) * 100);
    const receipt = `RC-${Date.now().toString().slice(-8)}`;

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt,
      notes: {
        donor_name: donorName || 'Devotee',
        donor_email: donorEmail || '',
        donor_phone: donorPhone || '',
        campaign_id: campaignId ? String(campaignId) : '',
        donation_for: donationFor || 'Peace Stupa Construction'
      }
    });

    if (idempotencyKey) {
      try {
        await pool.query(
          `INSERT INTO payment_idempotency_log (gateway, event_id, order_id, amount, currency, status, payload)
           VALUES ('razorpay', ?, ?, ?, ?, 'ORDER_CREATED', ?)`,
          [idempotencyKey, order.id, parseFloat(amount), currency, JSON.stringify({ donorName, donorEmail, amount })]
        );
      } catch (e) {
        // Non-fatal
      }
    }

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'payments',
      action: 'create_order',
      recordId: order.id,
      details: { amount: parseFloat(amount), currency, receipt, orderId: order.id }
    });

    return res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_DPLFoundation2026',
        orgName: 'Drodul Phendey Ling Foundation',
        themeColor: '#4A0E17'
      }
    });
  } catch (error) {
    console.error('[Create Payment Order Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to create payment order: ' + error.message });
  }
}

// 2. Verify Payment & Idempotent Record Creation (Mandatory Cryptographic Timing-Safe Signature Gate)
async function verifyPayment(req, res) {
  try {
    const razorpayOrderId = req.body.razorpayOrderId || req.body.razorpay_order_id;
    const razorpayPaymentId = req.body.razorpayPaymentId || req.body.razorpay_payment_id;
    const razorpaySignature = req.body.razorpaySignature || req.body.razorpay_signature;

    const {
      donorName,
      donorEmail,
      donorPhone,
      donorAddress,
      amount,
      currency = 'INR',
      campaignId,
      donationFor,
      donationType = 'one_time',
      sendReceipt = true,
      remarks
    } = req.body;

    // Strict validation of mandatory fields
    if (!donorName || !donorEmail || !amount) {
      return res.status(400).json({ success: false, message: 'Donor name, email, and amount are required' });
    }

    // Reject immediately if any Razorpay proof parameter is absent
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Razorpay order ID, payment ID, and cryptographic signature are strictly required.'
      });
    }

    // Cryptographic signature verification - zero-trust gate
    const isValidSignature = verifyRazorpaySignature({
      order_id: razorpayOrderId,
      payment_id: razorpayPaymentId,
      signature: razorpaySignature
    });

    if (!isValidSignature) {
      console.warn(`[Security Alert] Invalid payment signature attempt for order ${razorpayOrderId}, payment ${razorpayPaymentId}`);
      logAudit({
        userId: req.user ? req.user.id : null,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        module: 'payments',
        action: 'signature_verification_rejected',
        recordId: razorpayOrderId,
        details: { razorpayPaymentId, razorpayOrderId, donorEmail, amount }
      });
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Payment verification rejected.'
      });
    }

    // Settle donation and generate receipt only after cryptographic proof of payment
    const eventId = razorpayPaymentId;
    const settlement = await processSuccessfulDonation({
      gateway: 'razorpay',
      eventId,
      paymentId: razorpayPaymentId,
      orderId: razorpayOrderId,
      donorName,
      donorEmail,
      donorPhone,
      donorAddress,
      amount: parseFloat(amount),
      currency,
      campaignId: campaignId ? parseInt(campaignId, 10) : null,
      donationFor: donationFor || 'Peace Stupa Construction',
      donationType,
      paymentMethod: 'online_gateway',
      sendReceipt: !!sendReceipt,
      remarks
    });

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'payments',
      action: 'payment_verified',
      recordId: settlement.donationId,
      details: { razorpayOrderId, razorpayPaymentId, receiptNumber: settlement.receiptNumber, amount }
    });

    return res.json({
      success: true,
      message: 'Payment verified and donation recorded successfully',
      data: settlement
    });
  } catch (error) {
    console.error('[Payment Verification Error]:', error);
    return res.status(500).json({ success: false, message: 'Payment verification failed: ' + error.message });
  }
}

// 3. Webhook Handler with Timing-Safe HMAC Verification & Idempotent Processing (One-time & Subscription Lifecycle)
async function handleWebhook(req, res) {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'webhook_secret_dpl_2026';

    if (!signature) {
      return res.status(400).json({ status: 'error', message: 'Missing x-razorpay-signature header' });
    }

    // Extract exact raw buffer captured in express.json verify middleware
    const rawBody = req.rawBody || (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const signatureBuffer = Buffer.from(signature, 'utf8');

    if (expectedBuffer.length !== signatureBuffer.length || !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) {
      console.warn('[Security Alert] Invalid webhook HMAC signature received');
      return res.status(400).json({ status: 'error', message: 'Invalid webhook signature' });
    }

    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const event = payload.event;
    console.log(`[Payment Webhook] Validated gateway event: ${event}`);

    // Case A: One-Time Payment Captured
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payload?.payment?.entity;
      if (paymentEntity) {
        const eventId = payload.event_id || paymentEntity.id;
        await processSuccessfulDonation({
          gateway: 'razorpay',
          eventId,
          paymentId: paymentEntity.id,
          orderId: paymentEntity.order_id,
          donorName: paymentEntity.notes?.donor_name || 'Online Devotee',
          donorEmail: paymentEntity.email || 'donor@email.com',
          donorPhone: paymentEntity.contact || null,
          amount: parseFloat(paymentEntity.amount) / 100,
          currency: paymentEntity.currency || 'INR',
          campaignId: paymentEntity.notes?.campaign_id ? parseInt(paymentEntity.notes.campaign_id, 10) : null,
          donationFor: paymentEntity.notes?.donation_for || 'Monastery Development'
        });

        logAudit({
          userId: null,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          module: 'payments',
          action: 'webhook_processed',
          recordId: paymentEntity.id,
          details: { event, orderId: paymentEntity.order_id, amount: parseFloat(paymentEntity.amount) / 100 }
        });
      }
    }

    // Case B: Recurring Subscription Charged Successfully
    else if (event === 'subscription.charged') {
      const subEntity = payload.payload?.subscription?.entity;
      const paymentEntity = payload.payload?.payment?.entity;
      if (subEntity && paymentEntity) {
        await processSubscriptionCharge({
          subscriptionId: subEntity.id,
          paymentId: paymentEntity.id,
          amount: parseFloat(paymentEntity.amount) / 100,
          currency: paymentEntity.currency || 'INR',
          donorEmail: paymentEntity.email,
          donorName: paymentEntity.notes?.donor_name
        });

        logAudit({
          userId: null,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          module: 'subscriptions',
          action: 'subscription_charged',
          recordId: subEntity.id,
          details: { subscriptionId: subEntity.id, paymentId: paymentEntity.id, amount: parseFloat(paymentEntity.amount) / 100 }
        });
      }
    }

    // Case C: Recurring Subscription Charge Failed (Action Required)
    else if (event === 'subscription.failed' || event === 'subscription.halted' || event === 'subscription.pending') {
      const subEntity = payload.payload?.subscription?.entity;
      const paymentEntity = payload.payload?.payment?.entity;
      if (subEntity) {
        await processSubscriptionFailure({
          subscriptionId: subEntity.id,
          errorReason: paymentEntity?.error_description || 'Card authorization failed during recurring subscription renewal.',
          donorEmail: paymentEntity?.email,
          donorName: paymentEntity?.notes?.donor_name,
          amount: paymentEntity ? parseFloat(paymentEntity.amount) / 100 : null,
          currency: paymentEntity?.currency || 'INR'
        });

        logAudit({
          userId: null,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          module: 'subscriptions',
          action: 'subscription_failed_alert',
          recordId: subEntity.id,
          details: { subscriptionId: subEntity.id, reason: paymentEntity?.error_description }
        });
      }
    }

    // Case D: Recurring Subscription Cancelled or Paused
    else if (event === 'subscription.cancelled' || event === 'subscription.paused') {
      const subEntity = payload.payload?.subscription?.entity;
      if (subEntity) {
        const newStatus = event === 'subscription.cancelled' ? 'cancelled' : 'paused';
        await pool.query(
          `UPDATE recurring_pledges SET status = ?, cancelled_at = NOW() WHERE gateway_subscription_id = ?`,
          [newStatus, subEntity.id]
        );

        logAudit({
          userId: null,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          module: 'subscriptions',
          action: `subscription_${newStatus}`,
          recordId: subEntity.id,
          details: { subscriptionId: subEntity.id, status: newStatus }
        });
      }
    }

    return res.status(200).json({ status: 'ok', received: true });
  } catch (error) {
    console.error('[Webhook Error]:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
}

// 4. Reconcile Endpoint (Real Gateway Query & Database State Cross-Check)
async function reconcilePayment(req, res) {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }

    const razorpay = getRazorpayClient();
    const [rzpOrder, rzpPayments, [dbDonations], [dbLogs]] = await Promise.all([
      razorpay.orders.fetch(orderId).catch(err => ({ error: err.message })),
      razorpay.orders.fetchPayments(orderId).catch(() => ({ items: [] })),
      pool.query(`SELECT * FROM donations WHERE transaction_ref LIKE ? OR remarks LIKE ?`, [`%${orderId}%`, `%${orderId}%`]),
      pool.query(`SELECT * FROM payment_idempotency_log WHERE order_id = ?`, [orderId])
    ]);

    if (rzpOrder.error) {
      return res.status(404).json({ success: false, message: `Gateway order ${orderId} not found: ${rzpOrder.error}` });
    }

    const gatewayStatus = rzpOrder.status; // 'created', 'attempted', 'paid'
    const gatewayAmount = rzpOrder.amount / 100;
    const capturedPayments = (rzpPayments.items || []).filter(p => p.status === 'captured');
    const dbDonation = dbDonations[0] || null;
    const dbLog = dbLogs[0] || null;

    const isMatch = (gatewayStatus === 'paid' && dbDonation && dbDonation.payment_status === 'completed') ||
                    (gatewayStatus !== 'paid' && !dbDonation);

    const reconciliationReport = {
      orderId,
      gateway: {
        status: gatewayStatus,
        amount: gatewayAmount,
        currency: rzpOrder.currency,
        attempts: rzpOrder.attempts,
        capturedPaymentsCount: capturedPayments.length,
        capturedPaymentIds: capturedPayments.map(p => p.id)
      },
      database: {
        hasDonationRecord: !!dbDonation,
        donationId: dbDonation?.id || null,
        receiptNumber: dbDonation?.receipt_number || null,
        dbStatus: dbDonation?.payment_status || null,
        dbAmount: dbDonation ? parseFloat(dbDonation.amount) : null,
        idempotencyStatus: dbLog?.status || null
      },
      isReconciled: !!isMatch,
      discrepancy: isMatch
        ? null
        : (gatewayStatus === 'paid' && !dbDonation
          ? 'Order paid at gateway but missing donation record in database'
          : 'Database and gateway status mismatch')
    };

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'payments',
      action: 'reconcile',
      recordId: orderId,
      details: reconciliationReport
    });

    return res.json({
      success: true,
      message: isMatch
        ? `Order ${orderId} is fully reconciled with database state.`
        : `Order ${orderId} has status discrepancy: ${reconciliationReport.discrepancy}`,
      data: reconciliationReport
    });
  } catch (error) {
    console.error('[Reconciliation Error]:', error);
    return res.status(500).json({ success: false, message: 'Reconciliation failed: ' + error.message });
  }
}

module.exports = {
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
  reconcilePayment
};
