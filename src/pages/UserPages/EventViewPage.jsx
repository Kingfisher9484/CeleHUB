import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./EventViewPage.css";
import { db, auth } from "../../../Firebase/Firebase";
import {doc,getDoc,collection,getDocs,query,where,} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import StarRating from "../../EventPopup/StarRating";

export default function EventViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Get logged in user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const docRef = doc(db, "events", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setEvent({ id, ...docSnap.data() });
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("Error fetching event:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEvent();
  }, [id]);

  // Fetch booked dates
  useEffect(() => {
    const fetchBookedDates = async () => {
      if (!event?.id) return;
      try {
        const q = query(collection(db, "bookings"), where("eventId", "==", event.id));
        const snapshot = await getDocs(q);
        const dates = snapshot.docs.map((doc) => doc.data().eventDate);
        setBookedDates(dates);
      } catch (err) {
        console.error("Error fetching booked dates:", err);
      }
    };
    fetchBookedDates();
  }, [event]);

  const handleBooking = () => {
    navigate(`/eventbooking/${event.id}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: event.eventName,
          text: `Check out this event: ${event.eventName}`,
          url: window.location.href,
        })
        .catch(console.error);
    } else {
      alert("Sharing not supported on this device.");
    }
  };

  if (loading) return <div className="loading" style={{ alignSelf: "center", justifySelf: "center" }}>Loading event...</div>;
  if (notFound) return <div className="error" style={{ alignSelf: "center", justifySelf: "center" }}>Event not found</div>;

  return (
    <div className="event-page-container">
      <div className="event-page-header">
        <h1>{event.eventName}</h1>
        <button className="share-button" onClick={handleShare}>Share</button>
      </div>

      <div className="event-page-content">
        <div className="event-page-image-section">
          <img src={event.mediaUrl} alt={event.eventName} className="event-image" />
        </div>

        <div className="event-page-details">
          <p><strong>Type:</strong> {event.type}</p>
          <p><strong>Range:</strong> {event.range}</p>
          <p><strong>Price:</strong> ₹{event.price}</p>
          <p className="event-description">{event.description}</p>

          <div className="event-calendar">
            <h3>Available Dates</h3>
            <Calendar
              tileClassName={({ date }) =>
                bookedDates.includes(date.toISOString().split("T")[0])
                  ? "booked-date"
                  : "available-date"
              }
            />
          </div>

          <div className="rating-section">
            <p><strong>Your Rating:</strong></p>
            <StarRating eventId={event.id} />
          </div>

          <button className="book-now-btn" onClick={handleBooking}>
            Book This Event
          </button>
        </div>
      </div>
    </div>
  );
}
