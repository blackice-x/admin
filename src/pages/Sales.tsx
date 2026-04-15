import React, { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag, Users, ArrowUpRight, ArrowDownRight, Edit2, Save, X, RefreshCw } from 'lucide-react';

const DEFAULT_SALES_DATA = [
  { name: 'Jan', sales: 4000, revenue: 2400 },
  { name: 'Feb', sales: 3000, revenue: 1398 },
  { name: 'Mar', sales: 2000, revenue: 9800 },
  { name: 'Apr', sales: 2780, revenue: 3908 },
  { name: 'May', sales: 1890, revenue: 4800 },
  { name: 'Jun', sales: 2390, revenue: 3800 },
  { name: 'Jul', sales: 3490, revenue: 4300 },
];

const DEFAULT_TOP_PRODUCTS = [
  { name: 'Urban Nomad Jacket', cat: 'Streetwear', sales: 450, rev: 989550, status: 'Trending' },
  { name: 'Elite Tech Parka', cat: 'Streetwear', sales: 320, rev: 1120000, status: 'Stable' },
  { name: 'Urban Street High-Tops', cat: 'Shoes', sales: 280, rev: 336000, status: 'New' },
  { name: 'Oversized Graphic Tee', cat: 'T-shirt', sales: 210, rev: 629790, status: 'Stable' },
];

