import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, addDoc, updateDoc, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { ClipboardList, TrendingUp, Package, AlertTriangle, ShoppingCart, Plus, Edit, Trash2, Save, X, Database } from 'lucide-react';

const CATEGORIES = ['Shirts', 'T-shirt', 'Shoes', 'Streetwear', 'Others'];

const INITIAL_PRODUCTS = [
  { name: 'Urban Nomad Jacket', price: 2199, oldPrice: 3299, image: 'https://i.ibb.co/q3X0sd1B/b1262377b8a74d68b0d55d0f17731a84.jpg', category: 'Streetwear', stock: 50 },
  { name: 'Elite Tech Parka', price: 3500, oldPrice: 5000, image: 'https://i.ibb.co/1JXYsFJk/e4e7f8fe5c59a81370a99e2984ed7d82.jpg', category: 'Streetwear', stock: 30 },
  { name: 'Midnight Cargo Set', price: 2999, oldPrice: 4999, image: 'https://i.ibb.co/yBythQ6g/8389d5beef63208c6ef95c6c8121f44b.jpg', category: 'Streetwear', stock: 25 },
  { name: 'Cyberpunk Windbreaker', price: 2999, oldPrice: 4999, image: 'https://i.ibb.co/G43MpGLg/234d1243be19c784d03ccee018a2918f.jpg', category: 'Streetwear', stock: 40 },
  { name: 'Stealth Bomber Jacket', price: 3500, oldPrice: 5000, image: 'https://i.ibb.co/XZLtCM8V/2832c1f23c078490d5d1e879c00eb672.jpg', category: 'Streetwear', stock: 15 },
  { name: 'Urban Street High-Tops', price: 1200, oldPrice: 1899, image: 'https://i.ibb.co/KcJn6xKK/08b7fa4b886929669fd677d82993e1f0.jpg', category: 'Shoes', stock: 60 },
  { name: 'Letter Tape Skate Shoes', price: 1200, oldPrice: 1899, image: 'https://i.ibb.co/gbdLvv7W/Letter-Tape-Decor-High-Top-Skate-Shoes-High-Top-Flat-Sneakers-For-Women-Casual-Athletic-Shoes-In-B.jpg', category: 'Shoes', stock: 45 },
  { name: 'Casual Lace-Up High-Tops', price: 1200, oldPrice: 1899, image: 'https://i.ibb.co/jNPsqQJ/Men-s-Casual-High-Top-Lace-Up-Sneakers.jpg', category: 'Shoes', stock: 35 },
  { name: 'White & Orange Kids Sneakers', price: 1200, oldPrice: 1899, image: 'https://i.ibb.co/9kt6xP7N/Stylish-White-and-Orange-Sneakers-for-Kids.jpg', category: 'Shoes', stock: 20 },
  { name: 'Vibrant Urban Sneakers', price: 1200, oldPrice: 1899, image: 'https://i.ibb.co/3y6RGghM/872fa76ba29aaf15bf71f3bee4c97251.jpg', category: 'Shoes', stock: 55 },
  { name: 'Colorblock Chunky Sneakers', price: 1200, oldPrice: 1899, image: 'https://i.ibb.co/nMMgsnqb/Men-Colorblock-Letter-Graphic-Chunky-Sneakers2.jpg', category: 'Shoes', stock: 10 },
  { name: 'Breathable Mesh Sports Shoes', price: 1200, oldPrice: 1899, image: 'https://i.ibb.co/Dgb7jJhG/Spring-Autumn-2024-New-Casual-Sports-Shoes-For-Men-Breathable-Mesh-Sneakers-Trendy-For-Teenagers.jpg', category: 'Shoes', stock: 80 },
  { name: 'Oversized Graphic Tee', price: 2999, oldPrice: 4999, image: 'https://i.ibb.co/vxqdS9vK/653ee1784861e524b476e029a708f1ee.jpg', category: 'T-shirt', stock: 100 },
  { name: 'Urban Street Sneakers', price: 2999, oldPrice: 4999, image: 'https://i.ibb.co/V65dFC8/9a112614b6225b3672649aa3fe8a1c7a.jpg', category: 'Shoes', stock: 12 },
  { name: 'Mini Street Fit', price: 2999, oldPrice: 4999, image: 'https://i.ibb.co/Csvq6st1/d256bd43b89917b4e4e381b4373e06e8.jpg', category: 'Others', stock: 8 },
  { name: 'Vintage Streetwear Set', price: 2999, oldPrice: 4999, image: 'https://i.ibb.co/gFZ6rh4f/Vintage-Streetwear.jpg', category: 'Streetwear', stock: 5 }
];

