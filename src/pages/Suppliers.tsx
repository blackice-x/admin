import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Truck, Search, Plus, ExternalLink, MapPin, Phone, Star } from 'lucide-react';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contact: '',
    location: '',
    products: '',
    rating: 5,
    source: 'IndiaMART'
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const snap = await getDocs(collection(db, 'suppliers_info'));
      setSuppliers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'suppliers_info'), {
        ...newSupplier,
        products: newSupplier.products.split(',').map(p => p.trim())
      });
      setIsAdding(false);
      setNewSupplier({ name: '', contact: '', location: '', products: '', rating: 5, source: 'IndiaMART' });
      fetchSuppliers();
    } catch (error) {
      console.error("Error adding supplier:", error);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">IndiaMART Suppliers</h1>
          <p className="text-slate-500 mt-1">Manage and source from verified IndiaMART suppliers.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Supplier
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Add IndiaMART Supplier</h2>
            <form onSubmit={handleAddSupplier} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  className="input-field w-full"
                  placeholder="e.g. Malabar Textiles"
                  value={newSupplier.name}
                  onChange={e => setNewSupplier({...newSupplier, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Contact Number</label>
                <input
                  type="text"
                  required
                  className="input-field w-full"
                  placeholder="+91 98765 43210"
                  value={newSupplier.contact}
                  onChange={e => setNewSupplier({...newSupplier, contact: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Location</label>
                <input
                  type="text"
                  required
                  className="input-field w-full"
                  placeholder="Surat, Gujarat"
                  value={newSupplier.location}
                  onChange={e => setNewSupplier({...newSupplier, location: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Products (comma separated)</label>
                <textarea
                  required
                  className="input-field w-full min-h-[100px]"
                  placeholder="Cotton Shirts, Denim Jeans, T-shirts..."
                  value={newSupplier.products}
                  onChange={e => setNewSupplier({...newSupplier, products: e.target.value})}
                ></textarea>
              </div>
              <div className="flex justify-end space-x-4 mt-8">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-8"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((supplier) => (
          <div key={supplier.id} className="glass-panel rounded-2xl p-6 group hover:border-blue-500/50 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <Truck className="h-6 w-6 text-blue-500" />
              </div>
              <div className="flex items-center bg-amber-500/10 text-amber-500 px-2 py-1 rounded-lg border border-amber-500/20">
                <Star className="h-3 w-3 mr-1 fill-amber-500" />
                <span className="text-xs font-bold">{supplier.rating}</span>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{supplier.name}</h3>
            
            <div className="space-y-2 mb-6">
              <div className="flex items-center text-sm text-slate-500">
                <MapPin className="h-4 w-4 mr-2" />
                {supplier.location}
              </div>
              <div className="flex items-center text-sm text-slate-500">
                <Phone className="h-4 w-4 mr-2" />
                {supplier.contact}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {supplier.products?.map((product: string, idx: number) => (
                <span key={idx} className="text-[10px] px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md font-medium">
                  {product}
                </span>
              ))}
            </div>

            <a
              href={`https://www.indiamart.com/search.mp?ss=${encodeURIComponent(supplier.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-sm font-bold hover:bg-blue-600 hover:text-white transition-all"
            >
              View on IndiaMART
              <ExternalLink className="h-3 w-3 ml-2" />
            </a>
          </div>
        ))}
      </div>

      {suppliers.length === 0 && !loading && (
        <div className="text-center py-20 glass-panel rounded-2xl border-dashed">
          <Search className="h-16 w-16 text-slate-800 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white">No IndiaMART suppliers found</h3>
          <p className="text-slate-500">Add your first supplier to start tracking sourcing details.</p>
        </div>
      )}
    </div>
  );
}
