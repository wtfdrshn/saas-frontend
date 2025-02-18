import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicLayout from './layouts/PublicLayout';
import UserDashboard from './pages/user/Dashboard';
import OrganizerDashboard from './pages/organizer/Dashboard';
import UserLogin from './components/auth/UserLogin';
import UserRegistration from './components/auth/UserRegistration';
import OrganizerLogin from './components/auth/OrganizerLogin';
import OrganizerRegistration from './components/auth/OrganizerRegistration';
import Home from './pages/Home';
import Events from './pages/organizer/Events';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import EventForm from './components/events/EventForm';
import DashboardLayout from './layouts/DashboardLayout';
import UserProfile from './pages/user/UserProfile';
import OrganizerProfile from './pages/organizer/OrganizerProfile';
import MyTickets from './pages/user/Tickets';
import Checkout from './pages/checkout/Checkout';
import TicketDetails from './pages/user/TicketDetails';
import DashboardAnalytics from './pages/organizer/DashboardAnalytics';
import EventAnalytics from './pages/organizer/EventAnalytics';
import EventAttendance from './pages/organizer/EventAttendance';
import { Toaster } from 'react-hot-toast';
import AttendanceManagement from './pages/organizer/AttendanceManagement';
import EventManagement from './pages/organizer/EventManagement';
import UserEvents from './pages/user/UserEvents';
import EventCalendar from './pages/EventCalendar';
import AttendanceCounter from './components/scanner/AttendanceCounter';
import BudgetCalculator from './pages/BudgetCalculator';
function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <AuthProvider>
        <Routes>
          {/* Public routes with PublicLayout */}
          
            <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/events/:id" element={<EventDetailPage />} />
                <Route path="/calendar" element={<EventCalendar />} />
                <Route path='/budget-calculator' element={<BudgetCalculator />} />
            </Route>

          {/* Auth routes without layout */}
            <Route path="/login/user" element={<UserLogin />} />
            <Route path="/register/user" element={<UserRegistration />} />
            <Route path="/login/organizer" element={<OrganizerLogin />} />
            <Route path="/register/organizer" element={<OrganizerRegistration />} />
          
          {/* User routes */}
          <Route
            path="/user/*"
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <DashboardLayout>
                  <Routes>
                    <Route path="dashboard" element={<UserDashboard />} />
                  <Route path="profile" element={<UserProfile />} />
                  <Route path="tickets" element={<MyTickets />} />
                  <Route path="events" element={<UserEvents />} />
                  <Route path='tickets/:id' element={<TicketDetails />} />
                    {/* Add other user routes here */}
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Checkout route */}
          <Route path="/checkout/:eventId" element={
            <ProtectedRoute allowedRoles={['user']}>
              <Checkout />
            </ProtectedRoute>
          } />

          {/* Organizer routes */}
          <Route
            path="/organizer/*"
            element={
              <ProtectedRoute allowedRoles={['organizer']}>
                <DashboardLayout>
                  <Routes>
                    <Route path="dashboard" element={<OrganizerDashboard />} />
                    <Route path="events" element={<Events />} />
                    <Route path="profile" element={<OrganizerProfile />} />
                    <Route path="analytics" element={<DashboardAnalytics />} />
                    <Route path="attendance" element={<AttendanceManagement />} />
                    <Route path="events/:eventId/analytics" element={<EventAnalytics />} />
                    <Route path="events/create" element={<EventForm />} />
                    <Route path="events/:id/edit" element={<EventForm />} />
                    {/* <Route path="events/:id/attendance" element={<AttendanceCounter />} /> */}
                    <Route path="events/:eventId/attendance" element={<EventAttendance />} />
                    <Route path="events/:eventId/manage" element={<EventManagement />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
