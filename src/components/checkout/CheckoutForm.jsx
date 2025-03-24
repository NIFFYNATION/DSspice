import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../common/Button';
import { useCart } from '../../context/CartContext';

// Add these utility functions at the top of the file
const formatPhoneNumber = (value) => {
  const phone = value.replace(/\D/g, '');
  if (phone.length < 4) return phone;
  if (phone.length < 7) return `(${phone.slice(0, 3)}) ${phone.slice(3)}`;
  return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 13)}`;
};

const formatCardNumber = (value) => {
  const card = value.replace(/\D/g, '');
  const parts = [];
  for (let i = 0; i < card.length; i += 4) {
    parts.push(card.slice(i, i + 4));
  }
  return parts.join(' ');
};

const formatExpiryDate = (value) => {
  const expiry = value.replace(/\D/g, '');
  if (expiry.length < 3) return expiry;
  return `${expiry.slice(0, 2)}/${expiry.slice(2, 4)}`;
};

export default function CheckoutForm() {
  const { cartItems, cartTotal } = useCart();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '+234',
    
    // Shipping Information
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    
    // Delivery Options
    shippingMethod: 'standard',
    
    // Payment Information
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Shipping cost calculation
  const shippingCosts = {
    standard: 0,
    express: 15,
    overnight: 25
  };

  const getTotalWithShipping = () => {
    return cartTotal + shippingCosts[formData.shippingMethod];
  };

  // Validation rules
  const validateStep = (stepNumber) => {
    const newErrors = {};
    
    if (stepNumber === 3) { // Payment step
      // Only check if fields are not empty
      if (!formData.cardName.trim()) {
        newErrors.cardName = 'Name on card is required';
      }
      if (!formData.cardNumber.trim()) {
        newErrors.cardNumber = 'Card number is required';
      }
      if (!formData.expiryDate.trim()) {
        newErrors.expiryDate = 'Expiry date is required';
      }
      if (!formData.cvv.trim()) {
        newErrors.cvv = 'CVV is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enhanced input handling
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'phone') {
      // Ensure the country code (+234) is always present
      if (!value.startsWith('+234')) {
        formattedValue = '+234' + value.replace('+234', '');
      }
      // Only allow digits after country code
      const numberPart = value.replace('+234', '');
      formattedValue = '+234' + numberPart.replace(/\D/g, '');
    } else if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    } else if (name === 'zipCode') {
      formattedValue = value.replace(/\D/g, '').slice(0, 5);
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const inputClasses = "w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50";
  const labelClasses = "block text-sm font-medium mb-2";
  const errorClasses = "text-red-500 text-sm mt-1";

  const getInputStyles = (fieldName) => `
    ${inputClasses}
    ${errors[fieldName] 
      ? 'border-red-500 bg-red-50 dark:bg-red-900/10' 
      : 'border-secondary/20 bg-background dark:bg-dark-background'}
    ${errors[fieldName] 
      ? 'text-red-600 dark:text-red-400' 
      : 'text-text-primary dark:text-dark-text-primary'}
  `;

  // Order Summary Component
  const OrderSummary = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-background-alt dark:bg-dark-background-alt rounded-lg p-6 space-y-4"
    >
      <h3 className="text-lg font-semibold">Order Summary</h3>
      <div className="space-y-3">
        {cartItems.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>{item.name} x {item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="border-t border-secondary/20 pt-3">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-text-secondary dark:text-dark-text-secondary">
            <span>Shipping ({formData.shippingMethod})</span>
            <span>${shippingCosts[formData.shippingMethod].toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold mt-3 text-lg">
            <span>Total</span>
            <span>${getTotalWithShipping().toFixed(2)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Progress Steps Component
  const ProgressSteps = () => (
    <div className="flex justify-between mb-8">
      {['Personal Info', 'Shipping', 'Payment'].map((label, index) => (
        <div key={label} className="flex items-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ 
              scale: 1,
              backgroundColor: step > index + 1 
                ? 'var(--color-accent)' 
                : step === index + 1 
                ? 'var(--color-secondary)' 
                : 'var(--color-background-alt)'
            }}
            className={`
              w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-primary
              transition-colors duration-300
            `}
          >
            {index + 1}
          </motion.div>
          <span className="ml-2 hidden sm:inline">{label}</span>
          {index < 2 && (
            <div className="mx-4 flex-1 h-0.5 bg-secondary/20" />
          )}
        </div>
      ))}
    </div>
  );

  // Add success screen component
  const SuccessScreen = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12 px-4"
    >
      <div className="mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center"
        >
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      </div>
      <h2 className="text-2xl font-bold mb-4 text-text-primary dark:text-dark-text-primary">
        Order Confirmed!
      </h2>
      <p className="text-text-secondary dark:text-dark-text-secondary mb-8">
        Thank you for your order. We've sent a confirmation email to {formData.email}
      </p>
      <div className="max-w-sm mx-auto bg-background-alt dark:bg-dark-background-alt rounded-lg p-6 mb-8">
        <h3 className="font-semibold mb-4">Order Summary</h3>
        <p className="text-sm mb-2">Order #: {Date.now().toString().slice(-8)}</p>
        <p className="text-sm">Estimated delivery: {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
      </div>
      <Button
        variant="primary"
        onClick={() => window.location.href = '/'}
        className="w-full sm:w-auto"
      >
        Return to Home
      </Button>
    </motion.div>
  );

  // Add loading overlay component
  const LoadingOverlay = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div className="bg-background dark:bg-dark-background rounded-lg p-8 flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
        <p className="text-text-primary dark:text-dark-text-primary">Processing your order...</p>
      </div>
    </motion.div>
  );

  // Enhanced form submission
  const handleSubmit = async () => {
    if (validateStep(3)) {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsSuccess(true);
      } catch (error) {
        setErrors({ submit: 'Failed to process order. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <AnimatePresence>
        {isLoading && <LoadingOverlay />}
      </AnimatePresence>

      {isSuccess ? (
        <SuccessScreen />
      ) : (
        <>
          <ProgressSteps />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-background dark:bg-dark-background rounded-lg p-6 shadow-lg"
                >
                  {/* Step 1: Personal Information */}
                  {step === 1 && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="firstName" className={labelClasses}>First Name</label>
                          <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className={getInputStyles('firstName')}
                            required
                          />
                          {errors.firstName && (
                            <p className={errorClasses}>{errors.firstName}</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="lastName" className={labelClasses}>Last Name</label>
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className={getInputStyles('lastName')}
                            required
                          />
                          {errors.lastName && (
                            <p className={errorClasses}>{errors.lastName}</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="email" className={labelClasses}>Email</label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={getInputStyles('email')}
                            required
                          />
                          {errors.email && (
                            <p className={errorClasses}>{errors.email}</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="phone" className={labelClasses}>Phone Number</label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className={getInputStyles('phone')}
                            placeholder="+2341234567890"
                            required
                          />
                          {errors.phone && (
                            <p className={errorClasses}>{errors.phone}</p>
                          )}
                          <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-1">
                            Type your number after +234
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Shipping Information */}
                  {step === 2 && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>
                      <div>
                        <label htmlFor="address" className={labelClasses}>Street Address</label>
                        <input
                          type="text"
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className={getInputStyles('address')}
                          required
                        />
                        {errors.address && (
                          <p className={errorClasses}>{errors.address}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="apartment" className={labelClasses}>Apartment, suite, etc. (optional)</label>
                        <input
                          type="text"
                          id="apartment"
                          name="apartment"
                          value={formData.apartment}
                          onChange={handleInputChange}
                          className={getInputStyles('apartment')}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label htmlFor="city" className={labelClasses}>City</label>
                          <input
                            type="text"
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className={getInputStyles('city')}
                            required
                          />
                          {errors.city && (
                            <p className={errorClasses}>{errors.city}</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="state" className={labelClasses}>State</label>
                          <input
                            type="text"
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            className={getInputStyles('state')}
                            required
                          />
                          {errors.state && (
                            <p className={errorClasses}>{errors.state}</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="zipCode" className={labelClasses}>ZIP Code</label>
                          <input
                            type="text"
                            id="zipCode"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleInputChange}
                            className={getInputStyles('zipCode')}
                            required
                          />
                          {errors.zipCode && (
                            <p className={errorClasses}>{errors.zipCode}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label htmlFor="shippingMethod" className={labelClasses}>Shipping Method</label>
                        <select
                          id="shippingMethod"
                          name="shippingMethod"
                          value={formData.shippingMethod}
                          onChange={handleInputChange}
                          className={getInputStyles('shippingMethod')}
                          required
                        >
                          <option value="standard">Standard Shipping (Free)</option>
                          <option value="express">Express Shipping ($15)</option>
                          <option value="overnight">Overnight Shipping ($25)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Payment Information */}
                  {step === 3 && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold mb-6">Payment Information</h2>
                      <div>
                        <label htmlFor="cardName" className={labelClasses}>Name on Card</label>
                        <input
                          type="text"
                          id="cardName"
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleInputChange}
                          className={getInputStyles('cardName')}
                          required
                        />
                        {errors.cardName && (
                          <p className={errorClasses}>{errors.cardName}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="cardNumber" className={labelClasses}>Card Number</label>
                        <input
                          type="text"
                          id="cardNumber"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          className={getInputStyles('cardNumber')}
                          placeholder="1234 5678 9012 3456"
                          maxLength="19" // 16 digits + 3 spaces
                          required
                        />
                        {errors.cardNumber && (
                          <p className={errorClasses}>{errors.cardNumber}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="expiryDate" className={labelClasses}>Expiry Date</label>
                          <input
                            type="text"
                            id="expiryDate"
                            name="expiryDate"
                            placeholder="MM/YY"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            className={getInputStyles('expiryDate')}
                            required
                            maxLength="5"
                          />
                          {errors.expiryDate && (
                            <p className={errorClasses}>{errors.expiryDate}</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="cvv" className={labelClasses}>CVV</label>
                          <input
                            type="text"
                            id="cvv"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            className={getInputStyles('cvv')}
                            required
                            maxLength="4"
                            placeholder="123"
                          />
                          {errors.cvv && (
                            <p className={errorClasses}>{errors.cvv}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="mt-8 flex justify-between">
                {step > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    className="w-32"
                  >
                    Back
                  </Button>
                )}
                <div className="ml-auto">
                  {step < 3 ? (
                    <Button
                      variant="primary"
                      onClick={handleNext}
                      className="w-32"
                    >
                      Continue
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={handleSubmit}
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Processing...' : 'Place Order'}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <OrderSummary />
            </div>
          </div>
        </>
      )}
    </div>
  );
} 