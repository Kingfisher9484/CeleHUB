import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../Firebase/Firebase";
import html2pdf from "html2pdf.js";
import "./userOrder.css";

const UserOrder = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [event, setEvent] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) return;
      const bookingRef = doc(db, "bookings", bookingId);
      const docSnap = await getDoc(bookingRef);
      if (docSnap.exists()) {
        const bookingData = docSnap.data();
        setBooking(bookingData);
        fetchEvent(bookingData.eventId);

        if (!bookingData.viewedByAdmin) {
          await updateDoc(bookingRef, { viewedByAdmin: true });
          setBooking((prev) => ({ ...prev, viewedByAdmin: true }));
        }
      }
    };

    const fetchEvent = async (eventId) => {
      if (!eventId) return;
      const eventRef = doc(db, "events", eventId);
      const eventSnap = await getDoc(eventRef);
      if (eventSnap.exists()) {
        setEvent(eventSnap.data());
      }
    };

    const fetchPaymentInfo = async () => {
      const paymentRef = doc(db, "adminPayment", "paymentDetails");
      const paymentSnap = await getDoc(paymentRef);
      if (paymentSnap.exists()) {
        setPaymentInfo(paymentSnap.data());
      }
    };

    fetchBooking();
    fetchPaymentInfo();
  }, [bookingId]);

  const handleAcceptBooking = async () => {
    if (!booking) return;
    const bookingRef = doc(db, "bookings", bookingId);
    await updateDoc(bookingRef, { acceptBooking: "accepted" });
    setBooking((prev) => ({ ...prev, acceptBooking: "accepted" }));
    alert("✅ Booking Accepted!");
  };

  const handleCancelBooking = async () => {
    if (!booking) return;
    const confirmDelete = window.confirm("Are you sure you want to cancel this booking?");
    if (confirmDelete) {
      const bookingRef = doc(db, "bookings", bookingId);
      await deleteDoc(bookingRef);
      alert("❌ Booking Cancelled!");
      navigate("/adminDashboard");
    }
  };

  const handleDownloadInvoice = async () => {
    if (!booking || !event) return;

    let base64Image = "";
    try {
      const blob = await fetch(event.mediaUrl, { mode: "cors" }).then(r => r.blob());
      base64Image = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Failed to load event image:", error);
    }

    const paymentImageHTML = paymentInfo?.imageUrl
      ? `<img src="${paymentInfo.imageUrl}" alt="QR Code" style="width:100px; margin-top:10px;" />`
      : "";

    const pdfContent = document.createElement("div");
    pdfContent.innerHTML = `
      <div style="padding:20px; font-family:Arial; color:black;">
        <h2 style=" color:black;">📄 Booking Invoice</h2>
        <img src="${base64Image}" alt="Event" style="width:100%; max-height:300px; object-fit:cover; border-radius:10px;" />
        <p style=" color:black;"><strong>Booking ID:</strong> ${bookingId}</p>
        <p style=" color:black;"><strong>Event:</strong> ${event.eventName}</p>
        <p style=" color:black;"><strong>Type:</strong> ${event.type}</p>
        <p style=" color:black;"><strong>Event Date:</strong> ${new Date(booking.eventDate.seconds * 1000).toDateString()}</p>
        <p style=" color:black;"><strong>Booked On:</strong> ${booking.createdDate ? new Date(booking.createdDate.seconds * 1000).toDateString() : "N/A"}</p>
        <p style=" color:black;"><strong>Name:</strong> ${booking.firstName} ${booking.lastName}</p>
        <p style=" color:black;"><strong>Email:</strong> ${booking.emailId}</p>
        <p style=" color:black;"><strong>Phone:</strong> ${booking.phone}</p>
        <p style=" color:black;"><strong>Address:</strong> ${booking.address}, ${booking.pincode}</p>
        <hr />
        <h3 style="text-align:right;color:black;">Total: ₹${booking.price}</h3>
        <p style=" color:black;"><em>Generated on ${new Date().toDateString()}</em></p>
      </div>
    `;

    html2pdf().set({
      margin: 0.5,
      filename: `Invoice-${bookingId}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
    }).from(pdfContent).save();
  };

  return (
    <div className="user-booking-container">
      <div className="booking-wrapper">
        {event ? (
          <div className="order-event-info">
            <h3>🎉 Event Details</h3>
            <img src={event.mediaUrl} alt={event?.eventName} className="user-event-image" />
            <p>Name: {event.eventName}</p>
            <p>Type: {event.type}</p>
            <p>Range: {event.range}</p>
            <p>Description: {event.description}</p>
            <p>Created At: {event.createdAt ? new Date(event.createdAt.seconds * 1000).toDateString() : "N/A"}</p>
          </div>
        ) : (
          <p className="loading-text">Loading event details...</p>
        )}

        {booking ? (
          <div className="order-booking-info">
            <h3>📋 Booking Details</h3>
            <p>Name: {booking.firstName} {booking.lastName}</p>
            <p>Phone: {booking.phone}</p>
            <p>Address: {booking.address}, {booking.pincode}</p>
            <p>Email: {booking.emailId}</p>
            <p>Event Date: {new Date(booking.eventDate.seconds * 1000).toDateString()}</p>
            <p>Price: ₹{booking.price}</p>
            <p>Payment Status: {booking.paymentStatus}</p>
            <p>Viewed By Admin: {booking.viewedByAdmin ? "✅" : "❌"}</p>
            <p>Event ID: {booking.eventId}</p>
            <p>Booking Status: {booking.acceptBooking || "Pending"}</p>
            <div className={`admin-note ${booking.acceptBooking === "accepted" ? "accepted" : "pending"}`}>
              {booking.acceptBooking === "accepted" ? "✅ Booking Accepted" : "⏳ Booking Pending"}
            </div>
          </div>
        ) : (
          <p className="loading-text">Loading booking details...</p>
        )}
      </div>

      <div className="rating-section">
        <button className="download-invoice-btn" onClick={handleDownloadInvoice}>
          🧾 Download Invoice
        </button>

        <button className="cancel-btn" onClick={handleCancelBooking}>
          ❌ Cancel Booking
        </button>

        <button
          className="cancel-btn"
          onClick={handleAcceptBooking}
          disabled={!!booking?.acceptBooking}
        >
          {booking?.acceptBooking ? "✅ Accepted" : "✅ Accept Booking"}
        </button>
      </div>
    </div>
  );
};

export default UserOrder;
