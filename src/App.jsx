import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import { ThemeProvider } from './context/ThemeContext'
import { LoadingProvider } from './context/LoadingContext'
import LandingPage from './pages/landingPage'
import OrderPage from './pages/OrderPage'
import CheckoutPage from './pages/CheckoutPage'
import ThemeToggle from './components/ThemeToggle'
import ContactPage from './pages/ContactPage'
import LoadingScreen from './components/common/LoadingScreen'

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial app loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500); // Show loading screen for 2.5 seconds
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Loading screen outside of everything else */}
      <LoadingScreen show={isLoading} />
      
      {/* Only render the app content when not loading */}
      {!isLoading && (
        <Router>
          <ThemeProvider>
            <LoadingProvider>
              <MainLayout>
                <div className="min-h-screen bg-background dark:bg-dark-background text-text-primary dark:text-dark-text-primary">
                  {/* Fixed position theme toggle */}
                  <div className="fixed bottom-4 right-4 z-50">
                    <ThemeToggle />
                  </div>
                  
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/order" element={<OrderPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    {/* Removed other routes */}
                  </Routes>
                  
                  {/* Removed CartDrawer */}
                </div>
              </MainLayout>
            </LoadingProvider>
          </ThemeProvider>
        </Router>
      )}
    </>
  )
}