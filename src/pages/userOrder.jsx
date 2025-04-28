/*import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../Firebase/Firebase"; // Import Firebase instance

const UserOrder = () => {
  const { bookingId } = useParams(); // Get booking ID from URL
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [user, setUser] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        if (!bookingId) return;
        const bookingRef = doc(db, "bookings", bookingId);
        const docSnap = await getDoc(bookingRef);

        if (docSnap.exists()) {
          const bookingData = docSnap.data();
          setBooking(bookingData);

          // ✅ Mark booking as "viewedByAdmin"
          if (!bookingData.viewedByAdmin) {
            await updateDoc(bookingRef, { viewedByAdmin: true });
          }

          // Fetch User & Event details
          await fetchUser(bookingData.userId);
          await fetchEvent(bookingData.eventId);
        } else {
          console.log("No such booking!");
        }
      } catch (error) {
        console.error("Error fetching booking:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUser = async (userId) => {
      try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) setUser(userSnap.data());
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    const fetchEvent = async (eventId) => {
      try {
        const eventRef = doc(db, "events", eventId);
        const eventSnap = await getDoc(eventRef);
        if (eventSnap.exists()) setEvent(eventSnap.data());
      } catch (error) {
        console.error("Error fetching event:", error);
      }
    };

    fetchBooking();
  }, [bookingId]);

  // ✅ Accept Booking Function
  const handleAcceptBooking = async () => {
    if (!booking) return;
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      await updateDoc(bookingRef, { acceptBooking: "We accept your booking and will contact you soon!" });
      alert("Booking Accepted!");
      navigate("/adminDashboard");
    } catch (error) {
      console.error("Error accepting booking:", error);
    }
  };

  // ❌ Cancel Booking Function
  const handleCancelBooking = async () => {
    if (!booking) return;
    const confirmDelete = window.confirm("Are you sure you want to cancel this booking?");
    if (confirmDelete) {
      try {
        const bookingRef = doc(db, "bookings", bookingId);
        await deleteDoc(bookingRef);
        alert("Booking Cancelled!");
        navigate("/adminDashboard");
      } catch (error) {
        console.error("Error canceling booking:", error);
      }
    }
  };

  return (
    <div className="order-details">
      <h2>📋 Booking Details</h2>

      {loading ? <p>Loading...</p> : (
        <>
          {/* User Details Card *
          {user && (
            <div className="card">
              <h3>👤 User Information</h3>
              <p>🆔 UID: {booking?.userId}</p>
              <p>👤 Role: {user.role}</p>
              <p>📧 Email: {user.email}</p>
              <p>📅 Created At: {user.createdAt ? new Date(user.createdAt.toDate()).toDateString() : "N/A"}</p>
            </div>
          )}

          {/* Event Details Card *
          {event && (
            <div className="card">
              <h3>🎉 Event Details</h3>
              <p>📌 Name: {event.eventName}</p>
              <p>📅 Type: {event.type}</p>
              <p>🔖 Range: {event.range}</p>
              <p>📝 Description: {event.description}</p>
              <p>📅 Created At: {event.createdAt ? new Date(event.createdAt.toDate()).toDateString() : "N/A"}</p>
            </div>
          )}

          {/* Booking Details Card *
          {booking && (
            <div className="card">
              <h3>📦 Booking Details</h3>
              <p>👤 Name: {booking.firstName} {booking.lastName}</p>
              <p>📞 Phone: {booking.phone}</p>
              <p>🏠 Address: {booking.address}, {booking.pincode}</p>
              <p>📧 Email: {booking.emailId}</p>
              <p>📅 Event Date: {booking.eventDate ? new Date(booking.eventDate.toDate()).toDateString() : "N/A"}</p>
              <p>💰 Price: ₹{booking.price}</p>
              <p>📌 Status: {booking.paymentStatus}</p>
              <p>👀 Viewed: ✅</p>
            </div>
          )}

          {/* Action Buttons *
          <button className="accept-btn" onClick={handleAcceptBooking}>✅ Accept Booking</button>
          <button className="cancel-btn" onClick={handleCancelBooking}>❌ Cancel Booking</button>
        </>
      )}
    </div>
  );
};

export default UserOrder;
*/
/*import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../Firebase/Firebase"; // Import Firestore
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

const UserOrder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.bookings; // Get booking data from state
  const [user, setUser] = useState(null);
  const [event, setEvent] = useState(null);

  useEffect(() => {
    if (!booking) return;

    // Fetch User Details
    const fetchUser = async () => {
      const userRef = doc(db, "users", booking.userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) setUser(userSnap.data());
    };

    // Fetch Event Details
    const fetchEvent = async () => {
      const eventRef = doc(db, "events", booking.eventId);
      const eventSnap = await getDoc(eventRef);
      if (eventSnap.exists()) setEvent(eventSnap.data());
    };

    fetchUser();
    fetchEvent();
  }, [booking]);

  // ✅ Accept Booking Function
  const handleAcceptBooking = async () => {
    if (!booking) return;
    const bookingRef = doc(db, "bookings", booking.id);
    await updateDoc(bookingRef, { acceptBooking: "We accept your booking and we will contact you soon!" });
    alert("Booking Accepted!");
    navigate("/adminDashboard");
  };

  // ❌ Cancel Booking Function
  const handleCancelBooking = async () => {
    if (!booking) return;
    const confirmDelete = window.confirm("Are you sure you want to cancel this booking?");
    if (confirmDelete) {
      const bookingRef = doc(db, "bookings", booking.id);
      await deleteDoc(bookingRef);
      alert("Booking Cancelled!");
      navigate("/adminDashboard");
    }
  };

  return (
    <div className="order-details">
      <h2>📋 Booking Details</h2>

      {/* User Details Card *
      {user && (
        <div className="card">
          <h3>👤 User Information</h3>
          <p>🆔 UID: {booking.userId}</p>
          <p>👤 Role: {user.role}</p>
          <p>📧 Email: {user.email}</p>
          <p>📅 Created At: {new Date(user.createdAt).toDateString()}</p>
        </div>
      )}

      {/* Event Details Card *
      {event && (
        <div className="card">
          <h3>🎉 Event Details</h3>
          <p>📌 Name: {event.eventName}</p>
          <p>📅 Type: {event.type}</p>
          <p>🔖 Range: {event.range}</p>
          <p>📝 Description: {event.description}</p>
          <p>📅 Created At: {new Date(event.createdAt).toDateString()}</p>
        </div>
      )}

      {/* Booking Details Card *
      <div className="card">
        <h3>📦 Booking Details</h3>
        <p>👤 Name: {booking.firstName} {booking.lastName}</p>
        <p>📞 Phone: {booking.phone}</p>
        <p>🏠 Address: {booking.address}, {booking.pincode}</p>
        <p>📧 Email: {booking.emailId}</p>
        <p>📅 Event Date: {new Date(booking.eventDate).toDateString()}</p>
        <p>💰 Price: ₹{booking.price}</p>
        <p>📌 Status: {booking.paymentStatus}</p>
        <p>👀 Viewed: {booking.viewedByAdmin ? "Yes" : "No"}</p>
      </div>

      {/* Action Buttons *
      <button className="accept-btn" onClick={handleAcceptBooking}>✅ Accept Booking</button>
      <button className="cancel-btn" onClick={handleCancelBooking}>❌ Cancel Booking</button>
    </div>
  );
};

export default UserOrder;
*
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../Firebase/Firebase"; // Firebase instance
import { useEffect, useState } from "react";

const UserOrder = () => {
  const { bookingId } = useParams(); // Get booking ID from URL
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) return;
      const bookingRef = doc(db, "bookings", bookingId);
      const docSnap = await getDoc(bookingRef);
      if (docSnap.exists()) {
        setBooking(docSnap.data());
      } else {
        console.log("No such booking!");
      }
    };

    fetchBooking();
  }, [bookingId]);

  return (
    <div>
      <h2>Booking Details</h2>
      {booking ? (
        <div>
          <p>👤 Name: {booking.firstName} {booking.lastName}</p>
          <p>📅 Event Date: {new Date(booking.eventDate).toDateString()}</p>
          <p>🎉 Event: {booking.eventName}</p>
          <p>📍 Address: {booking.address}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default UserOrder;
*/
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../Firebase/Firebase";
import "./userOrder.css"; // Custom CSS

