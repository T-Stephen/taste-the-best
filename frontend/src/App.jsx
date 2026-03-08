import { useState, useEffect } from 'react'

function App() {
  // ----------------------------------------------------------------
  // STATE MANAGEMENT
  // ----------------------------------------------------------------
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState([])
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Admin State
  const [view, setView] = useState('store') // 'store' or 'admin'
  const [adminOrders, setAdminOrders] = useState([])
  const [loadingAdmin, setLoadingAdmin] = useState(false)

  // NEW: Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Fetch Products on Load
  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setProducts(data.data)
          setLoading(false)
        }
      })
      .catch(err => console.error("Error fetching data:", err))
  }, [])

  // ----------------------------------------------------------------
  // CUSTOMER FUNCTIONS
  // ----------------------------------------------------------------
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const handleCheckout = () => {
    setIsProcessing(true)
    const orderPayload = { items: cart, total_amount: cartTotal, customer_type: "Guest" }

    fetch('http://127.0.0.1:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        alert(`🎉 Order Placed Successfully!\n\nYour Cloud Order ID is:\n${data.order_id}`)
        setCart([])
        setIsCheckoutOpen(false)
      }
    })
    .finally(() => setIsProcessing(false))
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  // NEW: The Filtering Engine!
  const filteredProducts = products.filter(product => {
    // 1. Check if the name matches the search box
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    // 2. Check if the category matches the selected button
    const matchesCategory = selectedCategory === 'All' || product.category.toLowerCase() === selectedCategory.toLowerCase()
    
    return matchesSearch && matchesCategory
  })

  // ----------------------------------------------------------------
  // ADMIN FUNCTIONS
  // ----------------------------------------------------------------
  const toggleView = () => {
    if (view === 'store') {
      setView('admin')
      fetchOrders()
    } else {
      setView('store')
    }
  }

  const fetchOrders = () => {
    setLoadingAdmin(true)
    fetch('http://127.0.0.1:5000/api/admin/orders')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') setAdminOrders(data.data)
      })
      .finally(() => setLoadingAdmin(false))
  }

  const upgradeOrderStatus = (orderId, currentStatus) => {
    const nextStatus = currentStatus === 'Processing' ? 'Shipped' : 'Delivered'
    fetch(`http://127.0.0.1:5000/api/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus })
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') fetchOrders()
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12 relative">
      
      {/* Universal Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-white shadow-md px-4 py-3 sm:px-6 lg:px-8 flex justify-between items-center mb-8">
        <div className="text-xl font-extrabold text-gray-900 flex items-center gap-4">
          <span>Taste the Best <span className="text-red-500">🌶️</span></span>
          <button 
            onClick={toggleView}
            className="text-xs font-bold uppercase tracking-wider bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-gray-700 transition"
          >
            {view === 'store' ? 'Enter Admin Panel' : 'Back to Store'}
          </button>
        </div>

        {view === 'store' && (
          <button onClick={() => setIsCheckoutOpen(true)} className="flex items-center gap-4 bg-orange-100 px-4 py-2 rounded-lg border border-orange-200 hover:bg-orange-200 transition cursor-pointer shadow-sm">
            <span className="font-bold text-orange-800 hidden sm:inline">🛒 Cart: {totalItems}</span>
            <span className="font-bold text-orange-800 sm:hidden">🛒 {totalItems}</span>
            <span className="font-black text-orange-900 bg-white px-2 py-1 rounded">₹{cartTotal}</span>
          </button>
        )}
      </nav>

      {view === 'store' ? (
        
        /* ------------------------- STOREFRONT UI ------------------------- */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* NEW: Search and Filter Control Bar */}
          {!loading && (
            <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              
              {/* Search Box */}
              <div className="relative w-full md:w-96">
                <input 
                  type="text" 
                  placeholder="Search for Pickles, Sweets, Snacks..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition bg-gray-50 focus:bg-white"
                />
                <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
              </div>

              {/* Category Buttons */}
              <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                {['All', 'Pickles', 'Snacks', 'Sweets'].map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all shadow-sm ${
                      selectedCategory === category 
                        ? 'bg-orange-500 text-white ring-2 ring-orange-500 ring-offset-2' 
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Product Grid */}
          {loading ? (
            <p className="text-center text-xl text-gray-600 animate-pulse mt-20">Loading massive menu...</p>
          ) : (
            <>
              {filteredProducts.length === 0 ? (
                <div className="text-center py-20">
                  <span className="text-5xl">🥺</span>
                  <h3 className="text-2xl font-bold text-gray-800 mt-4">No items found</h3>
                  <p className="text-gray-500 mt-2">Try searching for something else!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {/* UPDATED: We now map over 'filteredProducts' instead of all 'products' */}
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                      <img src={product.image_url} alt={product.name} className="w-full h-48 object-cover border-b border-gray-100" />
                      <div className="p-5 flex flex-col flex-grow">
                        <h2 className="text-lg font-bold text-gray-800 leading-tight mb-2">{product.name}</h2>
                        <span className="inline-block px-2 py-1 rounded text-[10px] font-bold bg-green-100 text-green-800 uppercase tracking-wider w-max mb-3">
                          {product.category}
                        </span>
                        <div className="flex items-center justify-between mt-auto pt-4 mb-4">
                          <span className="text-2xl font-black text-gray-900">₹{product.price}</span>
                        </div>
                        <button 
                          onClick={() => addToCart(product)}
                          className="mt-auto w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 shadow-md active:scale-95"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        
      ) : (

        /* ------------------------- ADMIN DASHBOARD UI ------------------------- */
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">Admin Command Center</h1>
            <p className="text-gray-500 mt-2">Manage customer orders from MongoDB Atlas in real-time.</p>
          </div>

          {loadingAdmin ? (
            <p className="text-center text-xl animate-pulse text-gray-500">Loading Cloud Orders...</p>
          ) : (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              {adminOrders.length === 0 ? (
                <p className="p-8 text-center text-gray-500">No orders placed yet.</p>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 block md:table overflow-x-auto">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order Details</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {adminOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-black text-gray-900">ID: {order._id.substring(0, 8)}...</p>
                          <p className="text-xs text-gray-500 mt-1">{new Date(order.created_at).toLocaleString()}</p>
                        </td>
                        <td className="px-6 py-4">
                          <ul className="text-sm text-gray-600">
                            {order.items.map((item, idx) => (
                              <li key={idx} className="mb-1">
                                <span className="font-bold">{item.quantity}x</span> {item.name}
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-lg font-black text-gray-900">₹{order.total_amount}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full 
                            ${order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' : ''}
                            ${order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : ''}
                            ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : ''}
                          `}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {order.status !== 'Delivered' && (
                            <button 
                              onClick={() => upgradeOrderStatus(order._id, order.status)}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm transition active:scale-95"
                            >
                              Mark as {order.status === 'Processing' ? 'Shipped' : 'Delivered'}
                            </button>
                          )}
                          {order.status === 'Delivered' && (
                            <span className="text-green-600 font-bold">Complete ✅</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && view === 'store' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-2xl font-extrabold text-gray-900">Your Order</h2>
              <button onClick={() => setIsCheckoutOpen(false)} className="text-gray-400 hover:text-red-500 font-bold text-xl">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto flex-grow">
              {cart.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Your cart is empty.</p>
              ) : (
                <div className="space-y-4">
                  {cart.map((item, index) => (
                     <div key={index} className="flex justify-between items-center border-b border-gray-50 pb-3">
                      <div>
                        <p className="font-bold text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                      </div>
                      <p className="font-black text-gray-900">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-gray-50 px-6 py-5 border-t border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-bold text-gray-600">Total Amount:</span>
                <span className="text-3xl font-black text-orange-600">₹{cartTotal}</span>
              </div>
              <button 
                onClick={handleCheckout}
                disabled={cart.length === 0 || isProcessing}
                className={`w-full font-bold py-4 px-4 rounded-xl shadow-lg transition-all ${
                  (cart.length === 0 || isProcessing) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white active:scale-95'
                }`}
              >
                {isProcessing ? 'Saving to Cloud...' : 'Confirm & Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App