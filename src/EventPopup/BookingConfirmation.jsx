import React, { useEffect, useRef } from "react";
import html2pdf from "html2pdf.js";
import "./BookingConfirmation.css";

const BookingConfirmation = ({ event, booking, triggerDownload }) => {
  const pdfRef = useRef();

  useEffect(() => {
    if (triggerDownload && event && booking) {
      handleDownloadPDF();
    }
  }, [triggerDownload, event, booking]);

  const handleDownloadPDF = () => {
    const element = pdfRef.current;
    const opt = {
      margin: 0.5,
      filename: `Booking_Invoice_${booking.id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div style={{ display: "none" }}>
      <div className="booking-wrapper" ref={pdfRef}>
        {event && (
          <div className="event-info">
            <h3>Event Details</h3>
            <img src={event.mediaUrl} alt={event.eventName} className="event-image" />
            <p><strong>Name:</strong> {event.eventName}</p>
            <p><strong>Type:</strong> {event.type}</p>
            {event.range && <p><strong>Range:</strong> {event.range}</p>}
            <p><strong>Description:</strong> {event.description}</p>
            <p><strong>Price:</strong> ₹{event.price}</p>
          </div>
        )}

        <div className="booking-info">
          <h2 className="section-title">{booking.eventName}</h2>
          <p><strong>Booking ID:</strong> {booking.id}</p>
          <p><strong>Booked On:</strong> {new Date(booking.createdDate).toLocaleDateString()}</p>
          <p><strong>Event Date:</strong> {new Date(booking.eventDate).toLocaleDateString()}</p>
          <p><strong>Price:</strong> ₹{booking.price}</p>
          <p><strong>Status:</strong> {booking.acceptedByAdmin ? "Confirmed" : "Pending"}</p>
          <p><strong>Address:</strong> {booking.address}, {booking.pincode}</p>
          <p><strong>Email:</strong> {booking.email}</p>
          <p><strong>Phone:</strong> {booking.phone}</p>

          <div className={`admin-note ${booking.acceptedByAdmin ? 'accepted' : 'pending'}`}>
            {booking.acceptedByAdmin
              ? "✅ Your booking has been accepted. Admin will contact you soon."
              : "✅ Your booking has been submitted. Awaiting admin acceptance..."}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
