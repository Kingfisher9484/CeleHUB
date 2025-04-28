import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../Firebase/Firebase';
import StarRating from '../EventPopup/StarRating'; // Make sure this path is correct
import './userBooking.css';

const UserBooking = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookingAndEvent = async () => {
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
      } catch (error) {
        console.error('Error fetching booking or event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingAndEvent();
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

  if (loading) return <p className="loading-text">Loading...</p>;
  if (!booking) return <p>Booking not found.</p>;

  return (
    <div className="user-booking-detail">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      {event && (
        <div className="event-card-detail">
          <h3>Event Info</h3>
          <img src={event.mediaUrl} alt={event?.eventName} className="user-book-img" />
          <p><strong>Name:</strong> {event.name}</p>
          <p><strong>Type:</strong> {event.type}</p>
          <p><strong>Range:</strong> {event.range}</p>
          <p><strong>Description:</strong> {event.description}</p>
          <p><strong>Price:</strong> ₹{event.price}</p>
        </div>
      )}
      <div className="booking-card-detail">
        <h2>{booking.eventName}</h2>
        <p><strong>Booking ID:</strong> {booking.id}</p>
        <p><strong>Booked On:</strong> {new Date(booking.createdDate).toLocaleDateString()}</p>
        <p><strong>Event Date:</strong> {new Date(booking.eventDate).toLocaleDateString()}</p>
        <p><strong>Price:</strong> ₹{booking.price}</p>
        <p><strong>Status:</strong> {booking.completed ? "Completed" : "Upcoming"}</p>
        <p><strong>Address:</strong> {booking.address}</p>
        <p><strong>Email:</strong> {booking.email}</p>
        <p><strong>Phone:</strong> {booking.phone}</p>


        {booking.acceptedByAdmin ? (
          <div className="admin-note">
            ✅ Your booking has been accepted. An admin will contact you soon...
          </div>
        ) : (
          <div className="admin-note pending">
            ✅ Your booking has been sent to admin. An admin will accept you soon...
          </div>
        )}

        <div className="rating-section">
          <StarRating eventId={booking.eventId} userId={booking.userId} />
        </div>

        <button className="cancel-booking-btn" onClick={handleCancel}>Cancel Booking</button>
      </div>
    </div>
  );
};

export default UserBooking;