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
