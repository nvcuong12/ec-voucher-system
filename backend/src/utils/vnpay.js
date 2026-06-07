// ================================================================
// vnpay.js
// backend/src/utils/vnpay.js
// Tích hợp cổng thanh toán VNPay Sandbox
//
// Thuật toán ký theo chuẩn VNPay (giống PHP mẫu chính thức):
//   1. Sort params theo key alphabet
//   2. Encode value: encodeURIComponent + space→"+" (= PHP urlencode)
//   3. Nối: key=encodedVal&key=encodedVal
//   4. HMAC-SHA512
//
// ⚠️ KHÔNG dùng Node.js querystring.stringify vì API khác với npm qs:
//    querystring.stringify(obj, separator, eq, options)
//    → truyền object vào arg2 sẽ bị coerce thành "[object Object]" làm separator!
// ================================================================

import crypto from "crypto";

const VNPAY_URL =
  process.env.VNPAY_URL ||
  "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

/**
 * Lấy thời gian hiện tại theo múi giờ Việt Nam (GMT+7)
 * Dùng getUTC* + cộng offset để tránh phụ thuộc timezone của container
 * @returns {string} YYYYMMDDHHmmss
 */
const getVietnamDateTime = () => {
  const d = new Date(Date.now() + 7 * 60 * 60 * 1000);
  const year  = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day   = String(d.getUTCDate()).padStart(2, "0");
  const hours = String(d.getUTCHours()).padStart(2, "0");
  const mins  = String(d.getUTCMinutes()).padStart(2, "0");
  const secs  = String(d.getUTCSeconds()).padStart(2, "0");
  return `${year}${month}${day}${hours}${mins}${secs}`;
};

/**
 * Chuẩn hóa IP về IPv4 thuần.
 * Docker/proxy hay trả về IPv6-mapped (::ffff:x.x.x.x) hoặc loopback (::1).
 * VNPay chỉ chấp nhận IPv4.
 */
export const sanitizeIp = (ip) => {
  if (!ip) return "127.0.0.1";
  if (ip.startsWith("::ffff:")) return ip.slice(7);
  if (ip === "::1") return "127.0.0.1";
  return ip;
};

/**
 * Build query string thủ công (sort theo key, encode value theo chuẩn VNPay).
 *
 * VNPay PHP: urlencode($key) . "=" . urlencode($value)
 * JS tương đương: encodeURIComponent(val).replace(/%20/g, "+")
 *
 * Hàm này vừa dùng để ký (signData) vừa dùng để build URL
 * vì format hoàn toàn giống nhau.
 *
 * @param {object} params - object chứa key-value RAW (chưa encode)
 * @returns {string}       - "key=encodedVal&key=encodedVal..."
 */
const buildVnpayQueryString = (params) =>
  Object.keys(params)
    .sort()
    .map((key) => {
      const encodedVal = encodeURIComponent(String(params[key])).replace(
        /%20/g,
        "+"
      );
      return `${key}=${encodedVal}`;
    })
    .join("&");

/**
 * HMAC SHA512
 */
const hmacSHA512 = (secretKey, data) =>
  crypto
    .createHmac("sha512", secretKey)
    .update(Buffer.from(data, "utf-8"))
    .digest("hex");

/**
 * Tạo VNPay payment URL (chuẩn VNPay 2.1.0)
 *
 * @param {object} options
 * @param {string} options.orderId     - ID đơn hàng
 * @param {number} options.amount      - Số tiền VND (nguyên, chưa x100)
 * @param {string} options.orderInfo   - Mô tả đơn hàng
 * @param {string} options.returnUrl   - URL redirect sau thanh toán
 * @param {string} options.ipAddr      - IP khách hàng (IPv4)
 * @param {string} [options.locale]    - vn | en
 * @param {string} [options.bankCode]  - Mã ngân hàng (rỗng = show all)
 * @returns {string} URL thanh toán VNPay đã ký
 */
export const createVnpayUrl = ({
  orderId,
  amount,
  orderInfo,
  returnUrl,
  ipAddr,
  locale = "vn",
  bankCode = "",
}) => {
  const tmnCode  = process.env.VNPAY_TMN_CODE;
  const hashSecret = process.env.VNPAY_HASH_SECRET;

  if (!tmnCode || !hashSecret) {
    throw new Error(
      "VNPay credentials not configured (VNPAY_TMN_CODE, VNPAY_HASH_SECRET)"
    );
  }

  const createDate = getVietnamDateTime();
  const txnRef     = String(Date.now());

  // Làm sạch orderInfo: chỉ giữ a-z, A-Z, 0-9, space
  const safeOrderInfo = (orderInfo || "Thanh toan")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .trim();

  const params = {
    vnp_Version:  "2.1.0",
    vnp_Command:  "pay",
    vnp_TmnCode:  tmnCode,
    vnp_Amount:   String(Math.round(Number(amount)) * 100),
    vnp_CurrCode: "VND",
    vnp_TxnRef:   txnRef,
    vnp_OrderInfo: safeOrderInfo,
    vnp_OrderType: "other",
    vnp_Locale:   locale,
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr:   sanitizeIp(ipAddr),
    vnp_CreateDate: createDate,
  };

  if (bankCode) params.vnp_BankCode = bankCode;

  // 1. Build chuỗi ký (sort + encode)
  const signData   = buildVnpayQueryString(params);

  // 2. HMAC SHA512
  const secureHash = hmacSHA512(hashSecret, signData);

  // 3. URL cuối = signData (đã encode đúng) + secure hash
  return `${VNPAY_URL}?${signData}&vnp_SecureHash=${secureHash}`;
};

/**
 * Xác minh chữ ký VNPay trả về.
 *
 * Express tự decode query params → ta re-encode lại theo cùng cách để so sánh hash.
 *
 * @param {object} vnpParams - req.query từ VNPay redirect
 * @returns {{ isValid, responseCode, transactionRef, transactionNo, amount, bankCode, orderInfo, payDate }}
 */
export const verifyVnpayReturn = (vnpParams) => {
  const hashSecret = process.env.VNPAY_HASH_SECRET;
  if (!hashSecret) throw new Error("VNPAY_HASH_SECRET not configured");

  const secureHash = vnpParams["vnp_SecureHash"];
  const params = { ...vnpParams };
  delete params["vnp_SecureHash"];
  delete params["vnp_SecureHashType"];

  const signData    = buildVnpayQueryString(params);
  const computedHash = hmacSHA512(hashSecret, signData);

  const isValid =
    typeof secureHash === "string" &&
    secureHash.toLowerCase() === computedHash.toLowerCase();

  return {
    isValid,
    responseCode:   vnpParams["vnp_ResponseCode"],
    transactionRef: vnpParams["vnp_TxnRef"],
    transactionNo:  vnpParams["vnp_TransactionNo"],
    amount:         vnpParams["vnp_Amount"] ? Number(vnpParams["vnp_Amount"]) / 100 : 0,
    bankCode:       vnpParams["vnp_BankCode"],
    orderInfo:      vnpParams["vnp_OrderInfo"],
    payDate:        vnpParams["vnp_PayDate"],
  };
};
