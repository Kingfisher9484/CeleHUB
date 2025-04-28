import React, { useState, useEffect } from "react";
import "./EventBookingPopup.css";
import { X } from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useNavigate } from "react-router-dom";
//import { motion } from "framer-motion";
import { db, auth } from "../../Firebase/Firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import StarRating from "../EventPopup/StarRating"; // adjust path if needed



export default function EventBookingPopup({ event, onClose }) {
  const navigate = useNavigate();
  const [bookedDates, setBookedDates] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (event?.id) {
      fetchBookedDates();
    }
  }, [event, user]);

  const fetchBookedDates = async () => {
    const bookingsRef = collection(db, "bookings");
    const q = query(bookingsRef, where("eventId", "==", event.id));
    const snapshot = await getDocs(q);
    const dates = snapshot.docs.map((doc) => doc.data().eventDate);
    setBookedDates(dates);
  };



  const handleBooking = () => {
    navigate(`/eventbooking/${event.id}`);
  };

  return (
    <div className="event-book-popup-overlay" onClick={onClose}>
      <div className="event-book-popup-container">
        <div className="event-book-popup-content" onClick={(e) => e.stopPropagation()}>
          <div className="event-book-popup-left">

            <button className="popup-close" onClick={onClose}>
              &times;
            </button>


            <img src={event.mediaUrl} alt={event.eventName} className="event-popup-image" />
            <div className="event-book-popup-left">
              <h2>{event.eventName}</h2>
              <p><strong>Type:</strong> {event.type}</p>
              <p><strong>Range:</strong> {event.range}</p>
              <p><strong>Price:</strong> ₹{event.price}</p>
              <p>{event.description}</p>

            </div>
          </div>
        </div>
        <div className="event-book-popup-right">
          <h3>Available Dates</h3>
          <Calendar
          className="calender"
            tileClassName={({ date }) =>
              bookedDates.includes(date.toISOString().split("T")[0])
                ? "booked-date"
                : "available-date"
            }
          />
          <div className="rating-section">
            <p><strong>Your Rating:</strong></p>
            <StarRating eventId={event.id} />
          </div>
          <button className="popup-book-now-btn" onClick={handleBooking}>
            Book Now
          </button>
        </div>
      </div>
    </div >
  );
}

