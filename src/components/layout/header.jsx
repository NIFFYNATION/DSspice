import { useState, useCallback, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bars3Icon, XMarkIcon, UserCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Dialog, Popover } from '@headlessui/react';
import { useTheme } from '../../context/ThemeContext';
import authService from '../../api/authService';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const fetchUserProfile = async () => {
    try {
      const response = await authService.getUserProfile();
      if (response.code === 200) {
        setUserProfile(response.data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = authService.isAuthenticated();
      setIsAuthenticated(isAuth);
      
      if (isAuth) {
        fetchUserProfile();
      } else {
        setUserProfile(null);
      }
    };

    checkAuth();

    const interval = setInterval(checkAuth, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleNavigation = useCallback((sectionId) => {
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: sectionId, shouldScroll: true } });
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        const yOffset = -80;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
    setMobileMenuOpen(false);
  }, [location.pathname, navigate]);

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setProfileOpen(false);
    navigate('/');
  };

  const navigation = [
    { name: 'Home', to: '/' },
    { name: 'About', section: 'about' },
    { name: 'Contact Us', to: '/contact' }
  ];

  const linkStyles = "text-sm font-medium text-secondary transition-colors duration-200 hover:text-accent";
  const mobileLinkStyles = "-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-text-primary hover:bg-secondary/10";

  return (
    <>
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-primary fixed inset-x-0 top-0 z-50"
      >
        <nav className={`rounded-full shadow-lg mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${
          darkMode ? 'bg-dark-primary/90' : 'bg-background/90'
        } backdrop-blur-md border-b border-secondary/10`}>
          <div className="flex h-16 items-center justify-between">
            {/* Logo Section */}
            <Link to="/" className="flex-shrink-0">
              <img
                src="/images/spicy-logo.png"
                alt="D&Sspice Logo"
                className="h-10 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-8">
              {navigation.map((item) => (
                item.section ? (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.section)}
                    className={linkStyles}
                  >
                    {item.name}
                  </button>
                ) : (
                  <Link
                    key={item.name}
                    to={item.to}
                    className={`${linkStyles} ${location.pathname === item.to ? 'text-accent' : ''}`}
                  >
                    {item.name}
                  </Link>
                )
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <Link
                to="/order"
                className="hidden md:block px-4 py-2 rounded-full bg-secondary text-primary font-medium transition-all duration-200 hover:bg-secondary-light hover:shadow-lg"
              >
                Order Now
              </Link>

              {/* User Profile Button - Only show when authenticated */}
              {isAuthenticated && (
                <Popover className="relative">
                  <Popover.Button
                    className="flex items-center border border-secondary/40 rounded-full px-3 py-1.5 bg-white hover:shadow transition-all focus:outline-none"
                    onClick={() => setProfileOpen(!profileOpen)}
                  >
                    <UserCircleIcon className="h-6 w-6 text-secondary" />
                    <span className="ml-2 font-medium text-secondary">
                      {userProfile
                        ? userProfile.first_name.length > 6
                          ? userProfile.first_name.slice(0, 6) + '…'
                          : userProfile.first_name
                        : 'User'}
                    </span>
                    <ChevronDownIcon className="ml-1 h-5 w-5 text-secondary" />
                  </Popover.Button>

                  <AnimatePresence>
                    {profileOpen && (
                      <Popover.Panel
                        static
                        className="absolute right-0 mt-2 w-72 rounded-lg bg-background shadow-lg focus:outline-none"
                      >
                        <div className="p-4">
                          <div className="flex items-center space-x-3 mb-4">
                          <UserCircleIcon className="h-6 w-6 text-text-primary" />

                            <div>
                              <h3 className="text-sm font-medium text-text-primary">
                                {userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'Loading...'}
                              </h3>
                              <p className="text-xs text-text-secondary">
                                {userProfile?.email || 'Loading...'}
                              </p>
                            </div>
                          </div>
                          <div className="border-t border-primary pt-4">
                            <Link
                              to="/payments"
                              className="block px-4 py-2 text-sm text-text-primary hover:bg-secondary/10 rounded-md"
                              onClick={() => setProfileOpen(false)}
                            >
                              Payment History
                            </Link>
                            <Link
                              to="/orders"
                              className="block px-4 py-2 text-sm text-text-primary hover:bg-secondary/10 rounded-md"
                              onClick={() => setProfileOpen(false)}
                            >
                              My Orders
                            </Link>
                            <Link
                              to="/checkout"
                              state={{ step: 1, isEditing: true }}
                              className="block px-4 py-2 text-sm text-text-primary hover:bg-secondary/10 rounded-md"
                              onClick={() => setProfileOpen(false)}
                            >
                              Edit Details
                            </Link>
                            <button
                              className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-secondary/10 rounded-md"
                              onClick={handleLogout}
                            >
                              Logout
                            </button>
                          </div>
                        </div>
                      </Popover.Panel>
                    )}
                  </AnimatePresence>
                </Popover>
              )}

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Bars3Icon className="h-6 w-6 text-text-primary" />
              </button>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Mobile menu */}
      <Dialog
        as="div"
        className="fixed inset-0 z-50 lg:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        
        <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-background px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-secondary/10">
          <div className="flex items-center justify-between">
            <img
              src="/images/spicy-logo.png"
              alt="D&Sspice Logo"
              className="h-8 w-auto"
            />
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-secondary/10">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  item.section ? (
                    <button
                      key={item.name}
                      onClick={() => {
                        handleNavigation(item.section);
                        setMobileMenuOpen(false);
                      }}
                      className={mobileLinkStyles}
                    >
                      {item.name}
                    </button>
                  ) : (
                    <Link
                      key={item.name}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`${mobileLinkStyles} ${location.pathname === item.to ? 'text-accent' : ''}`}
                    >
                      {item.name}
                    </Link>
                  )
                ))}
              </div>
              <div className="py-6">
                <Link
                  to="/order"
                  className="block px-4 py-2 text-center rounded-full bg-secondary text-primary font-medium transition-all duration-200 hover:bg-secondary-light hover:shadow-lg"
                >
                  Order Now
                </Link>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </>
  );
}
