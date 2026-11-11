// System font stack as a fallback for Inter to avoid build-time network issues
const inter = {
  variable: '--font-inter',
  className: 'font-inter',
  style: {
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
};

export { inter };
