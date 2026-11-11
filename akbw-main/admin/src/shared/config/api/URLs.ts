const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.akbw.uz/api';

const ENDP_POSTS = '/posts/';
const ENDP_SEND_SMS = '/sms/send';
const ENDP_VERIFY_SMS = '/sms/verify';
const ENDP_USERS = '/user';
const ENDP_PRODUCT = '/product';
const ENDP_PRODUCT_CATEGORIES = '/product/categories';
const ENDP_PRODUCT_SIZES = '/product/sizes';
const ENDP_PRODUCT_COLORS = '/product/colors';
const ENDP_ADMIN = '/admin';
const ENDP_PRODUCT_CREATE = '/product';
const ENDP_PRODUCT_CATEGORIES_CREATE = '/product/categories';
const ENDP_UPLOAD = '/upload';
const ENDP_ORDER = '/order';
const ENDP_NOTIFICATION = '/notification';
const ENDP_STYLE = '/style';
const ENDP_DASHBOARD = '/dashboard';
const ENDP_STATISTICS = '/dashboard/statistics';
const ENDP_FACTORY = '/factory';
const ENDP_COUPON = '/coupon';
const ENDP_TRANSACTIONS = '/transactions';
const ENDP_ORDER_STATUS = '/order/order-status';
const ENDP_DELIVERY_REGIONS = '/delivery/regions';
const ENDP_DELIVERY_CITIES = '/delivery/cities';
const ENDP_DELIVERY_BRANCHES = "/delivery/branches";
const ENDP_DELIVERY_CALCULATE = "/delivery/calculate";
const ENDP_DELIVERY_FROM_TO_LINKS = "/delivery/from-to-links";
const ENDP_DELIVERY_SENDER_CONFIG = "/delivery/sender-config";
const ENDP_DELIVERY_DISTANCE = "/delivery/distance";
const ENDP_SHIPMENT = "/shipment/";

export {
  BASE_URL,
  ENDP_POSTS,
  ENDP_SEND_SMS,
  ENDP_VERIFY_SMS,
  ENDP_USERS,
  ENDP_PRODUCT,
  ENDP_PRODUCT_CATEGORIES,
  ENDP_PRODUCT_SIZES,
  ENDP_PRODUCT_COLORS,
  ENDP_ADMIN,
  ENDP_PRODUCT_CREATE,
  ENDP_PRODUCT_CATEGORIES_CREATE,
  ENDP_UPLOAD,
  ENDP_ORDER,
  ENDP_NOTIFICATION,
  ENDP_STYLE,
  ENDP_DASHBOARD,
  ENDP_STATISTICS,
  ENDP_FACTORY,
  ENDP_COUPON,
  ENDP_TRANSACTIONS,
  ENDP_ORDER_STATUS,
  ENDP_DELIVERY_REGIONS,
  ENDP_DELIVERY_CITIES,
  ENDP_DELIVERY_BRANCHES,
  ENDP_DELIVERY_CALCULATE,
  ENDP_SHIPMENT,
  ENDP_DELIVERY_FROM_TO_LINKS,
  ENDP_DELIVERY_SENDER_CONFIG,
  ENDP_DELIVERY_DISTANCE
};

