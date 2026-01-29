import React from 'react';

interface InputGroupProps {
  label: string;
  children: React.ReactNode;
  desc?: string;
}

const InputGroup: React.FC<InputGroupProps> = ({ label, children, desc }) => (
  <div className="space-y-2 mb-6">
    <label className="block text-sm font-medium text-zinc-300">
      {label}
      {desc && <span className="ml-2 text-xs text-zinc-500 font-normal">{desc}</span>}
    </label>
    {children}
  </div>
);

export default InputGroup;