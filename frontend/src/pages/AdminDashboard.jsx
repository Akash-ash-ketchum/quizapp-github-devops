import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    logins: 0,
    quizzes: 0,
    loginData: [],
    quizData: []
  });
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 7)));
  const [endDate, setEndDate] = useState(new Date());
  const [loading, setLoading] = useState(true);


  const fetchStats = async () => {
    try {
      const params = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      };

      const [loginsRes, quizzesRes, loginTrendRes, quizTrendRes, userStatsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/admin/logins`, {
          params,
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get(`http://localhost:5000/api/admin/quizzes`, {
          params,
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get(`http://localhost:5000/api/admin/login-trend`, {
          params,
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get(`http://localhost:5000/api/admin/quiz-trend`, {
          params,
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get(`http://localhost:5000/api/admin/user-stats`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      setStats({
        logins: loginsRes.data.logins,
        quizzes: quizzesRes.data.quizzes,
        loginData: loginTrendRes.data,
        quizData: quizTrendRes.data,
        totalUsers: userStatsRes.data.totalUsers,
        dailyRegistrations: userStatsRes.data.dailyRegistrations
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [startDate, endDate]);

  if (!user || user.role !== 'admin') {
    return <div className="text-center text-red-500 mt-20 text-xl">Unauthorized access</div>;
  }

  // In AdminDashboard component
  const [preset, setPreset] = useState('last7');

  useEffect(() => {
    const now = new Date();

    switch (preset) {
      case 'today':
        setStartDate(new Date(now.setHours(0, 0, 0, 0)));
        setEndDate(new Date(now.setHours(23, 59, 59, 999)));
        break;
      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        setStartDate(new Date(yesterday.setHours(0, 0, 0, 0)));
        setEndDate(new Date(yesterday.setHours(23, 59, 59, 999)));
        break;
      case 'last7':
        setStartDate(new Date(now.setDate(now.getDate() - 7)));
        setEndDate(new Date());
        break;
      case 'thisMonth':
        setStartDate(new Date(now.getFullYear(), now.getMonth(), 1));
        setEndDate(new Date());
        break;
      case 'allTime':
        setStartDate(new Date(0));
        setEndDate(new Date());
        break;
      default:
        break;
    }
  }, [preset]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Date Range Picker */}
        <div className="mb-6 flex gap-4 items-end">
          <div className="flex flex-col">
            <label className="text-sm mb-1">From</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              className="bg-gray-800 text-white p-2 rounded"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm mb-1">To</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              className="bg-gray-800 text-white p-2 rounded"
            />
          </div>
          <button
            onClick={fetchStats}
            className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Apply Filter
          </button>
        </div>
        {/* // Add these preset buttons below the date pickers */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setPreset('today')}
            className="px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600"
          >
            Today
          </button>
          <button
            onClick={() => setPreset('yesterday')}
            className="px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600"
          >
            Yesterday
          </button>
          <button
            onClick={() => setPreset('last7')}
            className="px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600"
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setPreset('thisMonth')}
            className="px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600"
          >
            This Month
          </button>
          <button
            onClick={() => setPreset('allTime')}
            className="px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600"
          >
            All Time
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-2">User Logins</h2>
                <div className="text-3xl font-bold text-blue-400">
                  {stats.logins}
                </div>
                <p className="text-gray-400 text-sm mt-1">Selected range logins</p>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-2">Quiz Attempts</h2>
                <div className="text-3xl font-bold text-green-400">
                  {stats.quizzes}
                </div>
                <p className="text-gray-400 text-sm mt-1">Total attempts</p>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-2">Total Users</h2>
                <div className="text-3xl font-bold text-purple-400">
                  {stats.totalUsers}
                </div>
                <p className="text-gray-400 text-sm mt-1">All registered users</p>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-2">New Users</h2>
                <div className="text-3xl font-bold text-yellow-400">
                  {stats.dailyRegistrations}
                </div>
                <p className="text-gray-400 text-sm mt-1">Registered in last 24 hours</p>
              </div>
            </div>


            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-4">Login Trends</h2>
                <BarChart width={500} height={300} data={stats.loginData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#60a5fa" />
                </BarChart>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-4">Quiz Attempt Trends</h2>
                <BarChart width={500} height={300} data={stats.quizData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#34d399" />
                </BarChart>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
