import React, { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  color?: string; // e.g., 'brand-pink', 'bg-yellow-300'
}

const Card: React.FC<CardProps> = ({ children, className = '', color = 'bg-white', ...rest }) => {
  return (
    <div
      {...rest}
      className={`fvd-card border-4 border-black dark:border-gray-700 rounded-xl shadow-hard transition-all hover:shadow-none hover:-translate-x-1 hover:-translate-y-1 ${color} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;