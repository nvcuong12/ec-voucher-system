// ================================================================
// paypal.js
// backend/src/utils/paypal.js
// ================================================================

const PAYPAL_API = "https://api-m.sandbox.paypal.com";

/**
 * Checks if PayPal credentials are set in environment variables.
 * @returns {boolean} True if client ID and secret are set.
 */
export const isPaypalConfigured = () => {
  return !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
};

/**
 * Retrieves a PayPal Access Token using client credentials flow.
 * @returns {Promise<string>} PayPal Access Token.
 */
export const getPaypalAccessToken = async () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials not configured in environment variables.");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to obtain PayPal Access Token: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
};

/**
 * Captures a PayPal order using the order ID.
 * Falls back to mock completion if PayPal is not configured.
 * @param {string} paypalOrderId The PayPal Order ID.
 * @returns {Promise<object>} The PayPal capture response details.
 */
export const capturePaypalOrder = async (paypalOrderId) => {
  if (!isPaypalConfigured()) {
    console.warn("PayPal is not fully configured (missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET). Falling back to Mock Sandbox mode.");
    return {
      status: "COMPLETED",
      id: paypalOrderId || `MOCK-PAYPAL-${Date.now()}`,
    };
  }

  const accessToken = await getPaypalAccessToken();

  const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    // Nếu frontend đã capture rồi, PayPal sẽ trả về 422 ORDER_ALREADY_CAPTURED.
    // Trong trường hợp đó, ta vẫn coi là thành công vì tiền đã thực sự được trừ.
    if (response.status === 422 && errorText.includes("ORDER_ALREADY_CAPTURED")) {
      console.log(`PayPal Order ${paypalOrderId} was already captured by the client.`);
      return { status: "COMPLETED", id: paypalOrderId };
    }
    throw new Error(`Failed to capture PayPal order: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data;
};