export default function Inventory() {
  const { isAdmin, user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: 0,
    oldPrice: 0,
    stock: 0,
    category: 'Shirts',
    image: ''
  });

  const [stats, setStats] = useState({
    totalStock: 0,
    lowStock: 0,
    totalSold: 0,
    potentialRevenue: 0
  });

  useEffect(() => {
    fetchInventory();
  }, [user]);

  const fetchInventory = async () => {
    try {
      let q;
      if (isAdmin) {
        q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      } else {
        q = query(collection(db, 'products'), where('supplierId', '==', user?.uid));
      }
      
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      setProducts(data);

      const totalStock = data.reduce((acc, p) => acc + (p.stock || 0), 0);
      const lowStock = data.filter(p => p.stock < 10).length;
      const potentialRevenue = data.reduce((acc, p) => acc + ((p.stock || 0) * (p.price || 0)), 0);

      setStats({
        totalStock,
        lowStock,
        totalSold: 0,
        potentialRevenue
      });
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'products'), {
        ...newProduct,
        supplierId: user?.uid,
        supplierName: user?.displayName || 'Admin',
        status: 'approved',
        createdAt: new Date().toISOString()
      });
      setIsAdding(false);
      setNewProduct({ title: '', description: '', price: 0, oldPrice: 0, stock: 0, category: 'Shirts', image: '' });
      fetchInventory();
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const handleSeedData = async () => {
    setLoading(true);
    try {
      const batch = writeBatch(db);
      INITIAL_PRODUCTS.forEach(p => {
        const docRef = doc(collection(db, 'products'));
        batch.set(docRef, {
          title: p.name,
          description: `High quality ${p.name} from Malabar X collection.`,
          price: p.price,
          oldPrice: p.oldPrice,
          image: p.image,
          category: p.category,
          stock: p.stock,
          supplierId: user?.uid,
          supplierName: user?.displayName || 'Admin',
          status: 'approved',
          createdAt: new Date().toISOString()
        });
      });
      await batch.commit();
      fetchInventory();
    } catch (error) {
      console.error("Error seeding data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (product: any) => {
    setEditingId(product.id);
    setEditForm({ ...product });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    try {
      const { id, ...updateData } = editForm;
      await updateDoc(doc(db, 'products', editingId), updateData);
      setEditingId(null);
      fetchInventory();
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      fetchInventory();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  if (loading) return <div className="p-8 text-slate-400">Loading inventory...</div>;

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Inventory Control</h1>
          <p className="text-slate-500 mt-1">Monitor stock levels and sales performance.</p>
        </div>
        <div className="flex space-x-4">
          {isAdmin && (
            <button
              onClick={handleSeedData}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-all flex items-center"
            >
              <Database className="h-4 w-4 mr-2" />
              Seed Sample Data
            </button>
          )}
          <button
            onClick={() => setIsAdding(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Stock" value={stats.totalStock} icon={<Package className="text-blue-500" />} />
        <StatCard title="Low Stock Items" value={stats.lowStock} icon={<AlertTriangle className="text-amber-500" />} color="amber" />
        <StatCard title="Total Sold" value={stats.totalSold} icon={<ShoppingCart className="text-green-500" />} />
        <StatCard title="Potential Revenue" value={`$${stats.potentialRevenue.toLocaleString()}`} icon={<TrendingUp className="text-purple-500" />} />
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-white">Add New Product</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                  <select
                    className="input-field w-full"
                    value={newProduct.category}
                    onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  className="input-field w-full"
                  value={newProduct.image}
                  onChange={e => setNewProduct({...newProduct, image: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
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
                  <label className="block text-sm font-medium text-slate-400 mb-1">Old Price ($)</label>
                  <input
                    type="number"
                    className="input-field w-full"
                    value={newProduct.oldPrice}
                    onChange={e => setNewProduct({...newProduct, oldPrice: parseFloat(e.target.value)})}
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
                <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                <textarea
                  className="input-field w-full h-24 resize-none"
                  value={newProduct.description}
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-4 mt-8">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
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

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
            <ClipboardList className="h-5 w-5 mr-2 text-blue-500" />
            Stock Status
          </h2>
          <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            {products.length} Products
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded overflow-hidden bg-slate-100 dark:bg-slate-800 mr-3 border border-slate-200 dark:border-slate-700">
                        {product.image ? (
                          <img src={product.image} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <Package className="h-5 w-5 text-slate-400 m-auto" />
                        )}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">{product.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {editingId === product.id ? (
                      <select
                        className="input-field py-1 text-xs"
                        value={editForm.category}
                        onChange={e => setEditForm({...editForm, category: e.target.value})}
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    ) : (
                      <span className="text-sm text-slate-500">{product.category}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === product.id ? (
                      <input
                        type="number"
                        className="input-field w-24 py-1 text-xs"
                        value={editForm.price}
                        onChange={e => setEditForm({...editForm, price: parseFloat(e.target.value)})}
                      />
                    ) : (
                      <span className="font-bold text-blue-500">${product.price}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === product.id ? (
                      <input
                        type="number"
                        className="input-field w-20 py-1 text-xs"
                        value={editForm.stock}
                        onChange={e => setEditForm({...editForm, stock: parseInt(e.target.value)})}
                      />
                    ) : (
                      <div className="flex items-center">
                        <span className={product.stock < 10 ? "text-amber-500 font-bold" : "text-slate-900 dark:text-white"}>
                          {product.stock}
                        </span>
                        {product.stock < 10 && <AlertTriangle className="h-3 w-3 ml-1 text-amber-500" />}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      {editingId === product.id ? (
                        <>
                          <button onClick={handleSaveEdit} className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-all">
                            <Save className="h-4 w-4" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-2 text-slate-500 hover:bg-slate-500/10 rounded-lg transition-all">
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleStartEdit(product)} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color = 'blue' }: any) {
  const colors: any = {
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    green: 'bg-green-500/10 border-green-500/20 text-green-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
  };

  return (
    <div className="glass-panel p-6 rounded-2xl flex items-center justify-between group hover:border-blue-500/50 transition-all">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-xl border ${colors[color]}`}>{icon}</div>
    </div>
  );
}