export default function Sales() {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [salesData, setSalesData] = useState(DEFAULT_SALES_DATA);
  const [topProducts, setTopProducts] = useState(DEFAULT_TOP_PRODUCTS);
  const [stats, setStats] = useState({
    revenue: 124500,
    orders: 1240,
    customers: 850,
    growth: 12.5
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'analytics', 'sales_performance'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setSalesData(data.salesData || DEFAULT_SALES_DATA);
        setTopProducts(data.topProducts || DEFAULT_TOP_PRODUCTS);
        setStats(data.stats || {
          revenue: 124500,
          orders: 1240,
          customers: 850,
          growth: 12.5
        });
      } else if (isAdmin) {
        // Initialize if doesn't exist and user is admin
        setDoc(doc(db, 'analytics', 'sales_performance'), {
          salesData: DEFAULT_SALES_DATA,
          topProducts: DEFAULT_TOP_PRODUCTS,
          stats: {
            revenue: 124500,
            orders: 1240,
            customers: 850,
            growth: 12.5
          }
        });
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching sales performance:", error);
      setLoading(false);
    });

    return () => unsub();
  }, [isAdmin]);

  const handleSaveAnalytics = async () => {
    try {
      await updateDoc(doc(db, 'analytics', 'sales_performance'), {
        salesData,
        topProducts,
        stats
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving analytics:", error);
    }
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Sales Performance</h1>
          <p className="text-slate-500 mt-1">Detailed analytics and revenue tracking.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => isEditing ? handleSaveAnalytics() : setIsEditing(true)}
            className={`btn-primary flex items-center ${isEditing ? 'bg-green-600 hover:bg-green-700' : ''}`}
          >
            {isEditing ? <Save className="h-5 w-5 mr-2" /> : <Edit2 className="h-5 w-5 mr-2" />}
            {isEditing ? 'Save Changes' : 'Edit Analytics'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={isEditing ? (
            <input 
              type="number" 
              className="bg-transparent border-b border-blue-500 outline-none w-full"
              value={stats.revenue}
              onChange={e => setStats({...stats, revenue: parseFloat(e.target.value)})}
            />
          ) : `₹${stats.revenue.toLocaleString()}`} 
          change="+12.5%" 
          isPositive={true}
          icon={<DollarSign className="text-green-500" />} 
        />
        <StatCard 
          title="Total Orders" 
          value={isEditing ? (
            <input 
              type="number" 
              className="bg-transparent border-b border-blue-500 outline-none w-full"
              value={stats.orders}
              onChange={e => setStats({...stats, orders: parseInt(e.target.value)})}
            />
          ) : stats.orders} 
          change="+8.2%" 
          isPositive={true}
          icon={<ShoppingBag className="text-blue-500" />} 
        />
        <StatCard 
          title="Total Customers" 
          value={isEditing ? (
            <input 
              type="number" 
              className="bg-transparent border-b border-blue-500 outline-none w-full"
              value={stats.customers}
              onChange={e => setStats({...stats, customers: parseInt(e.target.value)})}
            />
          ) : stats.customers} 
          change="-2.4%" 
          isPositive={false}
          icon={<Users className="text-purple-500" />} 
        />
        <StatCard 
          title="Avg. Order Value" 
          value={`₹${(stats.revenue / (stats.orders || 1)).toFixed(2)}`} 
          change="+5.1%" 
          isPositive={true}
          icon={<TrendingUp className="text-amber-500" />} 
        />
      </div>

      {isEditing && (
        <div className="glass-panel p-6 rounded-2xl border-blue-500/30">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <RefreshCw className="h-4 w-4 mr-2 text-blue-500" />
            Edit Chart Data
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {salesData.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase">{item.name}</p>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">Revenue</label>
                  <input 
                    type="number" 
                    className="input-field py-1 px-2 text-xs w-full"
                    value={item.revenue}
                    onChange={e => {
                      const newData = [...salesData];
                      newData[idx].revenue = parseFloat(e.target.value);
                      setSalesData(newData);
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">Sales</label>
                  <input 
                    type="number" 
                    className="input-field py-1 px-2 text-xs w-full"
                    value={item.sales}
                    onChange={e => {
                      const newData = [...salesData];
                      newData[idx].sales = parseInt(e.target.value);
                      setSalesData(newData);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Revenue Overview</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Sales Volume</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  cursor={{ fill: '#1e293b' }}
                />
                <Bar dataKey="sales" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Top Performing Products</h2>
          {isEditing && <span className="text-[10px] text-amber-500 font-bold uppercase">Editing Mode</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Sales</th>
                <th className="px-6 py-4">Revenue</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {topProducts.map((p, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input 
                        className="input-field py-1 px-2 text-xs w-full"
                        value={p.name}
                        onChange={e => {
                          const newProducts = [...topProducts];
                          newProducts[i].name = e.target.value;
                          setTopProducts(newProducts);
                        }}
                      />
                    ) : (
                      <span className="font-bold text-slate-900 dark:text-white">{p.name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input 
                        className="input-field py-1 px-2 text-xs w-full"
                        value={p.cat}
                        onChange={e => {
                          const newProducts = [...topProducts];
                          newProducts[i].cat = e.target.value;
                          setTopProducts(newProducts);
                        }}
                      />
                    ) : (
                      <span className="text-sm text-slate-500">{p.cat}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input 
                        type="number"
                        className="input-field py-1 px-2 text-xs w-40"
                        value={p.sales}
                        onChange={e => {
                          const newProducts = [...topProducts];
                          newProducts[i].sales = parseInt(e.target.value);
                          setTopProducts(newProducts);
                        }}
                      />
                    ) : (
                      <span className="text-sm text-slate-900 dark:text-white font-medium">{p.sales}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input 
                        type="number"
                        className="input-field py-1 px-2 text-xs w-40"
                        value={p.rev}
                        onChange={e => {
                          const newProducts = [...topProducts];
                          newProducts[i].rev = parseFloat(e.target.value);
                          setTopProducts(newProducts);
                        }}
                      />
                    ) : (
                      <span className="text-sm text-blue-500 font-bold">₹{p.rev.toLocaleString()}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <select 
                        className="input-field py-1 px-2 text-xs w-full"
                        value={p.status}
                        onChange={e => {
                          const newProducts = [...topProducts];
                          newProducts[i].status = e.target.value;
                          setTopProducts(newProducts);
                        }}
                      >
                        <option value="Trending">Trending</option>
                        <option value="Stable">Stable</option>
                        <option value="New">New</option>
                        <option value="Low Stock">Low Stock</option>
                      </select>
                    ) : (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                        p.status === 'Trending' ? "bg-orange-500/10 text-orange-500 border-orange-500/20" : 
                        p.status === 'New' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                        "bg-blue-500/10 text-blue-500 border-blue-500/20"
                      }`}>
                        {p.status}
                      </span>
                    )}
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

function StatCard({ title, value, change, isPositive, icon }: any) {
  return (
    <div className="glass-panel p-6 rounded-2xl flex items-center justify-between group hover:border-blue-500/50 transition-all">
      <div className="space-y-1 flex-1">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
        <div className="flex items-center space-x-1">
          {isPositive ? (
            <ArrowUpRight className="h-3 w-3 text-green-500" />
          ) : (
            <ArrowDownRight className="h-3 w-3 text-red-500" />
          )}
          <span className={`text-[10px] font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {change}
          </span>
          <span className="text-[10px] text-slate-500">vs last month</span>
        </div>
      </div>
      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 group-hover:border-blue-500/50 transition-all ml-4">
        {icon}
      </div>
    </div>
  );
}
