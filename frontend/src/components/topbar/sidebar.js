import React from 'react';
import { useNavigate } from 'react-router-dom';
import './sidebar.css';

const Sidebar = ({ isOpen, onClose, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log('Sidebar logout button clicked');
    if (onLogout) {
      console.log('Calling onLogout function');
      onLogout();
    } else {
      console.log('No onLogout function provided');
    }
  };

  const handleNavigation = (path) => {
    console.log('Navigating to:', path);
    // Close sidebar first
    if (onClose) {
      onClose();
    }
    // Then navigate
    navigate(path);
  };

  const handleDashboardClick = () => {
    handleNavigation('/dashboard');
  };

  const handleCustomersClick = () => {
    handleNavigation('/customers');
  };

  const handleItemsClick = () => {
    handleNavigation('/items');
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={onClose}
          aria-label="Close sidebar"
        />
      )}
      
      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-content">
          {/* Navigation Section */}
          <div className="sidebar-navigation">
            <div className="sidebar-section">
              <button 
                className="nav-button"
                onClick={handleDashboardClick}
                aria-label="Go to Dashboard"
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  className="nav-icon"
                >
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
                <span className="nav-text">Dashboard</span>
              </button>
            </div>
            
            <div className="sidebar-section">
              <button 
                className="nav-button"
                onClick={handleCustomersClick}
                aria-label="Go to Customers"
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  className="nav-icon"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span className="nav-text">Customers</span>
              </button>
            </div>
            
            <div className="sidebar-section">
              <button 
                className="nav-button"
                onClick={handleItemsClick}
                aria-label="Go to Items"
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  className="nav-icon"
                >
                  <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
                <span className="nav-text">Items</span>
              </button>
            </div>
            
            {/* Future navigation items will go here */}
            <div className="sidebar-section">
              {/* Additional navigation items placeholder */}
            </div>
          </div>
          
          {/* Logout Section - positioned at bottom */}
          <div className="sidebar-logout">
            <div className="sidebar-section">
              <button 
                className="logout-button"
                onClick={handleLogout}
                aria-label="Logout"
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  className="logout-icon"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16,17 21,12 16,7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                <span className="logout-text">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
