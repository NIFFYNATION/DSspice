import { useState } from 'react';
import { motion } from 'framer-motion';
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';
import Button from '../components/common/Button';
import BackButton from '../components/common/BackButton';
import { fadeInUp } from '../animations/variants';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    }, 1000);
  };

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <BackButton />
        </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary dark:text-dark-text-primary mb-4">
            Contact Us
          </h1>
          <p className="text-text-secondary dark:text-dark-text-secondary max-w-2xl mx-auto">
            Have questions or feedback? We'd love to hear from you!
          </p>
          </motion.div>
        
        <div className="flex flex-col items-center justify-center md:justify-start md:items-stretch">
          {/* Contact Information */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="space-y-8 w-full max-w-xl mx-auto bg-white dark:bg-dark-background rounded-2xl shadow-lg p-10 md:p-14 border border-secondary/10"
          >
            <h2 className="text-2xl font-bold text-center text-text-primary dark:text-dark-text-primary mb-8">
              Get in Touch
            </h2>
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                  <EnvelopeIcon className="h-6 w-6" />
                </div>
                <div className="ml-6">
                  <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">
                    Email
                  </h3>
                  <a 
                    href="mailto:info@dsspice.com"
                    className="text-accent hover:underline text-base"
                  >
                    info@dsspice.com
                  </a>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                  <PhoneIcon className="h-6 w-6" />
                </div>
                <div className="ml-6">
                  <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">
                    Phone
                  </h3>
                  <a 
                    href="tel:+441234567890"
                    className="text-accent hover:underline text-base"
                  >
                    +44 123 456 7890
                  </a>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                  <MapPinIcon className="h-6 w-6" />
                </div>
                <div className="ml-6">
                  <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">
                    Address
                  </h3>
                  <p className="text-text-secondary dark:text-dark-text-secondary text-base">
                    123 Spice Street<br />
                    London, UK
                  </p>
                </div>
              </div>
            </div>
            <div className="pt-8">
              <h3 className="text-md font-medium text-text-primary dark:text-dark-text-primary mb-3">
                Business Hours
              </h3>
              <p className="text-text-secondary dark:text-dark-text-secondary">
                Monday - Friday: 9am - 5pm<br />
                Saturday: 10am - 2pm<br />
                Sunday: Closed
              </p>
            </div>
          </motion.div>
          {/* Contact Form is hidden for now */}
        </div>
      </div>
    </div>
  );
} 