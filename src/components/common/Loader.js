// src/components/common/Loader.js
import React from 'react';

const Loader = ({ size = 'md', text = '' }) => {
    const sizeClasses = {
        sm: 'h-6 w-6',
        md: 'h-12 w-12',
        lg: 'h-16 w-16'
    };

    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className={`animate-spin rounded-full border-b-2 border-indigo-600 ${sizeClasses[size]}`}></div>
            {text && <p className="mt-4 text-gray-500 text-sm">{text}</p>}
        </div>
    );
};

export default Loader;
