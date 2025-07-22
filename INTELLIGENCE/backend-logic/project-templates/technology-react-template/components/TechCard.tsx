import React from 'react';

interface TechCardProps {
  title?: string;
}

export const TechCard: React.FC<TechCardProps> = ({ 
  title = 'TechCard for technology' 
}) => {
  return (
    <div className="techcard-component">
      <h2>{title}</h2>
      <p>This is a technology-specific TechCard component powered by backend logic.</p>
    </div>
  );
};

export default TechCard;
