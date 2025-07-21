import React from 'react';

interface FinanceCardProps {
  title?: string;
}

export const FinanceCard: React.FC<FinanceCardProps> = ({ 
  title = 'FinanceCard for finance' 
}) => {
  return (
    <div className="financecard-component">
      <h2>{title}</h2>
      <p>This is a finance-specific FinanceCard component powered by backend logic.</p>
    </div>
  );
};

export default FinanceCard;
