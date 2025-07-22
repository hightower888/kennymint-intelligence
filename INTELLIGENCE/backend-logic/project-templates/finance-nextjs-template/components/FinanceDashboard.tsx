import React from 'react';

interface FinanceDashboardProps {
  title?: string;
}

export const FinanceDashboard: React.FC<FinanceDashboardProps> = ({ 
  title = 'FinanceDashboard for finance' 
}) => {
  return (
    <div className="financedashboard-component">
      <h2>{title}</h2>
      <p>This is a finance-specific FinanceDashboard component powered by backend logic.</p>
    </div>
  );
};

export default FinanceDashboard;
