import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import AuthForm from "./pages/AuthForm";
import ProtectedRoute from "./components/ProtectedRoute";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Home from "./pages/Home";
import EventBookingPage from "./pages/EventBookingPage";
import UserOrder from "./pages/userOrder";
import UserBooking from "./pages/userBooking";
import UserProfile from "./pages/UserProfile"; 
import BookingConfirmation from "./pages/BookingConfirmation"; // adjust the path


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthForm />} />

        {/* Protected Routes for Users */}
        <Route element={<ProtectedRoute role="user" />}>
          <Route path="/user" element={<UserDashboard />} />
          <Route path="/eventbooking/:eventId" element={<EventBookingPage />} />
          <Route path="/userBooking/:bookingId" element={<UserBooking />} />
          <Route path="/UserProfile/:uid" element={<UserProfile />} />
          <Route path="/booking-confirmation" element={<BookingConfirmation />} />

        </Route>

        {/* Protected Routes for Admins */}
        <Route element={<ProtectedRoute role="admin" />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/userOrder/:bookingId" element={<UserOrder />} />
          <Route path="/UserProfile/:uid" element={<UserProfile />} />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
