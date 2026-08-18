import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import Dashboard from './pages/Dashboard';
import CompanyProfile from './pages/CompanyProfile';
import MarketOverview from './pages/MarketOverview';
import Watchlist from './pages/Watchlist';
import ResearchHistory from './pages/ResearchHistory';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';

const queryClient = new QueryClient();

const MainLayout = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="flex flex-col w-full h-full flex-1 min-w-0">
        <Navbar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const AppLayout = () => {
  const { token } = useAuth();
  
  if (!token) {
    return (
      <div className="app-container">
        <main className="w-full h-full">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Login />} />
          </Routes>
        </main>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/market" element={<MarketOverview />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/history" element={<ResearchHistory />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/company/:ticker" element={<CompanyProfile />} />
        </Route>
      </Route>
      <Route path="*" element={<Dashboard />} />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppLayout />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
