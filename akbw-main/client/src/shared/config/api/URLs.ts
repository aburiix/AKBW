const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.akbw.uz/api';

const ENDP_POSTS = '/posts/';
const ENDP_SEND_SMS = '/sms/send';
const ENDP_VERIFY_SMS = '/sms/verify';
const ENDP_LOGIN = '/auth/login';
const ENDP_REGISTER = '/auth/register';
const ENDP_AUTH_REFRESH = '/auth/refresh';
const ENDP_PRODUCT = '/product';
const ENDP_PRODUCT_CATEGORIES = '/product/categories';
const ENDP_PRODUCT_SIZES = '/product/sizes';
const ENDP_PRODUCT_COLORS = '/product/colors';
const ENDP_REVIEW = '/review';
const ENDP_CATEGORIES = '/product/categories';
const ENDP_COLORS = '/product/colors';
const ENDP_SIZES = '/product/sizes';
const ENDP_UPLOAD = '/upload';
const ENDP_NOTIFICATIONS = '/notification';
const ENDP_SUPPORT_CHAT_CREATE = '/chat';
const ENDP_SUPPORT_CHAT_MESSAGE_CREATE = '/chat/help-chat-message';
const ENDP_ASK_CHAT_CREATE = '/chat/ask-for-product-chat';
const ENDP_ASK_CHAT_MESSAGE_CREATE = '/chat/ask-for-product-message';

const ENDP_STYLE = '/style';
const ENDP_PAYME_GENERATE_LINK = '/payment/payme/generate-link';
const ENDP_DELIVERY_REGIONS = '/delivery/regions';
const ENDP_DELIVERY_CITIES = '/delivery/cities';
const ENDP_DELIVERY_BRANCHES = '/delivery/branches';
const ENDP_DELIVERY_CALCULATE = '/delivery/calculate';

// Coupon endpoints
const ENDP_COUPON_APPLY = '/coupon/apply';

export {
  BASE_URL,
  ENDP_POSTS,
  ENDP_SEND_SMS,
  ENDP_VERIFY_SMS,
  ENDP_LOGIN,
  ENDP_REGISTER,
  ENDP_AUTH_REFRESH,
  ENDP_PRODUCT,
  ENDP_PRODUCT_CATEGORIES,
  ENDP_PRODUCT_SIZES,
  ENDP_PRODUCT_COLORS,
  ENDP_REVIEW,
  ENDP_CATEGORIES,
  ENDP_COLORS,
  ENDP_SIZES,
  ENDP_UPLOAD,
  ENDP_NOTIFICATIONS,
  ENDP_SUPPORT_CHAT_CREATE,
  ENDP_SUPPORT_CHAT_MESSAGE_CREATE,
  ENDP_ASK_CHAT_CREATE,
  ENDP_ASK_CHAT_MESSAGE_CREATE,
  ENDP_STYLE,
  ENDP_PAYME_GENERATE_LINK,
  ENDP_DELIVERY_REGIONS,
  ENDP_DELIVERY_CITIES,
  ENDP_DELIVERY_BRANCHES,
  ENDP_DELIVERY_CALCULATE,
  ENDP_COUPON_APPLY,
};
