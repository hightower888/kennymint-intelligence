import React from 'react';

interface SampleComponentProps {
  title?: string;
}

export const SampleComponent: React.FC<SampleComponentProps> = ({ title = 'Sample Component' }) => {
  return (
    <div className="sample-component">
      <h2>{title}</h2>
      <p>This is a sample React component powered by backend logic.</p>
    </div>
  );
};

export default SampleComponent;
