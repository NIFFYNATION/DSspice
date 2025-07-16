import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingScreen({ show = true, duration = 2500 }) {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (show) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 1;
        });
      }, duration / 100);
      
      return () => clearInterval(interval);
    }
  }, [show, duration]);
  
  // Prepare the letters for the animated text
  const letters = "D&Sspice".split("");
  
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { 
              duration: 0.8,
              ease: [0.04, 0.62, 0.23, 0.98] 
            } 
          }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background dark:bg-dark-background overflow-hidden"
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Gradient circle backgrounds */}
            <motion.div 
              initial={{ scale: 1.5, x: '100%', y: '0%' }}
              animate={{ 
                scale: 2,
                x: '60%', 
                y: '0%',
                transition: { 
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 8,
                  ease: "easeInOut"
                }
              }}
              className="absolute -top-[40%] -right-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-r from-secondary/5 to-accent/10 blur-3xl"
            />
            
            <motion.div 
              initial={{ scale: 1.5, x: '-100%', y: '50%' }}
              animate={{ 
                scale: 2.5,
                x: '-60%', 
                y: '70%',
                transition: { 
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 10,
                  ease: "easeInOut"
                }
              }}
              className="absolute -bottom-[40%] -left-[30%] w-[800px] h-[800px] rounded-full bg-gradient-to-r from-accent/5 to-secondary/10 blur-3xl"
            />
          </div>
          
          <div className="relative z-10 w-full max-w-md px-4 flex flex-col items-center">
            {/* Spinning logo animation */}
            <div className="relative mb-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.6, rotateY: -90 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  rotateY: 0,
                  transition: { 
                    duration: 1.2,
                    ease: [0.16, 1, 0.3, 1] 
                  }
                }}
                className="relative z-10"
              >
                <img
                  src="/images/spicy-logo.png"
                  alt="D&Sspice Logo"
                  className="h-28 w-auto"
                />
              </motion.div>
              
              {/* Decorative ring around logo */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 0.7, 
                  scale: 1,
                  transition: { delay: 0.6, duration: 0.8 }
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <svg className="w-40 h-40 absolute" viewBox="0 0 100 100">
                  <motion.circle 
                    cx="50" 
                    cy="50" 
                    r="48" 
                    fill="none" 
                    stroke="url(#gradient)" 
                    strokeWidth="0.5"
                    strokeDasharray="0 1"
                    initial={{ pathLength: 0 }}
                    animate={{ 
                      pathLength: 1,
                      transition: { 
                        duration: 1.5, 
                        ease: "easeInOut",
                        delay: 0.8
                      }
                    }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4c294a" />
                      <stop offset="100%" stopColor="#8e4b8b" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Orbiting dots */}
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ 
                    rotate: 360,
                    transition: { 
                      repeat: Infinity,
                      duration: 1,
                      ease: "linear"
                    }
                  }}
                  className="absolute w-40 h-40"
                >
                  {[...Array(12)].map((_, i) => (
                    <motion.div 
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ 
                        scale: 1,
                        transition: { 
                          delay: 1 + (i * 0.1),
                          duration: 0.4
                        }
                      }}
                      className="absolute w-1.5 h-1.5 rounded-full bg-accent"
                      style={{
                        top: '50%',
                        left: '50%',
                        transform: `rotate(${i * 30}deg) translateX(60px) translateY(-50%)`
                      }}
                    />
                  ))}
                </motion.div>
              </motion.div>
            </div>
            
            {/* Animated brand name letters */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 1,
                transition: { 
                  delay: 0.6,
                  duration: 0.8
                }
              }}
              className="flex justify-center mb-10 overflow-hidden"
            >
              {letters.map((letter, index) => (
                <motion.span
                  key={index}
                  initial={{ y: 40 }}
                  animate={{ 
                    y: 0,
                    transition: { 
                      delay: 0.8 + (index * 0.1),
                      duration: 0.6,
                      ease: [0.215, 0.61, 0.355, 1]
                    }
                  }}
                  className="inline-block mx-0.5 text-2xl font-bold text-secondary dark:text-primary"
                >
                  {letter}
                </motion.span>
              ))}
            </motion.div>
            
            {/* Tagline with typing effect */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 0.8,
                transition: { 
                  delay: 1.8,
                  duration: 0.5
                }
              }}
              className="text-center text-text-secondary dark:text-dark-text-secondary mb-10 text-sm"
            >
              Bringing authentic African flavors to your kitchen
            </motion.p>
            
            {/* Animated progress bar */}
            <div className="w-full mb-3">
              <div className="relative h-1.5 w-full bg-secondary/10 overflow-hidden rounded-full">
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ 
                    x: `${progress - 100}%`,
                    transition: { duration: 0.6, ease: "easeOut" }
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-secondary via-accent to-secondary"
                />
              </div>
            </div>
            
            {/* Loading text with percentage */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 1, 1, 1, 0, 0, 1, 1], 
                transition: { 
                  repeat: Infinity,
                  duration: 2.5
                }
              }}
              className="text-sm text-text-secondary dark:text-dark-text-secondary tracking-wider"
            >
              LOADING {progress}%
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 