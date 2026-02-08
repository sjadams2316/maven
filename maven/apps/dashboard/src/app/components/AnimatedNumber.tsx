'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  formatFn?: (value: number) => string;
}

export default function AnimatedNumber({
  value,
  duration = 1000,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
  formatFn,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);
  const animationRef = useRef<number>();
  
  useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out-expo)
      const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      const currentValue = startValue + (endValue - startValue) * easeOutExpo;
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        previousValue.current = endValue;
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);
  
  const formattedValue = formatFn 
    ? formatFn(displayValue)
    : displayValue.toLocaleString(undefined, { 
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
  
  return (
    <span className={className}>
      {prefix}{formattedValue}{suffix}
    </span>
  );
}

// Specialized component for currency
export function AnimatedCurrency({
  value,
  duration = 1000,
  className = '',
  showCents = false,
}: {
  value: number;
  duration?: number;
  className?: string;
  showCents?: boolean;
}) {
  const formatCurrency = (val: number) => {
    if (val >= 1000000) {
      return `$${(val / 1000000).toFixed(2)}M`;
    }
    if (val >= 1000 && !showCents) {
      return `$${Math.round(val).toLocaleString()}`;
    }
    return `$${val.toLocaleString(undefined, { 
      minimumFractionDigits: showCents ? 2 : 0,
      maximumFractionDigits: showCents ? 2 : 0,
    })}`;
  };
  
  return (
    <AnimatedNumber
      value={value}
      duration={duration}
      className={className}
      formatFn={formatCurrency}
    />
  );
}

// Specialized component for percentage
export function AnimatedPercent({
  value,
  duration = 800,
  className = '',
  showSign = true,
}: {
  value: number;
  duration?: number;
  className?: string;
  showSign?: boolean;
}) {
  return (
    <AnimatedNumber
      value={value}
      duration={duration}
      decimals={2}
      prefix={showSign && value >= 0 ? '+' : ''}
      suffix="%"
      className={className}
    />
  );
}
