import React from 'react';
import { StatItemProps } from '../types';

const StatItem: React.FC<StatItemProps> = ({ label, value }) => {
  return (
    <div className="flex gap-4 justify-between px-2 py-1.5 text-xs font-mono">
      <div className="text-[#f4f1fe]/60">{label}</div>
      <div className="font-bold text-[#5ce68a]">{value}</div>
    </div>
  );
};

export default StatItem;