export const loadRazorpay = () => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      window.Razorpay.config = {
        merchant: {
          amazonPay: false  // Disable Amazon Pay integration
        }
      };
      return resolve(true);
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      window.Razorpay.config = {
        merchant: {
          amazonPay: false  // Disable Amazon Pay
        }
      };
      resolve(true);
    };
    script.onerror = (error) => {
      console.error('Razorpay script failed to load:', error);
      reject(new Error('Failed to load payment gateway'));
    };
    document.body.appendChild(script);
  });
}; 