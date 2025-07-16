import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Button from '../common/Button';
import { XMarkIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import ImageCarousel from './ImageCarousel';
import { useCart } from '../../context/CartContext';

export default function QuickView({ product, isOpen, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0]);
  const { addToCart } = useCart();

  const handleQuantityChange = (value) => {
    setQuantity(Math.max(1, Math.min(10, value)));
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          static
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="relative z-50"
          open={isOpen}
          onClose={onClose}
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />

          {/* Modal */}
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Dialog.Panel
                as={motion.div}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-background dark:bg-dark-background rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden"
              >
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 dark:bg-dark-background/80 backdrop-blur-sm text-text-primary dark:text-dark-text-primary"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2">
                  {/* Image Carousel */}
                  <div className="relative aspect-square">
                    <ImageCarousel images={product.gallery} />
                  </div>

                  {/* Product Details */}
                  <div className="p-6 md:p-8">
                    <div className="space-y-4">
                      <Dialog.Title className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">
                        {product.name}
                      </Dialog.Title>

                      <p className="text-text-secondary dark:text-dark-text-secondary">
                        {product.fullDescription}
                      </p>

                      {/* Size Selection */}
                      <div>
                        <h4 className="font-medium text-text-primary dark:text-dark-text-primary mb-2">
                          Size
                        </h4>
                        <div className="flex flex-col gap-4">
                          {product.sizes.map((size) => (
                            <button
                              key={size.size}
                              onClick={() => setSelectedSize(size)}
                              className={`relative group flex items-center w-full px-3 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/40 shadow-sm cursor-pointer
                                ${selectedSize.size === size.size
                                  ? 'border-accent bg-accent/10 text-accent dark:text-accent scale-[1.02] shadow-lg'
                                  : 'border-secondary/20 hover:border-accent hover:scale-[1.01] hover:shadow-md text-text-primary dark:text-dark-text-primary'}
                              `}
                              tabIndex={0}
                              aria-label={`Select size ${size.weight}`}
                            >
                              {/* Size image (if available) */}
                              {size.imageSrc ? (
                                <img
                                  src={size.imageSrc}
                                  alt={size.weight}
                                  className="w-16 h-16 object-cover rounded-lg mr-4 group-hover:scale-105 group-focus:scale-105 transition-transform duration-200 border border-secondary/20"
                                />
                              ) : (
                                <div className="w-16 h-16 flex items-center justify-center bg-secondary/10 rounded-lg mr-4 text-2xl text-accent">
                                  <span role="img" aria-label="size">📦</span>
                                </div>
                              )}
                              {/* Details */}
                              <div className="flex flex-col items-start flex-1">
                                <span className="font-semibold text-base mb-1">{size.weight}</span>
                                <span className="text-xs text-text-secondary">{size.size}</span>
                              </div>
                              {/* Expand icon overlay */}
                              <span className="absolute top-2 right-4 opacity-70 group-hover:opacity-100 group-focus:opacity-100 transition-opacity" title="Click to expand">
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-accent">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 3h6m0 0v6m0-6L10 14m-1 7h-6m0 0v-6m0 6l11-11" />
                                </svg>
                              </span>
                              {/* Tooltip */}
                              <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-90 group-focus:opacity-90 pointer-events-none transition-opacity">
                                Click to expand
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Quantity Selector */}
                      <div>
                        <h4 className="font-medium text-text-primary dark:text-dark-text-primary mb-2">
                          Quantity
                        </h4>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="primary"
                            size="small"
                            onClick={() => handleQuantityChange(quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="w-12 text-center text-text-primary dark:text-dark-text-primary">{quantity}</span>
                          <Button
                            variant="primary"
                            size="small"
                            onClick={() => handleQuantityChange(quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      {/* Benefits */}
                      <div>
                        <h4 className="font-medium text-text-primary dark:text-dark-text-primary mb-2">
                          Benefits
                        </h4>
                        <ul className="space-y-2">
                          {product.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-center gap-2 text-text-secondary dark:text-dark-text-secondary">
                              <span className="text-accent">•</span>
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Price and Add to Cart */}
                      <div className="pt-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <span className="text-2xl font-bold text-accent">
                              ${selectedSize.price}
                            </span>
                            <span className="text-text-secondary dark:text-dark-text-secondary ml-2">
                              per unit
                            </span>
                          </div>
                          <span className="text-text-secondary dark:text-dark-text-secondary">
                            Total: ${(selectedSize.price * quantity).toFixed(2)}
                          </span>
                        </div>

                        <Button
                          variant="primary"
                          fullWidth
                          onClick={handleAddToCart}
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
} 