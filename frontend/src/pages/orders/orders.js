import React, { useMemo, useState, useEffect } from 'react';
import Layout from '../../components/layout/layout';
import { ordersAPI } from '../../services/api';
import './orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Create Order modal state
  const [addingOrder, setAddingOrder] = useState(false);
  const [orderForm, setOrderForm] = useState({
    customer_name: '',
    staff_id: '',
    status: 'pending'
  });
  const [itemSearchTerm, setItemSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]); // {id, name, price, quantity}

  // Edit/Delete modal state
  const [editingOrder, setEditingOrder] = useState(null);
  const [editForm, setEditForm] = useState({
    customer_name: '',
    date: '',
    status: 'pending',
    staff_id: ''
  });
  const [deletingOrder, setDeletingOrder] = useState(null);
  const [editItems, setEditItems] = useState([]); // items shown inside Edit modal
  const [editItemSearchTerm, setEditItemSearchTerm] = useState('');

  const allStatuses = useMemo(() => ['all', 'pending', 'fulfilled', 'dispatched', 'cancelled'], []);

  // Fetch orders on component mount
  useEffect(() => {
    ordersAPI.fetchOrders(setLoading, setError, setOrders);
  }, []);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
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

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-badge pending';
      case 'fulfilled':
        return 'status-badge fulfilled';
      case 'dispatched':
        return 'status-badge dispatched';
      case 'cancelled':
        return 'status-badge cancelled';
      default:
        return 'status-badge';
    }
  };

  const getSortedAndFilteredOrders = () => {
    let filtered = orders;

    // Search
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter((order) =>
        String(order.id || '').includes(query) ||
        String(order.customer_name || '').toLowerCase().includes(query) ||
        String(order.status || '').toLowerCase().includes(query) ||
        String((order.items || []).reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0)).includes(query) ||
        String(order.staff_id || '').toLowerCase().includes(query) ||
        String(order.date || '').includes(query)
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((order) => order.status === filterStatus);
    }

    // Sorting
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'date') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        } else if (sortConfig.key === 'total_amount') {
          aValue = (a.items || []).reduce((sum, it) => sum + it.price * it.quantity, 0);
          bValue = (b.items || []).reduce((sum, it) => sum + it.price * it.quantity, 0);
        } else if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  };

  const handleAddOrderClick = () => {
    setAddingOrder(true);
    setOrderForm({ customer_name: '', staff_id: '', status: 'pending' });
    setSelectedItems([]);
    setItemSearchTerm('');
  };

  const handleCancelAddOrder = () => {
    setAddingOrder(false);
    setSelectedItems([]);
    setItemSearchTerm('');
  };

  const handleOrderFormChange = (e) => {
    const { name, value } = e.target;
    setOrderForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddItemToOrder = (item) => {
    setSelectedItems((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) => (p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p));
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const handleQuantityChange = (id, qty) => {
    const quantity = Math.max(1, Number.isNaN(Number(qty)) ? 1 : Number(qty));
    setSelectedItems((prev) => prev.map((p) => (p.id === id ? { ...p, quantity } : p)));
  };

  const handleRemoveSelectedItem = (id) => {
    setSelectedItems((prev) => prev.filter((p) => p.id !== id));
  };

  const calculateOrderTotal = () => {
    return selectedItems.reduce((sum, it) => sum + it.price * it.quantity, 0);
  };

  const handleSaveOrder = async () => {
    if (!orderForm.customer_name || !orderForm.staff_id || selectedItems.length === 0) {
      return;
    }

    const orderData = {
      customer_name: orderForm.customer_name,
      staff_id: orderForm.staff_id,
      status: orderForm.status,
      items: selectedItems.map((it) => ({ 
        id: it.id, 
        name: it.name, 
        price: it.price, 
        quantity: it.quantity 
      }))
    };

    const result = await ordersAPI.createOrderWithState(
      orderData,
      setOrders,
      setAddingOrder,
      setOrderForm
    );

    if (!result.success) {
      alert(`Error creating order: ${result.error}`);
    }
  };

  const handleEditClick = (order) => {
    setEditingOrder(order);
    setEditForm({
      customer_name: order.customer_name,
      date: order.date,
      status: order.status,
      staff_id: order.staff_id
    });
    setEditItems(order.items || []);
    setEditItemSearchTerm('');
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    if (!editingOrder) return;
    
    const orderData = {
      ...editForm,
      items: editItems.map((it) => ({ 
        id: it.id, 
        name: it.name, 
        price: it.price, 
        quantity: it.quantity 
      }))
    };

    const result = await ordersAPI.updateOrderWithState(
      editingOrder.id,
      orderData,
      setOrders,
      setEditingOrder,
      setEditForm
    );

    if (!result.success) {
      alert(`Error updating order: ${result.error}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingOrder(null);
  };

  const handleDeleteClick = (order) => {
    setDeletingOrder(order);
  };

  const handleConfirmDelete = async () => {
    if (!deletingOrder) return;
    
    const result = await ordersAPI.deleteOrderWithState(
      deletingOrder.id,
      setOrders,
      setDeletingOrder
    );

    if (!result.success) {
      alert(`Error deleting order: ${result.error}`);
    }
  };

  const handleCancelDelete = () => {
    setDeletingOrder(null);
  };

  // Edit item selector helpers
  const handleAddItemToEdit = (item) => {
    setEditItems((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) => (p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p));
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const handleEditQuantityChange = (id, qty) => {
    const quantity = Math.max(1, Number.isNaN(Number(qty)) ? 1 : Number(qty));
    setEditItems((prev) => prev.map((p) => (p.id === id ? { ...p, quantity } : p)));
  };

  const handleRemoveEditItem = (id) => {
    setEditItems((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <Layout currentScreen="Orders">
      <div className="orders-main">
        <div className="orders-header">
          <div className="header-content">
            <div className="header-text">
              <h2>Orders</h2>
              <p>View and manage customer orders</p>
            </div>

            <div className="header-controls">
              <div className="search-container">
                <div className="search-input-wrapper">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="search-icon">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                  />
                </div>
              </div>

              <button 
                className="add-order-btn"
                onClick={handleAddOrderClick}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="add-icon">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add Order
              </button>
            </div>
          </div>
        </div>

        <div className="orders-table-container">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading orders...</p>
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
                <button className="retry-btn" onClick={() => ordersAPI.fetchOrders(setLoading, setError, setOrders)}>
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <table className="orders-table">
              <thead>
                <tr>
                  <th className="sortable" onClick={() => handleSort('id')}>
                    Order ID {getSortIcon('id')}
                  </th>
                  <th className="sortable" onClick={() => handleSort('customer_name')}>
                    Customer Name {getSortIcon('customer_name')}
                  </th>
                  <th className="sortable" onClick={() => handleSort('date')}>
                    Date {getSortIcon('date')}
                  </th>
                  <th className="status-header">
                    <div className="status-header-content">
                      <span className="sortable" onClick={() => handleSort('status')}>
                        Status {getSortIcon('status')}
                      </span>
                      <select 
                        value={filterStatus} 
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="status-filter-select"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Filter by status"
                      >
                        {allStatuses.map((s) => (
                          <option key={s} value={s}>
                            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </th>
                  <th className="sortable" onClick={() => handleSort('total_amount')}>
                    Total Amount {getSortIcon('total_amount')}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getSortedAndFilteredOrders().length > 0 ? (
                  getSortedAndFilteredOrders().map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.customer_name}</td>
                      <td>{new Date(order.date).toLocaleDateString()}</td>
                      <td>
                        <span className={getStatusBadgeClass(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td>${Number(order.total_amount || 0).toFixed(2)}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="edit-btn"
                            onClick={() => handleEditClick(order)}
                          >
                            Edit
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteClick(order)}
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
                        <span>Try adjusting your search terms or filters</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {addingOrder && (
        <div className="add-order-modal-overlay" onClick={handleCancelAddOrder}>
          <div className="add-order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="add-order-modal-header">
              <h3>Create Order</h3>
              <button className="close-btn" onClick={handleCancelAddOrder}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="add-order-modal-content">
              <div className="order-form-grid">
                <div className="form-group">
                  <label htmlFor="customer_name">Customer Name</label>
                  <input
                    type="text"
                    id="customer_name"
                    name="customer_name"
                    value={orderForm.customer_name}
                    onChange={handleOrderFormChange}
                    className="form-input"
                    placeholder="Enter customer name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={orderForm.status}
                    onChange={handleOrderFormChange}
                    className="form-input"
                  >
                    {allStatuses.filter((s) => s !== 'all').map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="order-preview">
                <h4>Order Items</h4>
                <div className="orders-table-container">
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Subtotal</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedItems.length > 0 ? (
                        selectedItems.map((it) => (
                          <tr key={it.id}>
                            <td>{it.name}</td>
                            <td>${it.price.toFixed(2)}</td>
                            <td>
                              <input 
                                type="number" 
                                min="1"
                                value={it.quantity}
                                onChange={(e) => handleQuantityChange(it.id, e.target.value)}
                                className="quantity-input"
                              />
                            </td>
                            <td>${(it.price * it.quantity).toFixed(2)}</td>
                            <td>
                              <button className="delete-btn btn-small" onClick={() => handleRemoveSelectedItem(it.id)}>Remove</button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="no-results-row">
                          <td colSpan="5" className="no-results">
                            <div className="no-results-content">
                              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="no-results-icon">
                                <circle cx="11" cy="11" r="8"/>
                                <path d="m21 21-4.35-4.35"/>
                                <line x1="11" y1="8" x2="11" y2="14"/>
                                <line x1="8" y1="11" x2="14" y2="11"/>
                              </svg>
                              <p>No items selected</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="order-total">
                  <span>Total:</span>
                  <strong>${calculateOrderTotal().toFixed(2)}</strong>
                </div>
              </div>
            </div>

            <div className="add-order-modal-footer">
              <button className="btn btn-secondary" onClick={handleCancelAddOrder}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveOrder}>Save Order</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {editingOrder && (
        <div className="edit-order-modal-overlay" onClick={handleCancelEdit}>
          <div className="edit-order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h3>Edit Order</h3>
              <button className="close-btn" onClick={handleCancelEdit}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="edit-modal-content">
              <div className="order-form-grid">
                <div className="form-group">
                  <label htmlFor="edit_customer_name">Customer Name</label>
                  <input
                    type="text"
                    id="edit_customer_name"
                    name="customer_name"
                    value={editForm.customer_name}
                    onChange={handleEditFormChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit_date">Date</label>
                  <input
                    type="date"
                    id="edit_date"
                    name="date"
                    value={editForm.date}
                    onChange={handleEditFormChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit_status">Status</label>
                  <select
                    id="edit_status"
                    name="status"
                    value={editForm.status}
                    onChange={handleEditFormChange}
                    className="form-input"
                  >
                    {allStatuses.filter((s) => s !== 'all').map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="order-preview">
                <h4>Order Items</h4>
                <div className="orders-table-container">
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Subtotal</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {editItems.length > 0 ? (
                        editItems.map((it) => (
                          <tr key={it.id}>
                            <td>{it.name}</td>
                            <td>${it.price.toFixed(2)}</td>
                            <td>
                              <input 
                                type="number" 
                                min="1"
                                value={it.quantity}
                                onChange={(e) => handleEditQuantityChange(it.id, e.target.value)}
                                className="quantity-input"
                              />
                            </td>
                            <td>${(it.price * it.quantity).toFixed(2)}</td>
                            <td>
                              <button className="delete-btn btn-small" onClick={() => handleRemoveEditItem(it.id)}>Remove</button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="no-results-row">
                          <td colSpan="5" className="no-results">
                            <div className="no-results-content">
                              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="no-results-icon">
                                <circle cx="11" cy="11" r="8"/>
                                <path d="m21 21-4.35-4.35"/>
                                <line x1="11" y1="8" x2="11" y2="14"/>
                                <line x1="8" y1="11" x2="14" y2="11"/>
                              </svg>
                              <p>No items in order</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="order-total">
                  <span>New Total:</span>
                  <strong>${editItems.reduce((s, it) => s + it.price * it.quantity, 0).toFixed(2)}</strong>
                </div>
              </div>
            </div>
            <div className="edit-modal-footer">
              <button className="btn btn-secondary" onClick={handleCancelEdit}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Order Modal */}
      {deletingOrder && (
        <div className="delete-order-modal-overlay" onClick={handleCancelDelete}>
          <div className="delete-order-modal" onClick={(e) => e.stopPropagation()}>
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
                  Are you sure you want to delete this order? This action cannot be undone.
                </p>
              </div>
              <div className="order-details">
                <h4>Order Details:</h4>
                <div className="detail-item"><strong>Order ID:</strong> {deletingOrder.id}</div>
                <div className="detail-item"><strong>Customer:</strong> {deletingOrder.customer_name}</div>
                <div className="detail-item"><strong>Status:</strong> {deletingOrder.status}</div>
                <div className="detail-item"><strong>Total:</strong> ${Number(deletingOrder.total_amount || 0).toFixed(2)}</div>
              </div>
            </div>
            <div className="delete-modal-footer">
              <button className="btn btn-secondary" onClick={handleCancelDelete}>Cancel</button>
              <button className="btn btn-danger" onClick={handleConfirmDelete}>Delete Order</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Orders;