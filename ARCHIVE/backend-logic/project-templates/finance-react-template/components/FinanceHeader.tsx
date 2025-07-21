import React from 'react';

interface FinanceHeaderProps {
  title?: string;
}

export const FinanceHeader: React.FC<FinanceHeaderProps> = ({ 
  title = 'FinanceHeader for finance' 
}) => {
  return (
    <div className="financeheader-component">
      <h2>{title}</h2>
      <p>This is a finance-specific FinanceHeader component powered by backend logic.</p>
    </div>
  );
};

export default FinanceHeader;
