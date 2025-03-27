import React from 'react';

const CategoryLabelsHeader: React.FC = () => {
  return (
    <div className="flex justify-around text-center px-12 pt-4 pb-2 text-slate-400 text-sm font-medium tracking-wide">
      <div className="flex-1">🔵 Sensors</div>
      <div className="flex-1">🟣 Systems</div>
      <div className="flex-1">🟡 Events</div>
    </div>
  );
};

export default CategoryLabelsHeader;
