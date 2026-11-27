// System font stack as a fallback for Inter to avoid build-time network issues
const inter = {
  variable: '--font-inter',
  className: 'font-inter',
  style: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, system-ui, Inter, "Segoe UI", Roboto, sans-serif',
  },
};

export { inter };
