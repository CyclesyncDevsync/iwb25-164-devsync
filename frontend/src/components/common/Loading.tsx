import React from 'react';

interface LoadingProps {
  text?: string;
}

export const Loading: React.FC<LoadingProps> = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <div className="relative h-12 w-12">
        <div className="absolute h-12 w-12 rounded-full border-4 border-solid border-gray-200"></div>
        <div className="absolute h-12 w-12 rounded-full border-4 border-solid border-primary border-t-transparent animate-spin"></div>
      </div>
      <p className="text-muted-foreground">{text}</p>
    </div>
  );
};
