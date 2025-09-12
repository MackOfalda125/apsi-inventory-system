import React, { useMemo, useState, useEffect } from 'react';
import Layout from '../../components/layout/layout';
import { invoicesAPI, ordersAPI } from '../../services/api';
import './invoices.css';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [editingInvoice, setEditingInvoice] = useState(null);
  const [editForm, setEditForm] = useState({
    order_id: '',
    total_amount: '',
    status: 'unpaid',
    issued_at: '',
    paid_at: ''
  });
  const [deletingInvoice, setDeletingInvoice] = useState(null);
  const [addingInvoice, setAddingInvoice] = useState(false);
  const [addForm, setAddForm] = useState({
    order_id: '',
    total_amount: '',
    status: 'unpaid',
    issued_at: '',
    paid_at: ''
  });

  // Fetch invoices on component mount
  useEffect(() => {
    invoicesAPI.fetchInvoices(setLoading, setError, setInvoices);
  }, []);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const formatDateTime = (isoString) => {
    if (!isoString) return '-';
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleString();
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

  const filteredAndSorted = useMemo(() => {
    let list = invoices;

    const term = searchTerm.trim().toLowerCase();
    if (term) {
      list = list.filter((inv) =>
        String(inv.id || '').includes(term) ||
        String(inv.order_id || '').includes(term) ||
        String(inv.total_amount || 0).includes(term) ||
        String(inv.status || '').toLowerCase().includes(term) ||
        String(inv.customer_name || '').toLowerCase().includes(term) ||       
        formatDateTime(inv.issued_at).toLowerCase().includes(term) ||
        formatDateTime(inv.paid_at).toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      list = list.filter((inv) => inv.status === statusFilter);
    }

    if (sortConfig.key) {
      const { key, direction } = sortConfig;
      list = [...list].sort((a, b) => {
        let aVal = a[key];
        let bVal = b[key];

        if (key === 'customer_name') {
          aVal = a.customer_name;
          bVal = b.customer_name;
        }

        if (key === 'issued_at' || key === 'paid_at') {
          aVal = aVal ? new Date(aVal).getTime() : 0;
          bVal = bVal ? new Date(bVal).getTime() : 0;
        }

        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = (bVal ?? '').toLowerCase();
        }

        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [invoices, orders, searchTerm, statusFilter, sortConfig]);

  const toDatetimeLocalValue = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const fromDatetimeLocalToISO = (value) => {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
  };

  const handleEditClick = (inv) => {
    setEditingInvoice(inv);
    setEditForm({
      order_id: inv.order_id.toString(),
      total_amount: inv.total_amount.toString(),
      status: inv.status,
      issued_at: toDatetimeLocalValue(inv.issued_at),
      paid_at: toDatetimeLocalValue(inv.paid_at)
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    if (!editingInvoice) return;
    
    const invoiceData = {
      order_id: parseInt(editForm.order_id || '0', 10),
      total_amount: parseFloat(editForm.total_amount || '0'),
      status: editForm.status,
      issued_at: fromDatetimeLocalToISO(editForm.issued_at),
      paid_at: editForm.status === 'paid' ? fromDatetimeLocalToISO(editForm.paid_at) : null,
    };

    const result = await invoicesAPI.updateInvoiceWithState(
      editingInvoice.id,
      invoiceData,
      setInvoices,
      setEditingInvoice,
      setEditForm
    );

    if (!result.success) {
      alert(`Error updating invoice: ${result.error}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingInvoice(null);
    setEditForm({ order_id: '', total_amount: '', status: 'unpaid', issued_at: '', paid_at: '' });
  };

  const handleDeleteClick = (inv) => {
    setDeletingInvoice(inv);
  };

  const handleConfirmDelete = async () => {
    if (!deletingInvoice) return;
    
    const result = await invoicesAPI.deleteInvoiceWithState(
      deletingInvoice.id,
      setInvoices,
      setDeletingInvoice
    );

    if (!result.success) {
      alert(`Error deleting invoice: ${result.error}`);
    }
  };

  const handleCancelDelete = () => setDeletingInvoice(null);

  const handleAddClick = () => {
    setAddingInvoice(true);
    setAddForm({ order_id: '', total_amount: '', status: 'unpaid', issued_at: '', paid_at: '' });
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveAdd = async () => {
    if (!addForm.order_id || !addForm.total_amount || !addForm.issued_at) return;
    
    const invoiceData = {
      order_id: parseInt(addForm.order_id || '0', 10),
      total_amount: parseFloat(addForm.total_amount || '0'),
      status: addForm.status,
      issued_at: fromDatetimeLocalToISO(addForm.issued_at),
      paid_at: addForm.status === 'paid' ? fromDatetimeLocalToISO(addForm.paid_at) : null,
    };

    const result = await invoicesAPI.createInvoiceWithState(
      invoiceData,
      setInvoices,
      setAddingInvoice,
      setAddForm
    );

    if (!result.success) {
      alert(`Error creating invoice: ${result.error}`);
    }
  };

  const handleCancelAdd = () => {
    setAddingInvoice(false);
    setAddForm({ order_id: '', total_amount: '', status: 'unpaid', issued_at: '', paid_at: '' });
  };

  return (
    <Layout currentScreen="Invoices">
      <div className="items-main">
        <div className="items-header">
          <div className="header-content">
            <div className="header-text">
              <h2>Invoices</h2>
              <p>View and manage invoice records</p>
            </div>
            <div className="search-container">
              <div className="search-input-wrapper">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="search-icon">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search invoices..."
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
              Add Invoice
            </button>
          </div>
        </div>

        <div className="items-table-container">
          <table className="items-table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => handleSort('id')}>
                  Invoice ID {getSortIcon('id')}
                </th>
                <th className="sortable" onClick={() => handleSort('order_id')}>
                  Order ID {getSortIcon('order_id')}
                </th>
                <th className="sortable" onClick={() => handleSort('customer_name')}>
                  Customer {getSortIcon('customer_name')}
                </th>
                <th className="sortable" onClick={() => handleSort('total_amount')}>
                  Total Amount {getSortIcon('total_amount')}
                </th>
                <th className="category-header">
                  <div className="category-header-content">
                    <span className="sortable" onClick={() => handleSort('status')}>
                      Status {getSortIcon('status')}
                    </span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="category-filter-select"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="all">All</option>
                      <option value="paid">Paid</option>
                      <option value="unpaid">Unpaid</option>
                    </select>
                  </div>
                </th>
                <th className="sortable" onClick={() => handleSort('issued_at')}>
                  Issued At {getSortIcon('issued_at')}
                </th>
                <th className="sortable" onClick={() => handleSort('paid_at')}>
                  Paid At {getSortIcon('paid_at')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.length > 0 ? (
                filteredAndSorted.map((inv) => (
                  <tr key={inv.id}>
                    <td>{inv.id}</td>
                    <td>{inv.order_id}</td>
                    <td>{inv.customer_name || '—'}</td>
                    <td>${inv.total_amount.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge ${inv.status === 'paid' ? 'status-paid' : 'status-unpaid'}`}>
                        {inv.status === 'paid' ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td>{formatDateTime(inv.issued_at)}</td>
                    <td>{formatDateTime(inv.paid_at)}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="edit-btn"
                          onClick={() => handleEditClick(inv)}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteClick(inv)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="no-results-row">
                  <td colSpan="6" className="no-results">
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
        </div>

        {editingInvoice && (
          <div className="edit-modal-overlay" onClick={handleCancelEdit}>
            <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
              <div className="edit-modal-header">
                <h3>Edit Invoice</h3>
                <button className="close-btn" onClick={handleCancelEdit}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div className="edit-modal-content">
                <div className="form-group">
                  <label htmlFor="edit-order-id">Order ID</label>
                  <input
                    type="number"
                    id="edit-order-id"
                    name="order_id"
                    value={editForm.order_id}
                    onChange={handleEditFormChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-total-amount">Total Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    id="edit-total-amount"
                    name="total_amount"
                    value={editForm.total_amount}
                    onChange={handleEditFormChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-status">Status</label>
                  <select
                    id="edit-status"
                    name="status"
                    value={editForm.status}
                    onChange={handleEditFormChange}
                    className="form-input"
                  >
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-issued-at">Issued At</label>
                  <input
                    type="datetime-local"
                    id="edit-issued-at"
                    name="issued_at"
                    value={editForm.issued_at}
                    onChange={handleEditFormChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-paid-at">Paid At</label>
                  <input
                    type="datetime-local"
                    id="edit-paid-at"
                    name="paid_at"
                    value={editForm.paid_at}
                    onChange={handleEditFormChange}
                    className="form-input"
                    disabled={editForm.status !== 'paid'}
                  />
                </div>
              </div>

              <div className="edit-modal-footer">
                <button className="btn btn-secondary" onClick={handleCancelEdit}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSaveEdit}>Save Changes</button>
              </div>
            </div>
          </div>
        )}

        {deletingInvoice && (
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
                    Are you sure you want to delete this invoice? This action cannot be undone.
                  </p>
                </div>

                <div className="item-details">
                  <h4>Invoice Details:</h4>
                  <div className="detail-item"><strong>Invoice ID:</strong> {deletingInvoice.id}</div>
                  <div className="detail-item"><strong>Order ID:</strong> {deletingInvoice.order_id}</div>
                  <div className="detail-item"><strong>Customer:</strong> {deletingInvoice.customer_name || '—'}</div>
                  <div className="detail-item"><strong>Total Amount:</strong> ${deletingInvoice.total_amount.toFixed(2)}</div>
                  <div className="detail-item"><strong>Status:</strong> {deletingInvoice.status}</div>
                </div>
              </div>

              <div className="delete-modal-footer">
                <button className="btn btn-secondary" onClick={handleCancelDelete}>Cancel</button>
                <button className="btn btn-danger" onClick={handleConfirmDelete}>Delete Invoice</button>
              </div>
            </div>
          </div>
        )}

        {addingInvoice && (
          <div className="add-modal-overlay" onClick={handleCancelAdd}>
            <div className="add-modal" onClick={(e) => e.stopPropagation()}>
              <div className="add-modal-header">
                <h3>Add New Invoice</h3>
                <button className="close-btn" onClick={handleCancelAdd}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div className="add-modal-content">
                <div className="form-group">
                  <label htmlFor="add-order-id">Order ID *</label>
                  <input
                    type="number"
                    id="add-order-id"
                    name="order_id"
                    value={addForm.order_id}
                    onChange={handleAddFormChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="add-total-amount">Total Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    id="add-total-amount"
                    name="total_amount"
                    value={addForm.total_amount}
                    onChange={handleAddFormChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="add-status">Status *</label>
                  <select
                    id="add-status"
                    name="status"
                    value={addForm.status}
                    onChange={handleAddFormChange}
                    className="form-input"
                    required
                  >
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="add-issued-at">Issued At *</label>
                  <input
                    type="datetime-local"
                    id="add-issued-at"
                    name="issued_at"
                    value={addForm.issued_at}
                    onChange={handleAddFormChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="add-paid-at">Paid At</label>
                  <input
                    type="datetime-local"
                    id="add-paid-at"
                    name="paid_at"
                    value={addForm.paid_at}
                    onChange={handleAddFormChange}
                    className="form-input"
                    disabled={addForm.status !== 'paid'}
                  />
                </div>
              </div>

              <div className="add-modal-footer">
                <button className="btn btn-secondary" onClick={handleCancelAdd}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSaveAdd}>Add Invoice</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Invoices;


