import React from 'react';

interface HealthDashboardProps {
  title?: string;
}

export const HealthDashboard: React.FC<HealthDashboardProps> = ({ 
  title = 'HealthDashboard for healthcare' 
}) => {
  return (
    <div className="healthdashboard-component">
      <h2>{title}</h2>
      <p>This is a healthcare-specific HealthDashboard component powered by backend logic.</p>
    </div>
  );
};

export default HealthDashboard;
