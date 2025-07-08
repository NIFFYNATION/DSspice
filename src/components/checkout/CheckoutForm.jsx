import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../common/Button';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import authService from '../../api/authService';
import orderService from '../../api/orderService';
import {cookies} from '../../utils/cookies';
import checkoutService from '../../api/checkoutService';
import { useLoading } from '../../context/LoadingContext';
import AuthForm from '../auth/AuthForm';

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

// Add this mapping at the top of the file with other utility functions
const shippingMethodToApiValue = {
  'RoyalMailTracked48': '1',
  'RoyalMailTracked24': '2',
  'RoyalMailSigned1stClass': '3',
  'RoyalMailTracked24Signed': '4'
};

// Add a constant for maximum addresses
const MAX_SHIPPING_ADDRESSES = 3;

// Add this component near the top of the file, after imports
const BlockedAccountMessage = ({ message }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <h3 className="text-sm font-medium text-red-800">Account Blocked</h3>
        <div className="mt-2 text-sm text-red-700" dangerouslySetInnerHTML={{ __html: message }} />
      </div>
    </div>
  </div>
);



export default function CheckoutForm({ orderData }) {
  const navigate = useNavigate();
  const location = useLocation();
  const orderDetails = location.state || {};
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postcode: '',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    shippingMethod: 'RoyalMailTracked48',
    password: '',
    confirmPassword: '',
    country: '',
  });
  const [authMode, setAuthMode] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errors, setErrors] = useState({});
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [defaultAddressId, setDefaultAddressId] = useState(null);
  const [shippingMethods, setShippingMethods] = useState([]);
  const { showLoading, hideLoading } = useLoading();
  const [apiRequest, setApiRequest] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [payments, setPayments] = useState([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [hasSelectedShippingMethod, setHasSelectedShippingMethod] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStep, setResetStep] = useState(1); // 1=email, 2=otp+password
  const [resetOtp, setResetOtp] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  
  // Get order data from location state
  const order = location.state || orderData || {
    type: 'powdered',
    size: { id: 'medium', name: 'Medium', weight: '250g', price: 39.99 }
  };

  // Modify the existing useEffect to load user profile
  useEffect(() => {
    const loadUserData = async () => {
      if (authService.isAuthenticated()) {
        setIsAuthenticated(true);
        
        // Get saved order selection from cookies first
        const savedSelection = cookies.getOrderSelection();
        const savedPersonalInfo = savedSelection?.personalInfo;
        
        // Then get user profile from backend
        const response = await authService.getUserProfile();
        
        if (response.code === 200) {
          // Prioritize data from cookies if available, otherwise use profile data
          setFormData(prev => ({
            ...prev,
            firstName: savedPersonalInfo?.firstName || response.data.first_name || '',
            lastName: savedPersonalInfo?.lastName || response.data.last_name || '',
            email: savedPersonalInfo?.email || response.data.email || '',
            phone: savedPersonalInfo?.phone || response.data.phone_number || ''
          }));
        }
      }
    };

    loadUserData();
  }, []);

  // Update the useEffect that loads saved addresses
  useEffect(() => {
    const loadSavedAddresses = async () => {
      if (isAuthenticated) {
        const response = await checkoutService.getShippingAddresses();
        
        if (response.code === 200 && Array.isArray(response.data)) {
          setSavedAddresses(response.data);
          
          // Find default address
          const defaultAddress = response.data.find(addr => addr.is_default === 1);
          if (defaultAddress) {
            setDefaultAddressId(defaultAddress.ID);
            setSelectedAddressId(defaultAddress.ID);
            
            // Pre-fill the form with the default address
            setFormData(prev => ({
              ...prev,
              address: defaultAddress.address,
              city: defaultAddress.city,
              postcode: defaultAddress.zipcode,
              country: defaultAddress.country,
              shippingMethod: getShippingMethodFromValue(defaultAddress.shipping_method)
            }));
          } else if (response.data.length > 0) {
            // If no default, use the first address
            setSelectedAddressId(response.data[0].ID);
            setFormData(prev => ({
              ...prev,
              address: response.data[0].address,
              city: response.data[0].city,
              postcode: response.data[0].zipcode,
              country: response.data[0].country,
              shippingMethod: getShippingMethodFromValue(response.data[0].shipping_method)
            }));
          }
        }
      }
    };

    loadSavedAddresses();
  }, [isAuthenticated]);

  // Add useEffect to fetch shipping methods
  useEffect(() => {
    const loadShippingMethods = async () => {
      const response = await checkoutService.getShippingMethods();
      if (response.code === 200 && Array.isArray(response.data)) {
        setShippingMethods(response.data);
        
        // If we have shipping methods and no method is selected, select the first one
        if (response.data.length > 0 && !formData.shippingMethod) {
          setFormData(prev => ({
            ...prev,
            shippingMethod: response.data[0].ID.toString()
          }));
        }
      }
    };

    loadShippingMethods();
  }, []);

  // Add useEffect to fetch payments when authenticated
  useEffect(() => {
    const fetchPayments = async () => {
      if (isAuthenticated) {
        setIsLoadingPayments(true);
        try {
          const response = await checkoutService.getPayments();
          if (response.code === 200) {
            setPayments(response.data.payments || []);
          }
        } catch (error) {
          console.error('Error fetching payments:', error);
        } finally {
          setIsLoadingPayments(false);
        }
      }
    };

    fetchPayments();
  }, [isAuthenticated]);

  // Add utility function to convert API shipping method value to UI value
  const getShippingMethodFromValue = (value) => {
    const methodMap = {
      1: 'RoyalMailTracked48',
      2: 'RoyalMailTracked24',
      3: 'RoyalMailSigned1stClass',
      4: 'RoyalMailTracked24Signed'
    };
    return methodMap[value] || 'RoyalMailTracked48';
  };

  // Update the getShippingCost function to use the API data
  const getShippingCost = (methodId) => {
    const method = shippingMethods.find(m => m.ID.toString() === methodId);
    return method ? parseFloat(method.price) : 0;
  };

  const getTotalWithShipping = () => {
    const shippingCost = getShippingCost(formData.shippingMethod);
    return order.size.price + shippingCost;
  };

  // Validation rules
  const validateStep = (stepNumber) => {
    const newErrors = {};
    
    if (stepNumber === 1 && !isAuthenticated) {
      // Validate auth fields
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      }
      if (!formData.password.trim()) {
        newErrors.password = 'Password is required';
      }
      if (authMode === 'signup') {
        if (!formData.firstName.trim()) {
          newErrors.firstName = 'First name is required';
        }
        if (!formData.lastName.trim()) {
          newErrors.lastName = 'Last name is required';
        }
        if (!formData.phone.trim()) {
          newErrors.phone = 'Phone number is required';
        }
        if (!formData.confirmPassword.trim()) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
      }
    } else if (stepNumber === 2) {
      // Validate shipping information
      if (!formData.address.trim()) {
        newErrors.address = 'Address is required';
      }
      if (!formData.city.trim()) {
        newErrors.city = 'City is required';
      }
      if (!formData.postcode.trim()) {
        newErrors.postcode = 'ZIP Code is required';
      }
    } else if (stepNumber === 3) {
      // Validate shipping method
      if (!formData.shippingMethod) {
        newErrors.shippingMethod = 'Please select a shipping method';
      }
    } else if (stepNumber === 4) {
      // Validate payment (previously step 3)
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
    
    // Handle different form field types
    if (name === 'phone') {
      setFormData({ ...formData, [name]: formatPhoneNumber(value) });
    } else if (name === 'cardNumber') {
      setFormData({ ...formData, [name]: formatCardNumber(value) });
    } else if (name === 'expiryDate') {
      setFormData({ ...formData, [name]: formatExpiryDate(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
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
  const OrderSummary = () => {
    const orderDetails = location.state || orderData || {
      typeName: 'Product',
      size: { weight: '0g' },
      quantity: 1,
      totalPrice: 0
    };
    
    const selectedMethod = shippingMethods.find(
      m => m.ID.toString() === formData.shippingMethod
    );
    const shippingCost = selectedMethod ? parseFloat(selectedMethod.price) : 0;
    const total = (orderDetails.totalPrice || 0) + shippingCost;
    
    return (
      <div className="space-y-6">
        <div className="bg-background-alt dark:bg-dark-background-alt p-6 rounded-2xl">
          <h3 className="text-lg font-semibold mb-4">
            Order Summary
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between pb-4 border-b border-secondary/10">
              <div className="space-y-1">
                <p className="font-medium">{orderDetails.typeName || 'Product'}</p>
                <p className="text-sm text-text-secondary">
                  {orderDetails.size?.weight || '0g'} × {orderDetails.quantity || 1}
                </p>
              </div>
              <p className="font-medium"> £{(orderDetails.totalPrice || 0).toFixed(2)}</p>
            </div>
            
            <div className="flex justify-between pb-4 border-b border-secondary/10">
              <div className="space-y-1">
                <p>Shipping</p>
                <p className="text-sm text-text-secondary">
                  {selectedMethod?.title || 'No shipping method selected'}
                </p>
              </div>
              <p> £{shippingCost.toFixed(2)}</p>
            </div>
            
            <div className="flex justify-between text-lg font-bold">
              <p>Total</p>
              <p> £{total.toFixed(2)}</p>
            </div>
          </div>
        </div>

     
      </div>
    );
  };

  // Progress Steps Component
  const ProgressSteps = () => (
    <div className="flex justify-between mb-8">
      {['Personal Info', 'Shipping Info', 'Shipping Method'].map((label, index) => (
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
  const SuccessScreen = () => {
    const handleProceedToPayment = async () => {
      if (!paymentUrl) {
        setErrors({ submit: "Payment URL not available" });
        return;
      }

      try {
        const token = cookies.getToken();
        if (!token) {
          setErrors({ submit: "You must be logged in to proceed with payment" });
          return;
        }

        // Check payment status before redirecting
        const response = await orderService.getPaymentStatus(paymentId, token);
        
        if (response.code === 200 && response.data) {
          // Redirect to the payment URL
          window.location.href = response.data.checkout_url;
        } else {
          setErrors({ 
            submit: response.message || "Failed to get payment status" 
          });
        }
      } catch (error) {
        setErrors({ 
          submit: error.message || "An error occurred while processing payment" 
        });
      }
    };

    return (
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
          Proceed to make payment to complete your order.
        </p>
        <p className="text-text-secondary dark:text-dark-text-secondary text-sm">
          <strong>Note: </strong> If you do not proceed with payment within 24 hours, your order request will be automatically deleted.
        </p>
        <div className="max-w-sm mx-auto bg-background-alt dark:bg-dark-background-alt rounded-lg p-6 mb-8 mt-8">
          <h3 className="font-semibold mb-4">Order Summary</h3>
          <p className="text-sm mb-2">Order #: {orderId}</p>
          <p className="text-sm">Estimated delivery: {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
        </div>
        {errors.submit && (
          <p className="text-red-500 text-sm mb-4">{errors.submit}</p>
        )}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <Button
            variant="primary"
            onClick={handleProceedToPayment}
            className="w-full sm:w-auto"
          >
            Proceed to make payment
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/orders')}
            className="w-full sm:w-auto"
          >
            View Order History
          </Button>
        </div>
      </motion.div>
    );
  };

  // loading overlay component
  const LoadingOverlay = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div className="bg-background dark:bg-dark-background rounded-lg p-8 flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
        <p className="text-text-primary dark:text-dark-text-primary">Loading...</p>
      </div>
    </motion.div>
  );

  // Update handleAddressSelect function
  const handleAddressSelect = async (addressId) => {
    try {
      setIsLoading(true);
      const response = await checkoutService.getShippingAddressById(addressId);
      
      if (response.code === 200 && response.data) {
        const address = response.data;
        
        setSelectedAddressId(addressId);
        setFormData(prev => ({
          ...prev,
          address: address.address,
          city: address.city,
          postcode: address.zipcode,
          country: address.country,
          shippingMethod: address.shipping_method
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          submit: 'Failed to load address details'
        }));
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: 'Error loading address details'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Also update the edit button click handler
  const handleEditClick = async (e, addressId) => {
    e.stopPropagation();
    setIsLoading(true);
    
    try {
      const response = await checkoutService.getShippingAddressById(addressId);
      
      if (response.code === 200 && response.data) {
        const address = response.data;
        
        setSelectedAddressId(addressId);
        setIsEditingAddress(true);
        setFormData(prev => ({
          ...prev,
          address: address.address,
          city: address.city,
          postcode: address.zipcode,
          country: address.country,
          shippingMethod: address.shipping_method
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          submit: 'Failed to load address details for editing'
        }));
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: 'Error loading address details for editing'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Update the address list rendering to use the new edit handler
  const renderShippingInformation = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>
      
      {/* Saved Addresses Section */}
      {savedAddresses.length > 0 ? (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Saved Addresses</h3>
            <span className="text-sm text-text-secondary">
              {savedAddresses.length} of {MAX_SHIPPING_ADDRESSES} addresses saved
            </span>
          </div>
          
          <div className="space-y-4">
            {savedAddresses.map((address) => (
              <div
                key={address.ID}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedAddressId === address.ID
                    ? 'border-accent bg-accent/5'
                    : 'border-secondary/20 hover:border-accent/30'
                }`}
                onClick={() => handleAddressSelect(address.ID)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{address.address}</p>
                    <p className="text-sm text-text-secondary">
                      {address.city}, {address.zipcode}
                    </p>
                    <p className="text-sm text-text-secondary">{address.country}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => handleEditClick(e, address.ID)}
                      className="text-sm text-accent hover:underline"
                    >
                      Edit 
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAddress(address.ID);
                      }}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Only show Add New Address button if under the limit */}
          {savedAddresses.length < MAX_SHIPPING_ADDRESSES && (
            <div className="mt-4">
             


              <button
                onClick={() => {
                  setSelectedAddressId(null);
                  setIsEditingAddress(false);
                  setFormData(prev => ({
                    ...prev,
                    address: '',
                    city: '',
                    postcode: '',
                    country: '',
                    shippingMethod: 'RoyalMailTracked48'
                  }));
                }}
                className="text-sm text-accent hover:underline"
              >
                + Add New Address
              </button>
            </div>
          )}

          {/* Show limit reached message */}
          {savedAddresses.length >= MAX_SHIPPING_ADDRESSES && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700">
                Maximum number of shipping addresses ({MAX_SHIPPING_ADDRESSES}) reached. 
                Please delete an existing address to add a new one.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-gray-600">
            You haven't saved any shipping addresses yet. 
            You can save up to {MAX_SHIPPING_ADDRESSES} addresses.
          </p>
        </div>
      )}

      {/* Only show the address form if under the limit or editing */}
      {((!selectedAddressId && savedAddresses.length < MAX_SHIPPING_ADDRESSES) || isEditingAddress) && (
        <div>
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
          
          <div className="mt-4">
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <label htmlFor="postcode" className={labelClasses}>ZIP Code</label>
              <input
                type="text"
                id="postcode"
                name="postcode"
                value={formData.postcode}
                onChange={handleInputChange}
                className={getInputStyles('postcode')}
                required
              />
              {errors.postcode && (
                <p className={errorClasses}>{errors.postcode}</p>
              )}
            </div>
            <div>
              <label htmlFor="country" className={labelClasses}>Country</label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className={getInputStyles('country')}
                required
                
              />
            </div>
          </div>

          {/* Save Address Button */}
          <div className="mt-6 flex justify-between">
            {errors.success && (
              <p className="text-green-500 text-sm mr-4 mt-2">{errors.success}</p>
            )}
             <Button onClick={handleCloseAddress} className="text-sm text-accent">Close</Button>
            <Button
              variant="outline"
              onClick={handleSaveAddress}
              className="px-6"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : isEditingAddress ? 'Update Address' : 'Save Address'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  // Update the shipping method section in renderShippingInformation
  const renderShippingMethods = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-6">Shipping Method</h2>
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-text-primary dark:text-dark-text-primary">
          Select Shipping Method
        </label>
        {shippingMethods.length > 0 ? (
          <div className="mt-2 space-y-3">
            {shippingMethods.map((method) => (
              <label
                key={method.ID}
                className={`block relative p-4 border rounded-lg cursor-pointer transition-all ${
                  formData.shippingMethod === method.ID.toString()
                    ? 'border-accent bg-accent/5'
                    : 'border-secondary/20 hover:border-accent/30'
                }`}
              >
                <input
                  type="radio"
                  name="shippingMethod"
                  value={method.ID}
                  checked={formData.shippingMethod === method.ID.toString()}
                  onChange={e => {
                    handleInputChange(e);
                    setHasSelectedShippingMethod(true);
                  }}
                  className="sr-only"
                />
                <div className="flex justify-between items-center">
                  <div>
                    <span className="block font-medium">{method.title}</span>
                    <span className="text-sm text-text-secondary dark:text-dark-text-secondary">
                      {method.description}
                    </span>
                  </div>
                  <span className="font-medium"> £{parseFloat(method.price).toFixed(2)}</span>
                </div>
              </label>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700">
              No shipping methods available at the moment. Please try again later.
            </p>
          </div>
        )}
        {errors.shippingMethod && (
          <p className="mt-1 text-sm text-red-500">{errors.shippingMethod}</p>
        )}
      </div>
    </div>
  );

  // Form submission
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Get order data from location state
      const orderDetails = location.state;
      
      // Validate all required fields
      if (!orderDetails?.productId) {
        setErrors({ submit: "Product ID is required" });
        return;
      }
      if (!orderDetails?.quantity) {
        setErrors({ submit: "Quantity is required" });
        return;
      }
      if (!orderDetails?.sizeIndex) {
        setErrors({ submit: "Size Index is required" });
        return;
      }
      if (!selectedAddressId) {
        setErrors({ submit: "Shipping Address is required" });
        return;
      }
      if (!formData.shippingMethod) {
        setErrors({ submit: "Shipping Method is required" });
        return;
      }

      const token = cookies.getToken();
      if (!token) {
        setErrors({ submit: "You must be logged in to proceed." });
        return;
      }

      const orderData = {
        productID: orderDetails.productId,
        quantity: orderDetails.quantity,
        size_index: orderDetails.sizeIndex,
        shipping_address: selectedAddressId,
        shipping_method: formData.shippingMethod,
        token
      };


      const response = await orderService.createOrder(orderData);

      if (response.code === 200) {
        cookies.clearOrderSelection();
        setIsComplete(true);
        setOrderId(response.data.ID);
        setPaymentId(response.data.paymentID);
        setPaymentUrl(response.data.payment_url);
        
        setErrors({
          success: `Order created successfully! Order ID: ${response.data.ID}`
        });
      } else {
        // Handle validation errors
        if (response.errors && Array.isArray(response.errors)) {
          const errorMessages = response.errors.join(', ');
          setErrors({ submit: errorMessages });
        } else {
          setErrors({ submit: response.message || 'Failed to process order' });
        }
      }
    } catch (error) {
      setErrors({
        submit: error.message || 'An error occurred while processing your order.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async () => {
    setIsLoading(true);
    try {
      let response;
      if (authMode === 'login') {
        response = await authService.login(formData.email, formData.password);
      } else {
        response = await authService.signup({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        });
      }

      if (response.code === 200) {
        setIsAuthenticated(true);
        // Get fresh user profile data
        const userProfile = await authService.getUserProfile();
        if (userProfile.code === 200) {
          setFormData(prev => ({
            ...prev,
            firstName: userProfile.data.first_name || prev.firstName,
            lastName: userProfile.data.last_name || prev.lastName,
            email: userProfile.data.email || prev.email,
            phone: userProfile.data.phone_number || prev.phone
          }));
        }
        handleNext();
      } else if (response.code === 403) {
        // Handle blocked account
        setErrors({
          auth: response.message || 'Your account has been blocked'
        });
      } else {
        setErrors({
          auth: response.message || 'Authentication failed'
        });
      }
    } catch (error) {
      setErrors({
        auth: error.message || 'An error occurred during authentication'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setStep(1);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postcode: '',
      cardNumber: '',
      cardName: '',
      expiryDate: '',
      cvv: '',
      shippingMethod: 'RoyalMailTracked48',
      password: '',
      confirmPassword: '',
      country: '',
    });
  };

  const loadUserProfile = async () => {
    const response = await authService.getUserProfile();
    
    if (response.code === 200) {
      // User data is available in response.data
      setFormData(prev => ({
        ...prev,
        firstName: response.data.first_name,
        lastName: response.data.last_name,
        email: response.data.email,
        phone: response.data.phone_number
      }));
    } else {
      // Handle error - user might not be logged in
      console.log(response.message);
    }
  };

  // Function to handle saving personal info changes
  const handleSavePersonalInfo = async () => {
    // First validate all required fields
    const newErrors = {};
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First Name is required.';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last Name is required.';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone Number is required.';
    }

    // If there are validation errors, show them and don't proceed
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await checkoutService.editPersonalInfo({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone
      });
      
      if (response.code === 200) {
        // Exit edit mode
        setIsEditingPersonalInfo(false);
        
        // Clear any existing errors
        setErrors({});
      } else {
        // Handle API error response
        if (response.errors && Array.isArray(response.errors)) {
          // Map API error messages to form fields
          const fieldErrors = {};
          response.errors.forEach(error => {
            if (error.includes('First Name')) fieldErrors.firstName = error;
            if (error.includes('Last Name')) fieldErrors.lastName = error;
            if (error.includes('Email')) fieldErrors.email = error;
            if (error.includes('Phone Number')) fieldErrors.phone = error;
          });
          setErrors(fieldErrors);
        } else {
          setErrors({
            auth: response.message || 'Failed to update information'
          });
        }
      }
    } catch (error) {
      setErrors({
        auth: error.message || 'An error occurred while saving changes'
      });
    } finally {
      setIsLoading(false);
    }
  };

  

  // Update handleSaveAddress to use the shipping method ID directly
  const handleSaveAddress = async () => {
    // Validation
    const newErrors = {};
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.postcode.trim()) {
      newErrors.postcode = 'ZIP Code is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      let response;
      if (selectedAddressId && isEditingAddress) {
        response = await checkoutService.editShippingAddress(
          selectedAddressId,
          {
            address: formData.address,
            city: formData.city,
            zipcode: formData.postcode,
            country: formData.country,
            shipping_method: formData.shippingMethod // Use the ID directly
          }
        );
      } else {
        // Check if we're at the limit for new addresses
        if (savedAddresses.length >= MAX_SHIPPING_ADDRESSES) {
          setErrors({
            submit: `Maximum number of shipping addresses (${MAX_SHIPPING_ADDRESSES}) reached. Please delete an existing address first.`
          });
          setIsLoading(false);
          return;
        }
        
        response = await checkoutService.addShippingAddress({
          address: formData.address,
          city: formData.city,
          zipcode: formData.postcode,
          country: formData.country,
          shipping_method: formData.shippingMethod // Use the ID directly
        });
      }

      if (response.code === 200) {
        // Refresh the addresses list
        const addressesResponse = await checkoutService.getShippingAddresses();
        if (addressesResponse.code === 200) {
          setSavedAddresses(addressesResponse.data);
          
          // If this was a new address, select it
          if (!isEditingAddress) {
            setSelectedAddressId(response.data.ID);
          }
          
          // Exit edit mode
          setIsEditingAddress(false);
          
          // Show success message
          setErrors({
            success: isEditingAddress ? 'Address updated successfully!' : 'Address saved successfully!'
          });
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            setErrors(prev => {
              const { success, ...rest } = prev;
              return rest;
            });
          }, 3000);
        }
      } else {
        setErrors({
          submit: response.message || (isEditingAddress ? 'Failed to update address' : 'Failed to save address')
        });
      }
    } catch (error) {
      setErrors({
        submit: error.message || 'An error occurred while saving the address'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShippingProceed = async () => {
  
    if (
      !orderDetails.productId ||
      !orderDetails.quantity ||
      !orderDetails.sizeIndex ||
      !selectedAddressId ||
      !formData.shippingMethod
    ) {
      setErrors({ submit: "Please complete all order details before proceeding." });
      return;
    }

    const token = cookies.getToken();
    if (!token) {
      setErrors({ submit: "You must be logged in to proceed." });
      return;
    }

    const orderData = {
      productID: orderDetails.productId,
      quantity: orderDetails.quantity,
      size_index: orderDetails.sizeIndex,
      shipping_address: selectedAddressId,
      shipping_method: formData.shippingMethod,
      token
    };

   

    showLoading();

    try {
      const response = await orderService.createOrder(orderData);
      
      if (response.code === 200) {
        cookies.clearOrderSelection();
        setIsComplete(true);
        setOrderId(response.data.ID);
        setPaymentId(response.data.paymentID);
        setPaymentUrl(response.data.payment_url);
        setErrors({
          success: `Order created successfully! Order ID: ${response.data.ID}`
        });
      } else {
        if (response.errors && Array.isArray(response.errors)) {
          const errorMessages = response.errors.join(', ');
          setErrors({ submit: errorMessages });
        } else {
          setErrors({ submit: response.message || "Order failed" });
        }
      }
    } catch (error) {
      setErrors({ submit: error.message || "Order failed" });
    } finally {
      hideLoading();
    }
  };

  // Add this function near other handler functions
  const handleCloseAddress = () => {
    // Reset form data for address fields
    setFormData(prev => ({
      ...prev,
      address: '',
      city: '',
      postcode: '',
      country: '',
      shippingMethod: 'RoyalMailTracked48'
    }));
    
      // Set selectedAddressId to a non-null value to hide the form
      setSelectedAddressId('closed');
    
    // Reset editing state
    setIsEditingAddress(false);

      
    
    // Clear any errors
    setErrors(prev => {
      const { address, city, postcode, success, ...rest } = prev;
      return rest;
    });
  };

  // Add this function near other handler functions
  const handleDeleteAddress = async (addressId) => {
    try {
      setIsLoading(true);
      const response = await checkoutService.deleteShippingAddress(addressId);
      
      if (response.code === 200) {
        // Remove the deleted address from the list
        setSavedAddresses(prev => prev.filter(addr => addr.ID !== addressId));
        
        // If the deleted address was selected, clear the selection
        if (selectedAddressId === addressId) {
          setSelectedAddressId(null);
        }
        
        // Show success message
        setErrors({
          success: 'Address deleted successfully!'
        });
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setErrors(prev => {
            const { success, ...rest } = prev;
            return rest;
          });
        }, 3000);
      } else {
        setErrors({
          submit: response.message || 'Failed to delete address'
        });
      }
    } catch (error) {
      setErrors({
        submit: error.message || 'An error occurred while deleting the address'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const ChangePasswordForm = () => {
    const [passwordData, setPasswordData] = useState({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    const handlePasswordChange = (e) => {
      const { name, value } = e.target;
      setPasswordData(prev => ({
        ...prev,
        [name]: value
      }));
      // Clear error when field is edited
      if (passwordErrors[name]) {
        setPasswordErrors(prev => ({
          ...prev,
          [name]: null
        }));
      }
    };

    const handleChangePassword = async () => {
      // Validate
      const newErrors = {};
      if (!passwordData.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
      }
      if (!passwordData.newPassword) {
        newErrors.newPassword = 'New password is required';
      }
      if (!passwordData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your new password';
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      if (Object.keys(newErrors).length > 0) {
        setPasswordErrors(newErrors);
        return;
      }

      setIsChangingPassword(true);
      try {
        const response = await authService.changePassword(
          passwordData.currentPassword,
          passwordData.newPassword,
          passwordData.confirmPassword
        );

        if (response.code === 200) {
          // Clear form and show success message
          setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
          setShowPasswordForm(false);
          setPasswordErrors({
            success: 'Password changed successfully!'
          });
          // Clear success message after 3 seconds
          setTimeout(() => {
            setPasswordErrors({});
          }, 3000);
        } else {
          setPasswordErrors({
            submit: response.message || 'Failed to change password'
          });
        }
      } catch (error) {
        setPasswordErrors({
          submit: error.message || 'An error occurred while changing password'
        });
      } finally {
        setIsChangingPassword(false);
      }
    };

    return (
      <div className="mt-8 pt-8 border-t border-secondary/20">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3 sm:gap-4">
          <h3 className="text-lg font-semibold">Change Password</h3>
          <Button
            variant="outline"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="text-sm"
          >
            {showPasswordForm ? 'Cancel' : 'Change Password'}
          </Button>
        </div>

        {showPasswordForm && (
          <div className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className={labelClasses}>Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className={getInputStyles('currentPassword')}
                required
              />
              {passwordErrors.currentPassword && (
                <p className={errorClasses}>{passwordErrors.currentPassword}</p>
              )}
            </div>

            <div>
              <label htmlFor="newPassword" className={labelClasses}>New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className={getInputStyles('newPassword')}
                required
              />
              {passwordErrors.newPassword && (
                <p className={errorClasses}>{passwordErrors.newPassword}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className={labelClasses}>Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className={getInputStyles('confirmPassword')}
                required
              />
              {passwordErrors.confirmPassword && (
                <p className={errorClasses}>{passwordErrors.confirmPassword}</p>
              )}
            </div>

            {passwordErrors.submit && (
              <p className="text-red-500 text-sm">{passwordErrors.submit}</p>
            )}
            {passwordErrors.success && (
              <p className="text-green-500 text-sm">{passwordErrors.success}</p>
            )}

            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={handleChangePassword}
                className="w-full"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? 'Changing...' : 'Change Password'}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleForgotPassword = async () => {
    if (!resetEmail.trim()) {
      setErrors({ resetEmail: 'Email is required' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.forgotPassword(resetEmail);
      if (response.code === 200) {
        setErrors({
          success: 'Password reset instructions have been sent to your email'
        });
        // Clear success message after 5 seconds
        setTimeout(() => {
          setErrors(prev => {
            const { success, ...rest } = prev;
            return rest;
          });
        }, 5000);
        // Reset the form
        setResetEmail('');
        setIsForgotPassword(false);
      } else {
        setErrors({
          resetEmail: response.message || 'Failed to send reset instructions'
        });
      }
    } catch (error) {
      setErrors({
        resetEmail: error.message || 'An error occurred while processing your request'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      

      <AnimatePresence>
        {isLoading && <LoadingOverlay />}
      </AnimatePresence>

      {isComplete ? (
        <SuccessScreen />
      ) : (
        <>
          <ProgressSteps />
          
          <div className={`grid grid-cols-1 ${isAuthenticated ? 'lg:grid-cols-3' : 'lg:grid-cols-1 lg:max-w-2xl lg:mx-auto'} gap-8`}>
            <div className={isAuthenticated ? 'lg:col-span-2' : ''}>
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
                    !isAuthenticated ? (
                      <AuthForm onAuthSuccess={() => setIsAuthenticated(true)} />
                    ) : (
                      <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 sm:gap-4">
                          <h2 className="text-xl font-semibold">Personal Information</h2>
                          <Button
                            variant="outline"
                            onClick={() => {
                              if (isEditingPersonalInfo) {
                                handleSavePersonalInfo();
                              } else {
                                setIsEditingPersonalInfo(true);
                              }
                            }}
                            className="text-sm px-10 py-2"
                          >
                            {isEditingPersonalInfo ? 'Save Changes' : 'Edit Details'}
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="firstName" className={labelClasses}>First Name</label>
                            <input
                              type="text"
                              id="firstName"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              className={`${getInputStyles('firstName')} ${!isEditingPersonalInfo ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                              required
                              readOnly={!isEditingPersonalInfo}
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
                              className={`${getInputStyles('lastName')} ${!isEditingPersonalInfo ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                              required
                              readOnly={!isEditingPersonalInfo}
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
                              className={`${getInputStyles('email')} ${!isEditingPersonalInfo ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                              required
                              readOnly={!isEditingPersonalInfo}
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
                              className={`${getInputStyles('phone')} ${!isEditingPersonalInfo ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                              placeholder="+2341234567890"
                              required
                              readOnly={!isEditingPersonalInfo}
                            />
                            {errors.phone && (
                              <p className={errorClasses}>{errors.phone}</p>
                            )}
                            <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-1">
                              Type your number after +234
                            </p>
                          </div>
                        </div>
                        
                        <ChangePasswordForm />
                      </div>
                    )
                  )}

                  {/* Step 2: Shipping Information */}
                  {step === 2 && renderShippingInformation()}

                  {/* Step 3: Shipping Method */}
                  {step === 3 && renderShippingMethods()}

                  {/* Step 4: Payment Information (commented out for future use) */}
                  {/* 
                  {step === 4 && (
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
                          maxLength="19"
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
                  */}
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
                  {step === 1 && !isAuthenticated ? null : step < 3 ? (
                    <Button
                      variant="primary"
                      onClick={handleNext}
                      className="w-32"
                      disabled={isEditingPersonalInfo}
                    >
                      Continue
                    </Button>
                  ) : (
                    hasSelectedShippingMethod && (
                      <Button
                        variant="primary"
                        onClick={handleSubmit}
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Processing...' : 'Place Order'}
                      </Button>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary after authentication */}
            {isAuthenticated && (
            <div className="lg:col-span-1">
              <OrderSummary />
            </div>
            )}
          </div>
        </>
      )}

    </div>
  );
} 