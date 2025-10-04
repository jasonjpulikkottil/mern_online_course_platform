import axios from '../utils/axiosConfig';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const createCheckoutSession = async (courseId) => {
  const response = await axios.post(`/payment/courses/${courseId}/checkout`);
  return response.data;
};

const redirectToCheckout = async (sessionId) => {
  const stripe = await stripePromise;
  const { error } = await stripe.redirectToCheckout({
    sessionId,
  });
  if (error) {
    console.error('Error redirecting to checkout:', error);
  }
};

const paymentService = {
  createCheckoutSession,
  redirectToCheckout,
};

export default paymentService;
