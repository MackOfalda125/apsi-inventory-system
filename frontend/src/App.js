import { Routes, Route } from 'react-router-dom';

import Login from './pages/login/login';
import Signup from './pages/signup/signup';
import Dashboard from './pages/dashboard/dashboard';
import Customers from './pages/customers/customers';
import Items from './pages/items/items';
import Orders from './pages/orders/orders';
import Invoices from './pages/invoices/invoices';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/items" element={<Items />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/invoices" element={<Invoices />} />
    </Routes>
  );
}

export default App;
