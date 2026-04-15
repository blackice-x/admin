import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Plus, Package, Edit, Trash2, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function SupplierDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    images: []
  });

  useEffect(() => {
    if (user) fetchProducts();
  }, [user]);

  const fetchProducts = async () => {
    try {
      const q = query(collection(db, 'products'), where('supplierId', '==', user?.uid));
      const querySnapshot = await getDocs(q);
      const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addDoc(collection(db, 'products'), {
        ...newProduct,
        supplierId: user.uid,
        supplierName: user.displayName || 'Supplier',
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      setIsAdding(false);
      setNewProduct({ title: '', description: '', price: 0, stock: 0, category: '', images: [] });
      fetchProducts();
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  if (loading) return <div className="p-8 text-slate-400">Loading supplier dashboard...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-[#020617]">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Supplier Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your inventory and track approvals.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Product
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-white">Add New Product</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  className="input-field w-full"
                  value={newProduct.title}
                  onChange={e => setNewProduct({...newProduct, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                <textarea
                  required
                  className="input-field w-full h-32 resize-none"
                  value={newProduct.description}
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Price ($)</label>
                  <input
                    type="number"
                    required
                    className="input-field w-full"
                    value={newProduct.price}
                    onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Stock</label>
                  <input
                    type="number"
                    required
                    className="input-field w-full"
                    value={newProduct.stock}
                    onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                <input
                  type="text"
                  required
                  className="input-field w-full"
                  value={newProduct.category}
                  onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-4 mt-8">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-8"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="glass-panel rounded-xl overflow-hidden group hover:border-blue-500/50 transition-all">
            <div className="h-48 bg-slate-800 flex items-center justify-center border-b border-slate-700">
              <Package className="h-12 w-12 text-slate-600 group-hover:text-blue-500 transition-colors" />
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-white line-clamp-1">{product.title}</h3>
                <StatusBadge status={product.status} />
              </div>
              <p className="text-sm text-slate-500 mb-4 line-clamp-2">{product.description}</p>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xl font-bold text-blue-400">${product.price}</p>
                  <p className="text-[10px] text-slate-600 uppercase font-bold tracking-wider">Stock: {product.stock}</p>
                </div>
                <div className="flex space-x-1">
                  <button className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(product.id)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {products.length === 0 && !loading && (
        <div className="text-center py-20 glass-panel rounded-2xl border-dashed">
          <Package className="h-16 w-16 text-slate-800 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white">No products yet</h3>
          <p className="text-slate-500">Click "Add Product" to start building your inventory.</p>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    approved: 'bg-green-500/10 text-green-500 border-green-500/20',
    rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
  };
  
  const icons: any = {
    pending: <Clock className="h-3 w-3 mr-1" />,
    approved: <CheckCircle className="h-3 w-3 mr-1" />,
    rejected: <XCircle className="h-3 w-3 mr-1" />,
  };

  return (
    <span className={`flex items-center text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${styles[status]}`}>
      {icons[status]}
      {status}
    </span>
  );
}

