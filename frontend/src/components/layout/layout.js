import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../topbar/topbar';
import Sidebar from '../sidebar/sidebar';
import './layout.css';

const Layout = ({ children, currentScreen = "Dashboard" }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    console.log('Logout clicked - closing sidebar and navigating to login');
    // Close sidebar after logout
    setSidebarOpen(false);
    // Navigate to login page
    navigate('/');
    console.log('Navigation to / completed');
  };

  return (
    <div className="layout">
      <Topbar 
        currentScreen={currentScreen} 
        onMenuToggle={handleMenuToggle}
        isMenuOpen={sidebarOpen}
      />
      
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={handleSidebarClose}
        onLogout={handleLogout}
      />
      
      <div className="layout-content">
        {children}
      </div>
    </div>
  );
};

export default Layout;
