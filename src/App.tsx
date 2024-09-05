import React from 'react';
import ProductTable from './components/ProductTable';

const App: React.FC = () => {
  return (
    <div className="container">
      <h1 className="text-2xl font-bold mb-4">Product Table</h1>
      <ProductTable />
    </div>
  );
};

export default App;