const UserOrder = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [event, setEvent] = useState(null);

  // ✅ Fetch booking + event
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        if (!bookingId) return;
        const bookingRef = doc(db, "bookings", bookingId);
        const docSnap = await getDoc(bookingRef);

        if (docSnap.exists()) {
          const bookingData = docSnap.data();
          setBooking(bookingData);

          // 🔁 Fetch event details after we get eventId
          fetchEvent(bookingData.eventId);

          // ✅ Update viewedByAdmin (if false)
          if (!bookingData.viewedByAdmin) {
            await updateDoc(bookingRef, { viewedByAdmin: true });
            setBooking((prev) => ({ ...prev, viewedByAdmin: true }));
          }
        } else {
          console.warn("No such booking!");
        }
      } catch (error) {
        console.error("Error fetching booking:", error);
      }
    };

    const fetchEvent = async (eventId) => {
      try {
        if (!eventId) return;
        const eventRef = doc(db, "events", eventId);
        const eventSnap = await getDoc(eventRef);
        if (eventSnap.exists()) {
          setEvent(eventSnap.data());
        } else {
          console.warn("Event not found for ID:", eventId);
        }
      } catch (error) {
        console.error("Error fetching event:", error);
      }
    };

    fetchBooking();
  }, [bookingId]);

  // ✅ Accept booking
  const handleAcceptBooking = async () => {
    try {
      if (!booking) return;
      const bookingRef = doc(db, "bookings", bookingId);

      await updateDoc(bookingRef, {
        acceptBooking: "accepted", // ✅ Set to exact string for rule
      });

      setBooking((prev) => ({ ...prev, acceptBooking: "accepted" }));
      alert("✅ Booking Accepted!");
    } catch (error) {
      console.error("Error accepting booking:", error);
      alert("❌ Failed to accept booking: " + error.message);
    }
  };

  // ❌ Cancel booking
  const handleCancelBooking = async () => {
    try {
      if (!booking) return;
      const confirmDelete = window.confirm("Are you sure you want to cancel this booking?");
      if (confirmDelete) {
        const bookingRef = doc(db, "bookings", bookingId);
        await deleteDoc(bookingRef);
        alert("❌ Booking Cancelled!");
        navigate("/adminDashboard");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
    }
  };

  return (
    <div className="order-container">
      <h2 className="order-heading">📋 Booking Details</h2>

      {/* Event Details */}
      {event ? (
        <div className="card event-card">
          <h3>🎉 Event Details</h3>
          <p>📌 Name: {event.eventName}</p>
          <p>📅 Type: {event.type}</p>
          <p>🔖 Range: {event.range}</p>
          <p>📝 Description: {event.description}</p>
          <p>
            📅 Created At:{" "}
            {event.createdAt ? new Date(event.createdAt.seconds * 1000).toDateString() : "N/A"}
          </p>
        </div>
      ) : (
        <p className="loading-text">Loading event details...</p>
      )}

      {/* Booking Details */}
      {booking ? (
        <div className="card booking-card">
          <h3>📦 Booking Details</h3>
          <p>👤 Name: {booking.firstName} {booking.lastName}</p>
          <p>📞 Phone: {booking.phone}</p>
          <p>🏠 Address: {booking.address}, {booking.pincode}</p>
          <p>📧 Email: {booking.emailId}</p>
          <p>📅 Event Date: {new Date(booking.eventDate.seconds * 1000).toDateString()}</p>
          <p>💰 Price: ₹{booking.price}</p>
          <p>📌 Payment Status: {booking.paymentStatus}</p>
          <p>👀 Viewed By Admin: {booking.viewedByAdmin ? "✅" : "❌"}</p>
          <p>🆔 Event ID: {booking.eventId}</p>
          <p>🎯 Booking Status: {booking.acceptBooking || "Pending"}</p>
        </div>
      ) : (
        <p className="loading-text">Loading booking details...</p>
      )}

      {/* Buttons */}
      <div className="button-group">
        <button
          className={`accept-btn ${booking?.acceptBooking ? "accepted" : "pulse"}`}
          onClick={handleAcceptBooking}
          disabled={!!booking?.acceptBooking}
        >
          {booking?.acceptBooking ? "✅ Accepted" : "✅ Accept Booking"}
        </button>

        <button className="cancel-btn" onClick={handleCancelBooking}>
          ❌ Cancel Booking
        </button>
      </div>
    </div>
  );
};

export default UserOrder;
