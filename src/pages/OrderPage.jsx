import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';
import BackButton from '../components/common/BackButton';
import { fadeInUp, staggerContainer } from '../animations/variants';
import { PlusIcon, MinusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { cookies } from '../utils/cookies';
import orderService from '../api/orderService';
import CleanText from '../utils/helper.jsx';

export default function OrderPage() {
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [product, setProduct] = useState({
    id: '',
    name: '',
    description: '',
    images: [],
    features: [],
    sizes: []
  });
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [expandedImage, setExpandedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch product data on mount
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await orderService.getProduct('847694');
        
        if (response.data) {
          const productData = response.data;

          const formattedProduct = {
            id: productData.ID.toString(),
            name: productData.name,
            description: productData.description,
            images: productData.images.map(image => {
              const imageUrl = `${productData.image_base_url.replace(/\/$/, '')}/${image.replace(/^\//, '')}`;
              return imageUrl;
            }),
            features: productData.features || [],
            sizes: (productData.sizes || []).map(size => ({
              id: size.size.toLowerCase(),
              name: size.size,
              weight: size.weight,
              price: size.price,
              stock: size.quantity,
              containerImage: size.container_image
                ? `${productData.image_base_url.replace(/\/$/, '')}/${size.container_image.replace(/^\//, '')}`
                : null
            }))
          };
          setProduct(formattedProduct);
          setIsLoading(false);
        } else {
          setError('No product data available');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setError(error.message || 'Failed to load product data');
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, []);

  // Load saved selections from cookies on mount
  useEffect(() => {
    const savedSelection = cookies.getOrderSelection();
    if (savedSelection && savedSelection.size) {
      setSelectedSize(savedSelection.size);
      setQuantity(savedSelection.quantity || 1);
    }
  }, []);

  // Save selections to cookies whenever they change
  useEffect(() => {
    if (selectedSize && product.id) {
      cookies.saveOrderSelection({
        size: selectedSize,
        quantity: quantity,
        productId: product.id,
        productName: product.name
      });
    }
  }, [selectedSize, quantity, product.id, product.name]);

  // Add useEffect for auto-sliding
  useEffect(() => {
    if (!product.images || product.images.length <= 1) return;

    const intervalId = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }, 3000);

    return () => clearInterval(intervalId);
  }, [product.images]); 

  // Function to handle manual navigation
  const handleImageChange = (index) => {
    if (!product.images || index >= product.images.length) return;
    setCurrentImageIndex(index);
  };

  // The next and previous functions to use the new handler
  const nextImage = () => {
    handleImageChange((currentImageIndex + 1) % product.images.length);
  };

  const previousImage = () => {
    handleImageChange((currentImageIndex - 1 + product.images.length) % product.images.length);
  };

  const handleQuantityChange = (value) => {
    // Use selectedSize.stock as the maximum instead of static 10
    const maxQuantity = selectedSize.stock;
    const newQuantity = Math.max(1, Math.min(maxQuantity, quantity + value));
    setQuantity(newQuantity);
  };

  const handleProceedToCheckout = () => {
    if (!selectedSize) return;
    
    setIsLoading(true);
    
    // Get size index based on the selected size and add 1 to make it 1-based
    const sizeIndex = product.sizes.findIndex(s => s.id === selectedSize.id) + 1;
    
    const orderData = {
      productId: product.id,
      quantity: quantity,
      sizeIndex: sizeIndex, // Now this will be 1 for small, 2 for medium, 3 for large
      size: selectedSize,
      type: product.id,
      typeName: product.name,
      totalPrice: selectedSize.price * quantity
    };

    // Save final selection to cookies before proceeding
    cookies.saveOrderSelection(orderData);
    
    // Navigate to checkout
    setTimeout(() => {
      window.scrollTo(0, 0);
      navigate('/checkout', { state: orderData });
    }, 600);
  };

  // Helper function to render quantity selector
  const QuantitySelector = () => (
    <div className="flex items-center gap-4">
      <button
        onClick={() => handleQuantityChange(-1)}
        disabled={quantity <= 1}
        className={`p-2 rounded-full ${
          quantity <= 1 
            ? 'bg-secondary/10 text-text-secondary cursor-not-allowed' 
            : 'bg-background-alt dark:bg-dark-background-alt hover:bg-accent/10'
        }`}
      >
        <MinusIcon className="w-5 h-5" />
      </button>
      
      <span className="w-8 text-center text-xl font-medium">
        {quantity}
      </span>
      
      <button
        onClick={() => handleQuantityChange(1)}
        disabled={quantity >= selectedSize.stock}
        className={`p-2 rounded-full ${
          quantity >= selectedSize.stock 
            ? 'bg-secondary/10 text-text-secondary cursor-not-allowed' 
            : 'bg-background-alt dark:bg-dark-background-alt hover:bg-accent/10'
        }`}
      >
        <PlusIcon className="w-5 h-5" />
      </button>
    </div>
  );

  const getTotalWithShipping = () => {
    const basePrice = selectedSize && typeof selectedSize.price === "number" ? selectedSize.price : 0;
    const shippingCost = getShippingCost(formData.shippingMethod);
    return (basePrice + shippingCost).toFixed(2);
  };

  // Add this useEffect to check authentication status
  useEffect(() => {
    const token = cookies.getToken();
    setIsAuthenticated(!!token);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-500 mb-2">Error</h2>
          <p className="text-text-secondary">{error}</p>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="mt-4"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Only render if we have product data */}
        {product.images.length > 0 && (
          <>
        <div className="mb-6">
          <BackButton />
        </div>
        
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="space-y-12"
        >
          <motion.div 
            variants={fadeInUp}
            className="text-center"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary dark:text-dark-text-primary mb-4">
              <CleanText rawText="Order Locust Beans" />
            </h1>
            <p className="text-text-secondary dark:text-dark-text-secondary">
              <CleanText rawText="Select your preferred size and quantity" />
            </p>
          </motion.div>
          
          {/* Product Card */}
          <motion.div
            variants={fadeInUp}
            className="overflow-hidden rounded-xl shadow-lg bg-background-alt dark:bg-dark-background-alt"
          >
            <div className="md:flex">
              <div className="md:w-2/5 relative">
                <div className="relative h-64 md:h-full">
                  {product.images && product.images.length > 0 ? (
                    <>
                      <img 
                        src={product.images[currentImageIndex]} 
                        alt={`${product.name} - Image ${currentImageIndex + 1}`} 
                        className="w-full h-full object-cover transition-opacity duration-500"
                        onError={(e) => {
                          console.error('Image failed to load:', e.target.src);
                          e.target.onerror = null; // Prevent infinite loop
                          e.target.src = 'fallback-image-path.jpg'; // You can add a fallback image
                        }}
                      />
                      
                      {/* Only show navigation if there's more than one image */}
                      {product.images.length > 1 && (
                        <>
                          {/* Navigation Buttons */}
                          <button 
                            onClick={() => setCurrentImageIndex((prev) => 
                              (prev - 1 + product.images.length) % product.images.length
                            )}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                          >
                            <ChevronLeftIcon className="w-6 h-6" />
                          </button>
                          
                          <button 
                            onClick={() => setCurrentImageIndex((prev) => 
                              (prev + 1) % product.images.length
                            )}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                          >
                            <ChevronRightIcon className="w-6 h-6" />
                          </button>

                          {/* Image Indicators */}
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                            {product.images.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`w-2 h-2 rounded-full transition-colors ${
                                  currentImageIndex === index ? 'bg-white' : 'bg-white/50'
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    // Fallback image or placeholder
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <p className="text-gray-500">No image available</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-6 md:w-3/5">
                <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-2">
                  <CleanText rawText={product.name} />
                </h2>
                
                <p className="text-text-secondary dark:text-dark-text-secondary mb-6">
                  <CleanText rawText={product.description} />
                </p>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Product Features:</h3>
                  <ul className="space-y-2">
                        {product.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-text-secondary dark:text-dark-text-secondary">
                            <span className="mr-2 text-accent">•</span> <CleanText rawText={feature} />
                    </li>
                        ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Size Selection */}
          <motion.div variants={fadeInUp} className="space-y-6">
            <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary">
              <CleanText rawText="1. Choose Size" />
            </h2>
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-6">
              {product.sizes.map((size, idx) => (
                <button
                  key={size.id}
                  onClick={() => {
                    setSelectedSize(size);
                    setQuantity(1);
                  }}
                  className={`relative group flex items-center w-full sm:w-[calc(33.333%-1.5rem)] max-w-full px-3 py-2 sm:py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/40 shadow-sm cursor-pointer
                    ${selectedSize?.id === size.id
                      ? 'border-accent bg-accent/10 text-accent dark:text-accent scale-[1.02] shadow-lg'
                      : 'border-secondary/20 hover:border-accent hover:scale-[1.01] hover:shadow-md text-text-primary dark:text-dark-text-primary'}
                    ${size.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  style={{ flex: '1 1 100px', minWidth: '100px', maxWidth: '100%', ...(window.innerWidth >= 640 ? { flex: '1 1 300px', minWidth: '260px' } : {}) }}
                  disabled={size.stock === 0}
                  type="button"
                  tabIndex={0}
                  aria-label={`Select size ${size.weight}`}
                >
                  {/* Size container image */}
                  {size.containerImage ? (
                    <div className="relative mr-4">
                      <img
                        src={size.containerImage}
                        alt={`${size.name} container`}
                        className="w-20 h-20 object-cover rounded-lg group-hover:scale-105 group-focus:scale-105 transition-transform duration-200 border border-secondary/20 cursor-pointer"
                        onClick={e => {
                          e.stopPropagation();
                          setExpandedImage(size.containerImage);
                          setIsModalOpen(true);
                        }}
                      />
                      {/* Expand icon overlay - smaller, circle, semi-transparent */}
                      <span className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 rounded-full bg-black/30 opacity-80 group-hover:opacity-100 group-focus:opacity-100 transition-opacity pointer-events-none" title="Click to expand">
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-accent">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 3h6m0 0v6m0-6L10 14m-1 7h-6m0 0v-6m0 6l11-11" />
                        </svg>
                      </span>
                    </div>
                  ) : (
                    <div className="w-20 h-20 flex items-center justify-center bg-secondary/10 rounded-lg mr-4 text-2xl text-accent">
                      <span role="img" aria-label="size">📦</span>
                    </div>
                  )}
                  {/* Details */}
                  <div className="flex flex-col items-start flex-1">
                    <h3 className="text-base font-semibold mb-0.5"><CleanText rawText={size.name} /></h3>
                    <span className="text-xs text-text-secondary mb-0.5"><CleanText rawText={size.weight} /></span>
                    <span className={`text-xs ${size.stock < 5 ? 'text-red-500' : 'text-green-500'}`}><CleanText rawText={size.stock === 0 ? 'Out of Stock' : size.stock < 5 ? `Only ${size.stock} left` : `${size.stock} in stock`} /></span>
                    <span className="text-accent font-bold text-base mt-1">£{size && typeof size.price === "number" ? size.price.toFixed(2) : "0.00"}</span>
                  </div>
                  {/* Radio icon on the right */}
                  <span className="ml-4 flex items-center justify-center">
                    {selectedSize?.id === size.id ? (
                      <svg className="w-6 h-6 text-accent" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" />
                        <circle cx="12" cy="12" r="7" fill="currentColor" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
                      </svg>
                    )}
                  </span>
                  {/* Tooltip for expand */}
                  <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-90 group-focus:opacity-90 pointer-events-none transition-opacity whitespace-nowrap">
                    <CleanText rawText="Click image to expand" />
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
          
          {/* Quantity Selection - only show if size is selected */}
          {selectedSize && (
            <motion.div variants={fadeInUp} className="space-y-6">
              <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary">
                <CleanText rawText="2. Select Quantity" />
              </h2>
              <div className="flex flex-col sm:flex-row items-center justify-between p-6 rounded-2xl bg-background-alt dark:bg-dark-background-alt">
                <div className="mb-4 sm:mb-0">
                  <h3 className="text-lg font-medium mb-2"><CleanText rawText="How many would you like?" /></h3>
                  <p className="text-text-secondary dark:text-dark-text-secondary">
                    <CleanText rawText={`Select between 1-${selectedSize.stock} packs`} />
                  </p>
                </div>
                <QuantitySelector />
              </div>
              
              {/* Order Summary */}
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-6 rounded-2xl bg-accent/10 border border-accent/20"
              >
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span><CleanText rawText="Product:" /></span>
                    <span><CleanText rawText={product.name} /></span>
                  </div>
                  <div className="flex justify-between">
                    <span><CleanText rawText="Size:" /></span>
                    <span><CleanText rawText={selectedSize.weight} /></span>
                  </div>
                  <div className="flex justify-between">
                    <span><CleanText rawText="Price per unit:" /></span>
                    <span> £{selectedSize && typeof selectedSize.price === "number" ? selectedSize.price.toFixed(2) : "0.00"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span><CleanText rawText="Quantity:" /></span>
                    <span>{quantity}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t border-accent/20">
                    <span><CleanText rawText="Subtotal:" /></span>
                    <span> £{selectedSize && typeof selectedSize.price === "number" ? (selectedSize.price * quantity).toFixed(2) : "0.00"}</span>
                  </div>
                  <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-2">
                    <CleanText rawText="*Shipping costs will be calculated at checkout" />
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
          
          {/* Proceed Button */}
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
            <Button
              variant="primary"
              size="large"
              onClick={handleProceedToCheckout}
              disabled={!selectedSize || isLoading}
              isLoading={isLoading}
              className="min-w-[200px] w-full sm:w-auto"
            >
              <CleanText rawText="Proceed to Checkout" />
            </Button>
            
          </motion.div>
        </motion.div>
          </>
        )}
      </div>
      {/* Modal for expanded image */}
      {isModalOpen && expandedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
          <div className="relative max-w-md w-full p-4" onClick={e => e.stopPropagation()}>
            <button
              className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white shadow"
              onClick={() => setIsModalOpen(false)}
            >
              <XMarkIcon className="w-6 h-6 text-black" />
            </button>
            <img
              src={expandedImage}
              alt="Expanded container"
              className="w-full h-auto max-h-[80vh] rounded-xl shadow-lg object-contain bg-white"
            />
          </div>
        </div>
      )}
    </div>
  );
} 