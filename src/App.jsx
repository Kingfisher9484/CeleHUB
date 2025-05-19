import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import AuthForm from "./pages/AuthForm";
import ProtectedRoute from "./components/ProtectedRoute";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Home from "./pages/Home/Home";
import EventViewPage from "./pages/UserPages/EventViewPage";
import EventBookingPage from "./pages/UserPages/EventBookingPage";
import UserOrder from "./pages/AdminPages/userOrder";
import UserBooking from "./pages/UserPages/userBooking";


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthForm />} />

        {/* Protected Route for any logged-in user */}
        <Route element={<ProtectedRoute />}>
          <Route path="/eventview/:id" element={<EventViewPage />} />

        </Route>

        {/* Protected Routes for Users */}
        <Route element={<ProtectedRoute role="user" />}>
          <Route path="/user" element={<UserDashboard />} />
          <Route path="/eventbooking/:eventId" element={<EventBookingPage />} />
          <Route path="/userBooking/:bookingId" element={<UserBooking />} />
        </Route>

        {/* Protected Routes for Admins */}
        <Route element={<ProtectedRoute role="admin" />}>
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/userOrder/:bookingId" element={<UserOrder />} />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>

  );
}

export default App;
