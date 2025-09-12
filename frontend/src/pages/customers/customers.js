import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/layout';
import { customerAPI } from '../../services/api';
import './customers.css';

const Customers = () => {
  // Customer data state
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [deletingCustomer, setDeletingCustomer] = useState(null);
  const [addingCustomer, setAddingCustomer] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  // Sorting and search state
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch customers on component mount
  useEffect(() => {
    customerAPI.fetchCustomers(setLoading, setError, setCustomers);
  }, []);


  const handleEditClick = (customer) => {
    setEditingCustomer(customer);
    setEditForm({
      name: String(customer.name || ''),
      email: String(customer.email || ''),
      phone: String(customer.phone || ''),
      address: String(customer.address || '')
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEdit = async () => {
    if (editingCustomer) {
      const result = await customerAPI.updateCustomerWithState(
        editingCustomer.id, 
        editForm, 
        setCustomers, 
        setEditingCustomer, 
        setEditForm
      );
      if (!result.success) {
        alert(`Error updating customer: ${result.error}`);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingCustomer(null);
    setEditForm({ name: '', email: '', phone: '', address: '' });
  };

  const handleDeleteClick = (customer) => {
    setDeletingCustomer(customer);
  };

  const handleConfirmDelete = async () => {
    if (deletingCustomer) {
      const result = await customerAPI.deleteCustomerWithState(
        deletingCustomer.id, 
        setCustomers, 
        setDeletingCustomer
      );
      if (!result.success) {
        alert(`Error deleting customer: ${result.error}`);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeletingCustomer(null);
  };

  const handleAddClick = () => {
    setAddingCustomer(true);
    setAddForm({
      name: '',
      email: '',
      phone: '',
      address: ''
    });
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveAdd = async () => {
    if (addForm.name && addForm.email && addForm.phone && addForm.address) {
      const result = await customerAPI.createCustomerWithState(
        addForm, 
        setCustomers, 
        setAddingCustomer, 
        setAddForm
      );
      if (!result.success) {
        alert(`Error creating customer: ${result.error}`);
      }
    }
  };

  const handleCancelAdd = () => {
    setAddingCustomer(false);
    setAddForm({ name: '', email: '', phone: '', address: '' });
  };

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Handle search
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Sort and filter customers
  const getSortedAndFilteredCustomers = () => {
    let filteredCustomers = customers;
    
    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filteredCustomers = customers.filter(customer => 
        String(customer.id || '').includes(searchLower) ||
        String(customer.name || '').toLowerCase().includes(searchLower) ||
        String(customer.email || '').toLowerCase().includes(searchLower) ||
        String(customer.phone || '').toLowerCase().includes(searchLower) ||
        String(customer.address || '').toLowerCase().includes(searchLower)
      );
    }

    // Sort customers
    if (sortConfig.key) {
      filteredCustomers.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle date sorting
        if (sortConfig.key === 'created_at') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        } else if (typeof aValue === 'string') {
          aValue = String(aValue || '').toLowerCase();
          bValue = String(bValue || '').toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredCustomers;
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sort-icon">
          <path d="M8 9l4-4 4 4M8 15l4 4 4-4"/>
        </svg>
      );
    }
    return sortConfig.direction === 'asc' ? (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sort-icon sort-asc">
        <path d="M8 9l4-4 4 4"/>
      </svg>
    ) : (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sort-icon sort-desc">
        <path d="M8 15l4 4 4-4"/>
      </svg>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  return (
    <Layout 
      currentScreen="Customers"
    >
      <div className="customers-main">
        <div className="customers-header">
          <div className="header-content">
            <div className="header-text">
              <h2>Customer Management</h2>
              <p>Manage your customer records and information</p>
            </div>
            <div className="search-container">
              <div className="search-input-wrapper">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="search-icon">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="search-input"
                />
              </div>
            </div>
            <button 
              className="add-customer-btn"
              onClick={handleAddClick}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="add-icon">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Customer
            </button>
          </div>
        </div>

        <div className="customers-table-container">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading customers...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <div className="error-content">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="error-icon">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                <p className="error-message">{error}</p>
                <button className="retry-btn" onClick={() => customerAPI.fetchCustomers(setLoading, setError, setCustomers)}>
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <table className="customers-table">
              <thead>
                <tr>
                  <th 
                    className="sortable" 
                    onClick={() => handleSort('id')}
                  >
                    Customer ID {getSortIcon('id')}
                  </th>
                  <th 
                    className="sortable" 
                    onClick={() => handleSort('name')}
                  >
                    Name {getSortIcon('name')}
                  </th>
                  <th 
                    className="sortable" 
                    onClick={() => handleSort('email')}
                  >
                    Email {getSortIcon('email')}
                  </th>
                  <th>Phone</th>
                  <th 
                    className="sortable" 
                    onClick={() => handleSort('address')}
                  >
                    Address {getSortIcon('address')}
                  </th>
                  <th 
                    className="sortable" 
                    onClick={() => handleSort('created_at')}
                  >
                    Created At {getSortIcon('created_at')}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getSortedAndFilteredCustomers().length > 0 ? (
                  getSortedAndFilteredCustomers().map(customer => (
                    <tr key={customer.id}>
                      <td>{customer.id}</td>
                      <td>{customer.name}</td>
                      <td>{customer.email}</td>
                      <td>{customer.phone}</td>
                      <td>{customer.address}</td>
                      <td>{formatDate(customer.created_at)}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="edit-btn"
                            onClick={() => handleEditClick(customer)}
                          >
                            Edit
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteClick(customer)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="no-results-row">
                    <td colSpan="7" className="no-results">
                      <div className="no-results-content">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="no-results-icon">
                          <circle cx="11" cy="11" r="8"/>
                          <path d="m21 21-4.35-4.35"/>
                          <line x1="11" y1="8" x2="11" y2="14"/>
                          <line x1="8" y1="11" x2="14" y2="11"/>
                        </svg>
                        <p>No results found</p>
                        <span>Try adjusting your search terms</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Edit Modal */}
        {editingCustomer && (
          <div className="edit-modal-overlay" onClick={handleCancelEdit}>
            <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
              <div className="edit-modal-header">
                <h3>Edit Customer</h3>
                <button className="close-btn" onClick={handleCancelEdit}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              
              <div className="edit-modal-content">
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditFormChange}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditFormChange}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditFormChange}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <textarea
                    id="address"
                    name="address"
                    value={editForm.address}
                    onChange={handleEditFormChange}
                    className="form-textarea"
                    rows="3"
                  />
                </div>
              </div>
              
              <div className="edit-modal-footer">
                <button className="btn btn-secondary" onClick={handleCancelEdit}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSaveEdit}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingCustomer && (
          <div className="delete-modal-overlay" onClick={handleCancelDelete}>
            <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
              <div className="delete-modal-header">
                <h3>Confirm Deletion</h3>
                <button className="close-btn" onClick={handleCancelDelete}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              
              <div className="delete-modal-content">
                <div className="delete-warning">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="warning-icon">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <p className="delete-message">
                    Are you sure you want to delete this customer? This action cannot be undone.
                  </p>
                </div>
                
                <div className="customer-details">
                  <h4>Customer Details:</h4>
                  <div className="detail-item">
                    <strong>Name:</strong> {deletingCustomer.name}
                  </div>
                  <div className="detail-item">
                    <strong>Email:</strong> {deletingCustomer.email}
                  </div>
                  <div className="detail-item">
                    <strong>Phone:</strong> {deletingCustomer.phone}
                  </div>
                  <div className="detail-item">
                    <strong>Address:</strong> {deletingCustomer.address}
                  </div>
                  <div className="detail-item">
                    <strong>Customer ID:</strong> {deletingCustomer.id}
                  </div>
                </div>
              </div>
              
              <div className="delete-modal-footer">
                <button className="btn btn-secondary" onClick={handleCancelDelete}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleConfirmDelete}>
                  Delete Customer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Customer Modal */}
        {addingCustomer && (
          <div className="add-modal-overlay" onClick={handleCancelAdd}>
            <div className="add-modal" onClick={(e) => e.stopPropagation()}>
              <div className="add-modal-header">
                <h3>Add New Customer</h3>
                <button className="close-btn" onClick={handleCancelAdd}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              
              <div className="add-modal-content">
                <div className="form-group">
                  <label htmlFor="add-name">Name *</label>
                  <input
                    type="text"
                    id="add-name"
                    name="name"
                    value={addForm.name}
                    onChange={handleAddFormChange}
                    className="form-input"
                    placeholder="Enter customer name"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="add-email">Email *</label>
                  <input
                    type="email"
                    id="add-email"
                    name="email"
                    value={addForm.email}
                    onChange={handleAddFormChange}
                    className="form-input"
                    placeholder="Enter customer email"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="add-phone">Phone *</label>
                  <input
                    type="tel"
                    id="add-phone"
                    name="phone"
                    value={addForm.phone}
                    onChange={handleAddFormChange}
                    className="form-input"
                    placeholder="Enter customer phone"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="add-address">Address *</label>
                  <textarea
                    id="add-address"
                    name="address"
                    value={addForm.address}
                    onChange={handleAddFormChange}
                    className="form-textarea"
                    rows="3"
                    placeholder="Enter customer address"
                    required
                  />
                </div>
              </div>
              
              <div className="add-modal-footer">
                <button className="btn btn-secondary" onClick={handleCancelAdd}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSaveAdd}>
                  Add Customer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Customers;