/*import React, { useState, useEffect } from "react";
import "./EventBookingPopup.css";
import { X } from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useNavigate } from "react-router-dom";


export default function EventBookingPopup({ event, onClose }) {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [bookedDates, setBookedDates] = useState([]);

  useEffect(() => {
    // Fetch booked dates for the event (this should be from the database in real case)
    setBookedDates(["2025-02-18", "2025-02-20", "2025-02-25"]); // Example booked dates
  }, []);

  /*const handleBooking = () => {
    // Navigate to a secured booking page
    window.location.href = `/book/${event.id}`;
  };*

  const handleBooking = () => {
    navigate(`/eventbooking/${event.id}`);
  };



  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-container">
        <div className="popup-content" onClick={(e) => e.stopPropagation()}>
          <button className="popup-close" onClick={onClose}>
            <X size={24} />
          </button>

          <div className="popup-left">
            <img src={event.image} alt={event.eventName} className="popup-image" />
            <h2>{event.eventName}</h2>
            <p><strong>Type:</strong> {event.type}</p>
            <p><strong>Range:</strong> {event.range}</p>
            <p><strong>Price:</strong> ₹{event.price}</p>
            <p>{event.description}</p>

            <div className="rating-section">
              <p><strong>Your Rating:</strong></p>
              {[...Array(5)].map((_, index) => (
                <span
                  key={index}
                  className={index < rating ? "star filled" : "star"}
                  onClick={() => setRating(index + 1)}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="popup-right">
          <h3>Available Dates</h3>
          <Calendar
            tileClassName={({ date, view }) =>
              bookedDates.includes(date.toISOString().split("T")[0])
                ? "booked-date"
                : "available-date"
            }
          />
          <button className="popup-book-now-btn" onClick={handleBooking}>Book Now</button>
        </div>
      </div>
    </div>
  );
}

/*import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { db } from "../../Firebase/Firebase";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "./AuthContext";
import "./EventBookingPopup.css";

const EventBookingPopup = ({ event, onClose }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [userData, setUserData] = useState({
    name: "",
    contact: "",
    address: "",
  });
  const [paymentOption, setPaymentOption] = useState("advance");
  const { currentUser } = useAuth();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleBooking = async () => {
    if (!selectedDate || !userData.name || !userData.contact || !userData.address) {
      alert("Please fill all details");
      return;
    }

    let amount = paymentOption === "advance" ? 2000 : event.price;
    let remainingAmount = paymentOption === "advance" ? event.price - 2000 : 0;

    const options = {
      key: "YOUR_RAZORPAY_KEY",
      amount: amount * 100,
      currency: "INR",
      name: "Event Booking",
      description: event.eventName,
      handler: async (response) => {
        await addDoc(collection(db, "bookings"), {
          userId: currentUser.uid,
          eventId: event.id,
          eventName: event.eventName,
          date: selectedDate,
          userData,
          paymentStatus: "Paid",
          remainingAmount,
        });
        alert("Booking successful");
        onClose();
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="event-popup-container">
      <div className="event-details">
        <img src={event.image} alt={event.eventName} className="event-image" />
        <h2 className="event-title">{event.eventName}</h2>
        <p><strong>Type:</strong> {event.type}</p>
        <p><strong>Range:</strong> {event.range}</p>
        <p><strong>Price:</strong> ₹{event.price}</p>
        <p><strong>Ratings:</strong> ⭐{event.ratings}</p>
        <p className="event-description">{event.description}</p>
      </div>
      <div className="booking-section">
        <h3 className="section-title">Select Date</h3>
        <Calendar 
          onChange={setSelectedDate} 
          value={selectedDate} 
          tileClassName={({ date }) => event.bookedDates.includes(date.toISOString().split('T')[0]) ? "booked-date" : ""}
        />
        <h3 className="section-title">User Details</h3>
        <input 
          type="text" 
          placeholder="Name" 
          value={userData.name} 
          onChange={(e) => setUserData({...userData, name: e.target.value})} 
          className="input-field" 
        />
        <input 
          type="text" 
          placeholder="Contact" 
          value={userData.contact} 
          onChange={(e) => setUserData({...userData, contact: e.target.value})} 
          className="input-field" 
        />
        <input 
          type="text" 
          placeholder="Address" 
          value={userData.address} 
          onChange={(e) => setUserData({...userData, address: e.target.value})} 
          className="input-field" 
        />
        <h3 className="section-title">Payment Options</h3>
        <select onChange={(e) => setPaymentOption(e.target.value)} className="input-field">
          <option value="advance">₹2000 Advance, Remaining on Event</option>
          <option value="full">Full Payment (₹{event.price})</option>
        </select>
        <button onClick={handleBooking} className="booking-button">Proceed to Payment</button>
        <button onClick={onClose} className="close-button">Close</button>
      </div>
    </div>
  );
};

export default EventBookingPopup;
/*
/*import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
//import { Dialog } from "@/components/ui/dialog";
//import { Button } from "@/components/ui/button";
import { db } from "../../Firebase/Firebase";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "./AuthContext";
import Razorpay from "razorpay";
import "./EventBookingPopup.css";

const EventBookingPopup = ({ event, onClose }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [userData, setUserData] = useState({
    name: "",
    contact: "",
    address: "",
  });
  const [paymentOption, setPaymentOption] = useState("advance");
  const { currentUser } = useAuth();

  const handleBooking = async () => {
    if (!selectedDate || !userData.name || !userData.contact || !userData.address) {
      alert("Please fill all details");
      return;
    }

    let amount = paymentOption === "advance" ? 2000 : event.price;
    let remainingAmount = paymentOption === "advance" ? event.price - 2000 : 0;

    const paymentHandler = new Razorpay({
      key: "YOUR_RAZORPAY_KEY",
      amount: amount * 100,
      currency: "INR",
      name: "Event Booking",
      description: event.eventName,
      handler: async (response) => {
        await addDoc(collection(db, "bookings"), {
          userId: currentUser.uid,
          eventId: event.id,
          eventName: event.eventName,
          date: selectedDate,
          userData,
          paymentStatus: "Paid",
          remainingAmount,
        });
        alert("Booking successful");
        onClose();
      },
    });
    paymentHandler.open();
  };

  return (
    <Dialog open onOpenChange={onClose} className="event-dialog">
      <div className="event-popup-container">
        <div className="event-details">
          <img src={event.image} alt={event.eventName} className="event-image" />
          <h2 className="event-title">{event.eventName}</h2>
          <p><strong>Type:</strong> {event.type}</p>
          <p><strong>Range:</strong> {event.range}</p>
          <p><strong>Price:</strong> ₹{event.price}</p>
          <p><strong>Ratings:</strong> ⭐{event.ratings}</p>
          <p className="event-description">{event.description}</p>
        </div>
        <div className="booking-section">
          <h3 className="section-title">Select Date</h3>
          <Calendar onChange={setSelectedDate} value={selectedDate} 
            tileClassName={({ date }) => event.bookedDates.includes(date.toISOString().split('T')[0]) ? "booked-date" : ""} />
          <h3 className="section-title">User Details</h3>
          <input type="text" placeholder="Name" value={userData.name} 
            onChange={(e) => setUserData({...userData, name: e.target.value})} className="input-field" />
          <input type="text" placeholder="Contact" value={userData.contact} 
            onChange={(e) => setUserData({...userData, contact: e.target.value})} className="input-field" />
          <input type="text" placeholder="Address" value={userData.address} 
            onChange={(e) => setUserData({...userData, address: e.target.value})} className="input-field" />
          <h3 className="section-title">Payment Options</h3>
          <select onChange={(e) => setPaymentOption(e.target.value)} className="input-field">
            <option value="advance">₹2000 Advance, Remaining on Event</option>
            <option value="full">Full Payment (₹{event.price})</option>
          </select>
          <Button onClick={handleBooking} className="booking-button">Proceed to Payment</Button>
        </div>
      </div>
    </Dialog>
  );
};

export default EventBookingPopup;
*/