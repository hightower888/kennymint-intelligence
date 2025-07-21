import React from 'react';

interface HealthCardProps {
  title?: string;
}

export const HealthCard: React.FC<HealthCardProps> = ({ 
  title = 'HealthCard for healthcare' 
}) => {
  return (
    <div className="healthcard-component">
      <h2>{title}</h2>
      <p>This is a healthcare-specific HealthCard component powered by backend logic.</p>
    </div>
  );
};

export default HealthCard;
