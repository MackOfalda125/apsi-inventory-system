import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:4000/api', // Backend runs on port 4000
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common error cases
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Customer API functions
export const customerAPI = {
  // Fetch customers with state management
  fetchCustomers: async (setLoading, setError, setCustomers) => {
    try {
      console.log('Starting to fetch customers...');
      setLoading(true);
      setError(null);
      const response = await api.get('/customers');
      console.log('Customers fetched successfully:', response.data);
      setCustomers(response.data.customers || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  },

  // Create customer with state management
  createCustomerWithState: async (customerData, setCustomers, setAddingCustomer, setAddForm) => {
    try {
      const response = await api.post('/customers', customerData);
      setCustomers(prev => [...prev, response.data.customer]);
      setAddingCustomer(false);
      setAddForm({ name: '', email: '', phone: '', address: '' });
      return { success: true };
    } catch (err) {
      console.error('Error creating customer:', err);
      return { success: false, error: err.response?.data?.message || err.message || 'Failed to create customer' };
    }
  },

  // Update customer with state management
  updateCustomerWithState: async (id, customerData, setCustomers, setEditingCustomer, setEditForm) => {
    try {
      const response = await api.put(`/customers/${id}`, customerData);
      setCustomers(prev => prev.map(customer => 
        customer.id === id ? response.data.customer : customer
      ));
      setEditingCustomer(null);
      setEditForm({ name: '', email: '', phone: '', address: '' });
      return { success: true };
    } catch (err) {
      console.error('Error updating customer:', err);
      return { success: false, error: err.response?.data?.message || err.message || 'Failed to update customer' };
    }
  },

  // Delete customer with state management
  deleteCustomerWithState: async (id, setCustomers, setDeletingCustomer) => {
    try {
      await api.delete(`/customers/${id}`);
      setCustomers(prev => prev.filter(customer => customer.id !== id));
      setDeletingCustomer(null);
      return { success: true };
    } catch (err) {
      console.error('Error deleting customer:', err);
      return { success: false, error: err.response?.data?.message || err.message || 'Failed to delete customer' };
    }
  }
};

// Items API functions
export const itemsAPI = {
  // Fetch items with state management
  fetchItems: async (setLoading, setError, setItems) => {
    try {
      console.log('Starting to fetch items...');
      setLoading(true);
      setError(null);
      const response = await api.get('/items');
      console.log('Items fetched successfully:', response.data);
      console.log('First item structure:', response.data.items?.[0]);
      setItems(response.data.items || []);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  },

  // Create item with state management
  createItemWithState: async (itemData, setItems, setAddingItem, setAddForm) => {
    try {
      const response = await api.post('/items', itemData);
      setItems(prev => [...prev, response.data.item]);
      setAddingItem(false);
      setAddForm({ name: '', category: '', price: '', stock: '', distributor_id: '', image_url: '' });
      return { success: true };
    } catch (err) {
      console.error('Error creating item:', err);
      return { success: false, error: err.response?.data?.message || err.message || 'Failed to create item' };
    }
  },

  // Update item with state management
  updateItemWithState: async (id, itemData, setItems, setEditingItem, setEditForm) => {
    try {
      const response = await api.put(`/items/${id}`, itemData);
      setItems(prev => prev.map(item => 
        item.id === id ? response.data.item : item
      ));
      setEditingItem(null);
      setEditForm({ name: '', category: '', price: '', stock: '', distributor_id: '', image_url: '' });
      return { success: true };
    } catch (err) {
      console.error('Error updating item:', err);
      return { success: false, error: err.response?.data?.message || err.message || 'Failed to update item' };
    }
  },

  // Delete item with state management
  deleteItemWithState: async (id, setItems, setDeletingItem) => {
    try {
      await api.delete(`/items/${id}`);
      setItems(prev => prev.filter(item => item.id !== id));
      setDeletingItem(null);
      return { success: true };
    } catch (err) {
      console.error('Error deleting item:', err);
      return { success: false, error: err.response?.data?.message || err.message || 'Failed to delete item' };
    }
  }
};

// Orders API functions
export const ordersAPI = {
  // Fetch orders with state management
  fetchOrders: async (setLoading, setError, setOrders) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/orders');
      setOrders(response.data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  },

  // Create order with state management
  createOrderWithState: async (orderData, setOrders, setAddingOrder, setAddForm) => {
    try {
      const response = await api.post('/orders', orderData);
      setOrders(prev => [...prev, response.data.order]);
      setAddingOrder(false);
      setAddForm({ customer_name: '', staff_id: '', date: '', items: [] });
      return { success: true };
    } catch (err) {
      console.error('Error creating order:', err);
      return { success: false, error: err.response?.data?.message || err.message || 'Failed to create order' };
    }
  },

  // Update order with state management
  updateOrderWithState: async (id, orderData, setOrders, setEditingOrder, setEditForm) => {
    try {
      const response = await api.put(`/orders/${id}`, orderData);
      setOrders(prev => prev.map(order => 
        order.id === id ? response.data.order : order
      ));
      setEditingOrder(null);
      setEditForm({ customer_name: '', staff_id: '', date: '', items: [] });
      return { success: true };
    } catch (err) {
      console.error('Error updating order:', err);
      return { success: false, error: err.response?.data?.message || err.message || 'Failed to update order' };
    }
  },

  // Delete order with state management
  deleteOrderWithState: async (id, setOrders, setDeletingOrder) => {
    try {
      await api.delete(`/orders/${id}`);
      setOrders(prev => prev.filter(order => order.id !== id));
      setDeletingOrder(null);
      return { success: true };
    } catch (err) {
      console.error('Error deleting order:', err);
      return { success: false, error: err.response?.data?.message || err.message || 'Failed to delete order' };
    }
  }
};

// Invoices API functions
export const invoicesAPI = {
  // Fetch invoices with state management
  fetchInvoices: async (setLoading, setError, setInvoices) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/invoices');
      setInvoices(response.data.invoices || []);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  },

  // Create invoice with state management
  createInvoiceWithState: async (invoiceData, setInvoices, setAddingInvoice, setAddForm) => {
    try {
      const response = await api.post('/invoices', invoiceData);
      setInvoices(prev => [...prev, response.data.invoice]);
      setAddingInvoice(false);
      setAddForm({ 
        order_id: '', 
        issue_date: '', 
        due_date: '', 
        amount: '', 
        status: 'pending' 
      });
      return { success: true };
    } catch (err) {
      console.error('Error creating invoice:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || err.message || 'Failed to create invoice' 
      };
    }
  },

  // Update invoice with state management
  updateInvoiceWithState: async (id, invoiceData, setInvoices, setEditingInvoice, setEditForm) => {
    try {
      const response = await api.put(`/invoices/${id}`, invoiceData);
      setInvoices(prev => prev.map(invoice => 
        invoice.id === id ? response.data.invoice : invoice
      ));
      setEditingInvoice(null);
      setEditForm({ 
        order_id: '', 
        issue_date: '', 
        due_date: '', 
        amount: '', 
        status: 'pending' 
      });
      return { success: true };
    } catch (err) {
      console.error('Error updating invoice:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || err.message || 'Failed to update invoice' 
      };
    }
  },

  // Delete invoice with state management
  deleteInvoiceWithState: async (id, setInvoices, setDeletingInvoice) => {
    try {
      await api.delete(`/invoices/${id}`);
      setInvoices(prev => prev.filter(invoice => invoice.id !== id));
      setDeletingInvoice(null);
      return { success: true };
    } catch (err) {
      console.error('Error deleting invoice:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || err.message || 'Failed to delete invoice' 
      };
    }
  }
};

// Authentication API functions
export const authAPI = {
  // Login user
  loginWithState: async (loginData, setLoading, setError, onSuccess) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/login', loginData);
      onSuccess(response.data);
      return { success: true };
    } catch (err) {
      console.error('Error logging in:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to login';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  },

  // Signup user with state management
  signupWithState: async (signupData, setLoading, setError, onSuccess) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/signup', signupData);
      onSuccess(response.data);
      return { success: true };
    } catch (err) {
      console.error('Error signing up:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to signup';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  },
};

// Dashboard API functions
export const dashboardAPI = {
  // Orders per Month
  fetchOrdersPerMonth: async (setLoading, setError, setData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/dashboard/orders');
      setData(response.data.ordersPerMonth || []);
    } catch (err) {
      console.error('Error fetching orders per month:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch orders per month');
    } finally {
      setLoading(false);
    }
  },

  // Revenue Over Time
  fetchRevenueOverTime: async (setLoading, setError, setData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/dashboard/revenue');
      setData(response.data.revenueOverTime || []);
    } catch (err) {
      console.error('Error fetching revenue over time:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch revenue over time');
    } finally {
      setLoading(false);
    }
  },

  // Top-Selling Items
  fetchTopSellingItems: async (setLoading, setError, setData, limit = 5) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/dashboard/top?limit=${limit}`);
      setData(response.data.topSellingItems || []);
    } catch (err) {
      console.error('Error fetching top selling items:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch top selling items');
    } finally {
      setLoading(false);
    }
  },

  // Order Status Breakdown
  fetchOrderStatusBreakdown: async (setLoading, setError, setData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/dashboard/order');
      setData(response.data.orderStatusBreakdown || []);
    } catch (err) {
      console.error('Error fetching order status breakdown:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch order status breakdown');
    } finally {
      setLoading(false);
    }
  },

  // Invoices by Status
  fetchInvoicesByStatus: async (setLoading, setError, setData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/dashboard/invoices');
      setData(response.data.invoicesByStatus || []);
    } catch (err) {
      console.error('Error fetching invoices by status:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch invoices by status');
    } finally {
      setLoading(false);
    }
  },
};


// Health check function
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('Backend server is not responding');
  }
};

export default api;
