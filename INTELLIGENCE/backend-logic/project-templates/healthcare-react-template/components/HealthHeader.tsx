import React from 'react';

interface HealthHeaderProps {
  title?: string;
}

export const HealthHeader: React.FC<HealthHeaderProps> = ({ 
  title = 'HealthHeader for healthcare' 
}) => {
  return (
    <div className="healthheader-component">
      <h2>{title}</h2>
      <p>This is a healthcare-specific HealthHeader component powered by backend logic.</p>
    </div>
  );
};

export default HealthHeader;
