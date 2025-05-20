import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../Firebase/Firebase';
import StarRating from '../../EventPopup/StarRating';
import './userBooking.css';
import html2pdf from 'html2pdf.js';

const UserBooking = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [event, setEvent] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bookingRef = doc(db, 'bookings', bookingId);
        const bookingSnap = await getDoc(bookingRef);
        if (bookingSnap.exists()) {
          const bookingData = { id: bookingSnap.id, ...bookingSnap.data() };
          setBooking(bookingData);

          const eventRef = doc(db, 'events', bookingData.eventId);
          const eventSnap = await getDoc(eventRef);
          if (eventSnap.exists()) {
            setEvent({ id: eventSnap.id, ...eventSnap.data() });
          }
        }

        const adminRef = doc(db, 'adminPayment', 'paymentDetails');
        const adminSnap = await getDoc(adminRef);
        if (adminSnap.exists()) {
          setPaymentInfo(adminSnap.data());
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookingId]);

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await deleteDoc(doc(db, 'bookings', bookingId));
        alert('Booking cancelled.');
        navigate('/user');
      } catch (error) {
        console.error('Error cancelling booking:', error);
      }
    }
  };

  const handleDownloadPDF = async () => {
    if (!booking || !event) return;

    let base64Image = '';
    try {
      const imageBlob = await fetch(event.mediaUrl, { mode: 'cors' }).then(r => r.blob());
      base64Image = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(imageBlob);
      });
    } catch (error) {
      console.error('Failed to load event image for PDF:', error);
    }

    const paymentImgHTML = paymentInfo?.imageUrl
      ? `<img src="${paymentInfo.imageUrl}" alt="QR" style="width:120px; margin-top:10px;" />`
      : '';

    const pdfContent = document.createElement('div');
    pdfContent.innerHTML = `
      <div style="padding: 20px; font-family: Arial; color:black;">
        <h2>Booking Confirmation</h2>
        <img src="${base64Image}" alt="Event" style="width:100%; max-height:400px; object-fit:cover; border-radius:10px;"/>
        <p><strong>Booking ID:</strong> ${booking.id}</p>
        <p><strong>Event:</strong> ${event.eventName || event.name}</p>
        <p><strong>Type:</strong> ${event.type}</p>
        <p><strong>Event Date:</strong> ${new Date(booking.eventDate).toLocaleDateString()}</p>
        <p><strong>Booked On:</strong> ${new Date(booking.createdDate).toLocaleDateString()}</p>
        <p><strong>Name:</strong> ${booking.firstName} ${booking.lastName}</p>
        <p><strong>Email:</strong> ${booking.email}</p>
        <p><strong>Phone:</strong> ${booking.phone}</p>
        <p><strong>Address:</strong> ${booking.address}</p>
        <p><strong>Status:</strong> ${booking.completed ? 'Completed' : 'Upcoming'}</p>
        <hr/>
        <p><strong>Admin Payment Info:</strong></p>
        <p><strong>Account Number:</strong> ${paymentInfo?.accountNumber || 'N/A'}</p>
        <p><strong>UPI ID:</strong> ${paymentInfo?.upiId || 'N/A'}</p>
        ${paymentImgHTML}
        <hr/>
        <p style="font-size:30px; text-align:right"><strong>Price: ₹${event.price}</strong></p>
      </div>
    `;

    html2pdf().set({
      margin: 0.5,
      filename: 'booking_invoice.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    }).from(pdfContent).save();
  };

  if (loading) return <p className="loading-text">Loading...</p>;
  if (!booking) return <p>Booking not found.</p>;

  return (
    <div className="user-booking-container">
      <button className="back-button" onClick={() => navigate(-1)}>⟵ Go Back</button>

      <div className="booking-event-wrapper">
        {event && (
          <div className="booking-event-info">
            <h1 className="booking-event-wrapper-h">Event Details</h1>
            <img src={event.mediaUrl} alt={event?.eventName} className="user-event-image" />
            <p className="booking-event-wrapper-p"><strong>Name:</strong> {event.name}</p>
            <p className="booking-event-wrapper-p"><strong>Type:</strong> {event.type}</p>
            <p className="booking-event-wrapper-p"><strong>Range:</strong> {event.range}</p>
            <p className="booking-event-wrapper-p"><strong>Description:</strong> {event.description}</p>
            <p className="booking-event-wrapper-p"><strong>Price:</strong> ₹{event.price}</p>
          </div>
        )}

        <div className="booking-info">
          <h2 className="section-title">{booking.eventName}</h2>
          <p><strong>Booking ID:</strong> {booking.id}</p>
          <p><strong>Booked On:</strong> {new Date(booking.createdDate).toLocaleDateString()}</p>
          <p><strong>Event Date:</strong> {new Date(booking.eventDate).toLocaleDateString()}</p>
          <p><strong>Price:</strong> ₹{booking.price}</p>
          <p><strong>Status:</strong> {booking.completed ? 'Completed' : 'Upcoming'}</p>
          <p><strong>Address:</strong> {booking.address}</p>
          <p><strong>Email:</strong> {booking.email}</p>
          <p><strong>Phone:</strong> {booking.phone}</p>

          <div className={`admin-note ${booking.acceptedByAdmin ? 'accepted' : 'pending'}`}>
            {booking.acceptedByAdmin
              ? '✅ Your booking has been accepted. Admin will contact you soon.'
              : '✅ Your booking has been sent. Awaiting admin acceptance...'}
          </div>

          {paymentInfo && (
            <div className="payment-info">
              <h4>Admin Payment Info</h4>
              <p><strong>Account Number:</strong> {paymentInfo.accountNumber}</p>
              <p><strong>UPI ID:</strong> {paymentInfo.upiId}</p>
              {paymentInfo.imageUrl && (
                <img src={paymentInfo.imageUrl} alt="Payment QR" className="payment-qr" />
              )}
            </div>
          )}

          <div className="rating-section">
            <h3>Your Rating</h3>
            <StarRating eventId={booking.eventId} userId={booking.userId} />
          </div>

          <button className="download-invoice-btn" onClick={handleDownloadPDF}>
            Download Invoice
          </button>

          <button className="cancel-btn" onClick={handleCancel}>
            Cancel Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserBooking;
