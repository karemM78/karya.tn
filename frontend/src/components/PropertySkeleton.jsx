import React from 'react';

const PropertySkeleton = () => {
  return (
    <div className="bg-surface rounded-3xl overflow-hidden border border-outline h-full flex flex-col animate-pulse">
      {/* Image Area */}
      <div className="aspect-[4/3] bg-outline-variant/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
      </div>
      
      {/* Content Area */}
      <div className="p-6 space-y-6 flex-1 flex flex-col">
        <div className="space-y-3">
          <div className="flex justify-between items-start gap-4">
            <div className="h-6 bg-outline-variant/50 rounded-xl w-3/4"></div>
            <div className="h-6 bg-outline-variant/50 rounded-full w-10"></div>
          </div>
          <div className="h-4 bg-outline-variant/30 rounded-lg w-1/2"></div>
        </div>

        {/* Stats Row */}
        <div className="flex gap-4">
          <div className="flex-1 h-8 bg-outline-variant/30 rounded-lg"></div>
          <div className="flex-1 h-8 bg-outline-variant/30 rounded-lg"></div>
        </div>

        {/* Action Area */}
        <div className="mt-auto pt-5 border-t border-outline/30 flex items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="h-2 bg-outline-variant/20 rounded w-8"></div>
            <div className="h-8 bg-outline-variant/40 rounded-lg w-20"></div>
          </div>
          <div className="h-12 bg-outline-variant/50 rounded-xl w-28"></div>
        </div>
      </div>
    </div>
  );
};

export default PropertySkeleton;
