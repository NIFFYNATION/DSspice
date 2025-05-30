import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Button({ 
  children, 
  variant = 'primary', // primary, secondary, outline
  size = 'medium', // small, medium, large
  fullWidth = false,
  href,
  type = 'button',
  isAnimated = true,
  disabled = false,
  onClick,
  className = '',
  isLoading = false,
  loadingText = 'Loading...',
  leftIcon,
  rightIcon,
  iconSize = 'w-5 h-5',
  badge,
  expandOnHover = false,
  tooltip,
  tooltipPosition = 'top',
  ...props 
}) {
  const baseStyles = "rounded-full font-medium transition-all duration-200 flex items-center justify-center text-center";
  
  const variants = {
    primary: "bg-secondary text-primary hover:bg-secondary-light hover:shadow-lg",
    secondary: "bg-background-alt hover:bg-secondary/10",
    outline: "border border-secondary/20 hover:bg-secondary/10",
    danger: "bg-red-500 text-white hover:bg-red-600 hover:shadow-lg",
    success: "bg-green-500 text-white hover:bg-green-600 hover:shadow-lg",
    ghost: "bg-transparent hover:bg-secondary/5",
    link: "p-0 underline-offset-4 hover:underline text-accent",
    gradient: "bg-gradient-to-r from-secondary to-accent text-primary hover:shadow-lg"
  };

  const sizes = {
    small: "px-4 py-2 text-sm",
    medium: "px-6 py-3",
    large: "px-8 py-4 text-lg"
  };

  const buttonClasses = `
    ${baseStyles}
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? 'w-full' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
    ${isLoading ? 'cursor-wait' : ''}
  `.trim();

  const MotionComponent = motion.button;
  const animationProps = isAnimated ? {
    whilehover: expandOnHover ? { 
      scale: 1.05,
      transition: { duration: 0.2 }
    } : {
      scale: 1.02
    },
    whiletap: { scale: 0.98 },
    transition: { duration: 0.2 }
  } : {};

  const tooltipPositions = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  const RippleButton = ({ children, ...props }) => {
    const [ripples, setRipples] = useState([]);

    const addRipple = (e) => {
      const rect = e.target.getBoundingClientRect();
      const ripple = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        id: Date.now()
      };
      setRipples([...ripples, ripple]);
    };

    return (
      <button 
        onClick={addRipple}
        className="relative overflow-hidden"
        {...props}
      >
        {children}
        {ripples.map(ripple => (
          <span 
            key={ripple.id}
            className="absolute animate-ripple bg-white/20 rounded-full"
            style={{
              left: ripple.x,
              top: ripple.y
            }}
          />
        ))}
      </button>
    );
  };

  if (href) {
    return (
      <Link to={href} className={fullWidth ? 'w-full block' : 'inline-block'}>
        <div className="relative group">
          <RippleButton
            className={`flex items-center gap-2 ${buttonClasses}`}
            {...animationProps}
            {...props}
          >
            {leftIcon && <span className={iconSize}>{leftIcon}</span>}
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  {/* Spinner SVG */}
                </svg>
                {loadingText}
              </div>
            ) : children}
            {rightIcon && <span className={iconSize}>{rightIcon}</span>}
            {badge && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {badge}
              </span>
            )}
          </RippleButton>
          {tooltip && (
            <div className={`absolute ${tooltipPositions[tooltipPosition]} hidden group-hover:block`}>
              <div className="bg-gray-900 text-white text-sm rounded px-2 py-1">
                {tooltip}
              </div>
            </div>
          )}
        </div>
      </Link>
    );
  }

  return (
    <div className="relative group">
      <RippleButton
        type={type}
        className={`flex items-center gap-2 ${buttonClasses}`}
        onClick={onClick}
        disabled={isLoading || disabled}
        {...animationProps}
        {...props}
      >
        {leftIcon && <span className={iconSize}>{leftIcon}</span>}
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              {/* Spinner SVG */}
            </svg>
            {loadingText}
          </div>
        ) : children}
        {rightIcon && <span className={iconSize}>{rightIcon}</span>}
        {badge && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
            {badge}
          </span>
        )}
      </RippleButton>
      {tooltip && (
        <div className={`absolute ${tooltipPositions[tooltipPosition]} hidden group-hover:block`}>
          <div className="bg-gray-900 text-white text-sm rounded px-2 py-1">
            {tooltip}
          </div>
        </div>
      )}
    </div>
  );
} 