import React from 'react';

interface LayoutToggleProps {
  layout: 'clustered' | 'freeform';
  onChange: (layout: 'clustered' | 'freeform') => void;
}

const LayoutToggle: React.FC<LayoutToggleProps> = ({ layout, onChange }) => {
  return (
    <div className="flex items-center space-x-4">
      <label className="text-sm text-slate-300">Layout:</label>
      <select
        value={layout}
        onChange={(e) => onChange(e.target.value as 'clustered' | 'freeform')}
        className="bg-slate-800 text-white px-3 py-2 pr-8 rounded appearance-none min-w-max"
      >
        <option value="clustered">🔗 Clustered</option>
        <option value="freeform">🌌 Freeform</option>
      </select>
    </div>
  );
};

export default LayoutToggle;
