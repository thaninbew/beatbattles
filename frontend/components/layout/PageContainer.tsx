import React, { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
};

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidth = 'xl',
  className = '',
}) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className={`mx-auto ${maxWidthClasses[maxWidth]} ${className}`}>
        {children}
      </div>
    </div>
  );
};

export default PageContainer; 