import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, limit, orderBy, onSnapshot, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Edit2,
  Save,
  RefreshCw
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const DEFAULT_CHART_DATA = [
  { name: 'Jan', sales: 4000 },
  { name: 'Feb', sales: 3000 },
  { name: 'Mar', sales: 2000 },
  { name: 'Apr', sales: 2780 },
  { name: 'May', sales: 1890 },
  { name: 'Jun', sales: 2390 },
];

export default function AdminDashboard() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [chartData, setChartData] = useState(DEFAULT_CHART_DATA);

  useEffect(() => {
    // Real-time stats from collections
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setStats(prev => ({ ...prev, totalUsers: snap.size }));
    });

    const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
      setStats(prev => ({ ...prev, totalProducts: snap.size }));
    });

    const unsubOrders = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), (snap) => {
      let totalRevenue = 0;
      const ordersData: any[] = [];
      snap.forEach(doc => {
        const data = doc.data();
        totalRevenue += data.total || 0;
        ordersData.push({ id: doc.id, ...data });
      });

      setStats(prev => ({ 
        ...prev, 
        totalOrders: snap.size,
        revenue: totalRevenue
      }));
      setRecentOrders(ordersData.slice(0, 5));
    });

    // Fetch custom chart data if exists
    const unsubDashboard = onSnapshot(doc(db, 'analytics', 'dashboard_overview'), (snap) => {
      if (snap.exists()) {
        setChartData(snap.data().chartData || DEFAULT_CHART_DATA);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching dashboard analytics:", error);
      setLoading(false);
    });

    return () => {
      unsubUsers();
      unsubProducts();
      unsubOrders();
      unsubDashboard();
    };
  }, []);

  const handleSaveDashboard = async () => {
    try {
      await setDoc(doc(db, 'analytics', 'dashboard_overview'), {
        chartData
      }, { merge: true });
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving dashboard analytics:", error);
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time platform performance metrics.</p>
        </div>
        <div className="flex items-center space-x-4">
          {isAdmin && (
            <button
              onClick={() => isEditing ? handleSaveDashboard() : setIsEditing(true)}
              className={`btn-primary flex items-center ${isEditing ? 'bg-green-600 hover:bg-green-700' : ''}`}
            >
              {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit2 className="h-4 w-4 mr-2" />}
              {isEditing ? 'Save Changes' : 'Edit Overview'}
            </button>
          )}
          <div className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 uppercase tracking-widest animate-pulse">
            Live Updates Active
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats.totalUsers} icon={<Users className="text-blue-400" />} trend="+12%" isPositive={true} />
        <StatCard title="Total Products" value={stats.totalProducts} icon={<Package className="text-purple-400" />} trend="+5%" isPositive={true} />
        <StatCard title="Total Orders" value={stats.totalOrders} icon={<ShoppingCart className="text-green-400" />} trend="+18%" isPositive={true} />
        <StatCard title="Revenue" value={`₹${stats.revenue.toLocaleString()}`} icon={<TrendingUp className="text-amber-400" />} trend="+24%" isPositive={true} />
      </div>

      {isEditing && (
        <div className="glass-panel p-6 rounded-2xl border-blue-500/30">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <RefreshCw className="h-4 w-4 mr-2 text-blue-500" />
            Edit Growth Chart Data
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {chartData.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase">{item.name}</p>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">Sales Value</label>
                  <input 
                    type="number" 
                    className="input-field py-1 px-2 text-xs w-full"
                    value={item.sales}
                    onChange={e => {
                      const newData = [...chartData];
                      newData[idx].sales = parseInt(e.target.value);
                      setChartData(newData);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Chart */}
        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Revenue Growth</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSales)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Recent Orders</h2>
          <div className="space-y-4">
            {recentOrders.length > 0 ? recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 transition-all group">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20 group-hover:bg-blue-500/20 transition-all">
                    <ShoppingCart className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-slate-500">{order.customerId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 dark:text-white">₹{order.total}</p>
                  <StatusBadge status={order.status} />
                </div>
              </div>
            )) : (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 text-slate-800 mx-auto mb-4 opacity-20" />
                <p className="text-slate-500 italic">No recent orders found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, isPositive }: any) {
  return (
    <div className="glass-panel p-6 rounded-2xl flex items-center justify-between group hover:border-blue-500/50 transition-all">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
        <div className="flex items-center space-x-1 mt-1">
          {isPositive ? <ArrowUpRight className="h-3 w-3 text-green-500" /> : <ArrowDownRight className="h-3 w-3 text-red-500" />}
          <span className={`text-[10px] font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>{trend}</span>
          <span className="text-[10px] text-slate-500">vs last month</span>
        </div>
      </div>
      <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 group-hover:border-blue-500/50 transition-all">{icon}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    shipped: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    delivered: 'bg-green-500/10 text-green-500 border-green-500/20',
    cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${styles[status] || 'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>
      {status}
    </span>
  );
}

