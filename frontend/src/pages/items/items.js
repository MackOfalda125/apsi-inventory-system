import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/layout';
import { itemsAPI } from '../../services/api';
import './items.css';

const Items = () => {
  // Item data state
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    distributor_id: '',
    image_url: ''
  });
  const [deletingItem, setDeletingItem] = useState(null);
  const [addingItem, setAddingItem] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    distributor_id: '',
    image_url: ''
  });

  // Sorting and search state
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch items on component mount
  useEffect(() => {
    itemsAPI.fetchItems(setLoading, setError, setItems);
  }, []);

  // Get unique categories for filter
  const categories = ['all', ...new Set(items.map(item => item.category))];

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

  // Sort and filter items
  const getSortedAndFilteredItems = () => {
    let filteredItems = items;
    
    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filteredItems = filteredItems.filter(item => 
        String(item.id || '').includes(searchLower) ||
        String(item.name || '').toLowerCase().includes(searchLower) ||
        String(item.category || '').toLowerCase().includes(searchLower) ||
        String(item.price || '').includes(searchLower) ||
        String(item.stock || 0).includes(searchLower) ||
        String(item.distributor_id || '').toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by category
    if (filterCategory !== 'all') {
      filteredItems = filteredItems.filter(item => item.category === filterCategory);
    }

    // Sort items
    if (sortConfig.key) {
      filteredItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (typeof aValue === 'string') {
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

    return filteredItems;
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setEditForm({
      name: String(item.name || ''),
      category: String(item.category || ''),
      price: String(item.price || ''),
      stock: String(item.stock || 0),
      distributor_id: String(item.distributor_id || ''),
      image_url: String(item.image_url || '')
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
    if (editingItem) {
      const itemData = {
        ...editForm,
        price: parseFloat(String(editForm.price || 0)),
        stock: parseInt(String(editForm.stock || 0), 10)
      };
      const result = await itemsAPI.updateItemWithState(
        editingItem.id,
        itemData,
        setItems,
        setEditingItem,
        setEditForm
      );
      if (!result.success) {
        alert(`Error updating item: ${result.error}`);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditForm({ name: '', category: '', price: '', stock: '', distributor_id: '', image_url: '' });
  };

  const handleDeleteClick = (item) => {
    setDeletingItem(item);
  };

  const handleConfirmDelete = async () => {
    if (deletingItem) {
      const result = await itemsAPI.deleteItemWithState(
        deletingItem.id,
        setItems,
        setDeletingItem
      );
      if (!result.success) {
        alert(`Error deleting item: ${result.error}`);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeletingItem(null);
  };

  const handleAddClick = () => {
    setAddingItem(true);
    setAddForm({
      name: '',
      category: '',
      price: '',
      distributor_id: '',
      image_url: ''
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
    if (addForm.name && addForm.category && addForm.price && addForm.distributor_id) {
      const itemData = {
        name: String(addForm.name || ''),
        category: String(addForm.category || ''),
        price: parseFloat(String(addForm.price || 0)),
        stock: parseInt(String(addForm.stock || 0), 10),
        distributor_id: String(addForm.distributor_id || ''),
        image_url: String(addForm.image_url || 'https://via.placeholder.com/50x50?text=No+Image')
      };
      const result = await itemsAPI.createItemWithState(
        itemData,
        setItems,
        setAddingItem,
        setAddForm
      );
      if (!result.success) {
        alert(`Error creating item: ${result.error}`);
      }
    }
  };

  const handleCancelAdd = () => {
    setAddingItem(false);
    setAddForm({ name: '', category: '', price: '', stock: '', distributor_id: '', image_url: '' });
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

  return (
    <Layout 
      currentScreen="Items"
    >
      <div className="items-main">
        <div className="items-header">
          <div className="header-content">
            <div className="header-text">
              <h2>Item Management</h2>
              <p>Manage your inventory items and information</p>
            </div>
            <div className="search-container">
              <div className="search-input-wrapper">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="search-icon">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="search-input"
                />
              </div>
            </div>
            <button 
              className="add-item-btn"
              onClick={handleAddClick}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="add-icon">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Item
            </button>
          </div>
        </div>


        <div className="items-table-container">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading items...</p>
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
                <button className="retry-btn" onClick={() => itemsAPI.fetchItems(setLoading, setError, setItems)}>
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <table className="items-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th 
                    className="sortable" 
                    onClick={() => handleSort('id')}
                  >
                    Item ID {getSortIcon('id')}
                  </th>
                  <th 
                    className="sortable" 
                    onClick={() => handleSort('name')}
                  >
                    Name {getSortIcon('name')}
                  </th>
                  <th className="category-header">
                    <div className="category-header-content">
                      <span 
                        className="sortable" 
                        onClick={() => handleSort('category')}
                      >
                        Category {getSortIcon('category')}
                      </span>
                      <select 
                        value={filterCategory} 
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="category-filter-select"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>
                            {category === 'all' ? 'All' : category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </th>
                  <th 
                    className="sortable" 
                    onClick={() => handleSort('stock')}
                  >
                    Stock {getSortIcon('stock')}
                  </th>
                  <th 
                    className="sortable" 
                    onClick={() => handleSort('price')}
                  >
                    Price {getSortIcon('price')}
                  </th>
                  <th>Distributor ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getSortedAndFilteredItems().length > 0 ? (
                  getSortedAndFilteredItems().map(item => (
                    <tr key={item.id}>
                      <td className="item-image-cell">
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          className="item-image"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/50x50?text=No+Image';
                          }}
                        />
                      </td>
                      <td>{item.id}</td>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td>{item.stock ?? 0}</td>
                      <td>${Number(String(item.price || 0)).toFixed(2)}</td>
                      <td>{item.distributor_id}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="edit-btn"
                            onClick={() => handleEditClick(item)}
                          >
                            Edit
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteClick(item)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="no-results-row">
                    <td colSpan="8" className="no-results">
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
        {editingItem && (
          <div className="edit-modal-overlay" onClick={handleCancelEdit}>
            <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
              <div className="edit-modal-header">
                <h3>Edit Item</h3>
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
                  <label htmlFor="category">Category</label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={editForm.category}
                    onChange={handleEditFormChange}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="price">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    id="price"
                    name="price"
                    value={editForm.price}
                    onChange={handleEditFormChange}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="stock">Stock</label>
                  <input
                    type="number"
                    min="0"
                    id="stock"
                    name="stock"
                    value={editForm.stock}
                    onChange={handleEditFormChange}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="distributor_id">Distributor ID</label>
                  <input
                    type="text"
                    id="distributor_id"
                    name="distributor_id"
                    value={editForm.distributor_id}
                    onChange={handleEditFormChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="image_url">Image URL</label>
                  <input
                    type="url"
                    id="image_url"
                    name="image_url"
                    value={editForm.image_url}
                    onChange={handleEditFormChange}
                    className="form-input"
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
        {deletingItem && (
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
                    Are you sure you want to delete this item? This action cannot be undone.
                  </p>
                </div>
                
                <div className="item-details">
                  <h4>Item Details:</h4>
                  <div className="detail-item">
                    <strong>Name:</strong> {deletingItem.name}
                  </div>
                  <div className="detail-item">
                    <strong>Category:</strong> {deletingItem.category}
                  </div>
                  <div className="detail-item">
                    <strong>Price:</strong> ${Number(String(deletingItem.price || 0)).toFixed(2)}
                  </div>
                  <div className="detail-item">
                    <strong>Distributor ID:</strong> {deletingItem.distributor_id}
                  </div>
                  <div className="detail-item">
                    <strong>Item ID:</strong> {deletingItem.id}
                  </div>
                </div>
              </div>
              
              <div className="delete-modal-footer">
                <button className="btn btn-secondary" onClick={handleCancelDelete}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleConfirmDelete}>
                  Delete Item
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Item Modal */}
        {addingItem && (
          <div className="add-modal-overlay" onClick={handleCancelAdd}>
            <div className="add-modal" onClick={(e) => e.stopPropagation()}>
              <div className="add-modal-header">
                <h3>Add New Item</h3>
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
                    placeholder="Enter item name"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="add-category">Category *</label>
                  <input
                    type="text"
                    id="add-category"
                    name="category"
                    value={addForm.category}
                    onChange={handleAddFormChange}
                    className="form-input"
                    placeholder="Enter item category"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="add-price">Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    id="add-price"
                    name="price"
                    value={addForm.price}
                    onChange={handleAddFormChange}
                    className="form-input"
                    placeholder="Enter item price"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="add-distributor_id">Distributor ID *</label>
                  <input
                    type="text"
                    id="add-distributor_id"
                    name="distributor_id"
                    value={addForm.distributor_id}
                    onChange={handleAddFormChange}
                    className="form-input"
                    placeholder="Enter distributor ID"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="add-image_url">Image URL</label>
                  <input
                    type="url"
                    id="add-image_url"
                    name="image_url"
                    value={addForm.image_url}
                    onChange={handleAddFormChange}
                    className="form-input"
                    placeholder="Enter image URL (optional)"
                  />
                </div>
              </div>
              
              <div className="add-modal-footer">
                <button className="btn btn-secondary" onClick={handleCancelAdd}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSaveAdd}>
                  Add Item
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Items;
