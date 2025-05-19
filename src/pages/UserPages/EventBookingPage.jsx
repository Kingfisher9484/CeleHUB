// Paste this into your EventBookingPage.jsx

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { db, auth } from "../../../Firebase/Firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import html2pdf from "html2pdf.js";
import "./EventBookingPage.css";

export default function EventBookingPage() {
  const { eventId } = useParams();
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    address: "",
    pincode: "",
    phone: "",
    email: "",
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [event, setEvent] = useState(null);
  const [userId, setUserId] = useState(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const [pdfData, setPdfData] = useState(null);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [adminPayment, setAdminPayment] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        setUserId(auth.currentUser.uid);
      }
    };

    const fetchEventDetails = async () => {
      const snap = await getDoc(doc(db, "events", eventId));
      if (snap.exists()) setEvent(snap.data());
    };

    const fetchBookedDates = async () => {
      const q = query(
        collection(db, "bookings"),
        where("eventId", "==", eventId)
      );
      const snapshot = await getDocs(q);
      setBookedDates(snapshot.docs.map((doc) => doc.data().eventDate));
    };

    const fetchAdminPayment = async () => {
      const snapshot = await getDocs(collection(db, "adminPayment"));
      const data = snapshot.docs.map((doc) => doc.data());
      if (data.length > 0) setAdminPayment(data[0]);
    };

    fetchUserData();
    fetchEventDetails();
    fetchBookedDates();
    fetchAdminPayment();
  }, [eventId]);

  const handleBooking = async () => {
    if (buttonDisabled) return;

    if (
      !user.firstName ||
      !user.lastName ||
      !user.phone ||
      !user.email ||
      !selectedDate
    ) {
      alert("Please fill in all required fields and select a date.");
      return;
    }

    const formattedDate = new Date(selectedDate).toISOString().split("T")[0];
    if (bookedDates.includes(formattedDate)) {
      alert("This date is already booked.");
      return;
    }

    if (!auth.currentUser) {
      alert("You must be logged in to book.");
      return;
    }

    try {
      setButtonDisabled(true);
      const bookingData = {
        userId,
        eventId,
        eventName: event?.eventName,
        eventType: event?.type,
        createdDate: new Date().toISOString(),
        eventDate: formattedDate,
        ...user,
        price: event?.price || 0,
        paymentStatus: "pending",
        viewedByAdmin: false,
        acceptedByAdmin: false,
      };

      const docRef = await addDoc(collection(db, "bookings"), bookingData);
      setPdfData({ ...bookingData, id: docRef.id });
      setPopupVisible(true);
    } catch (error) {
      alert("Booking failed: " + error.message);
      setButtonDisabled(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!pdfData) return;

    let base64Image = "";
    try {
      const blob = await fetch(event?.mediaUrl).then((res) => res.blob());
      base64Image = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Image fetch failed:", error);
    }

    const div = document.createElement("div");
    div.innerHTML = `
      <div style="padding: 20px; font-family: Arial;">
        <h2>Booking Confirmation</h2>
        <img src="${base64Image}" style="width:100%; max-height:300px; object-fit:cover;" />
        <p><strong>Booking ID:</strong> ${pdfData.id}</p>
        <p><strong>Event:</strong> ${pdfData.eventName}</p>
        <p><strong>Date:</strong> ${pdfData.eventDate}</p>
        <p><strong>Name:</strong> ${pdfData.firstName} ${pdfData.lastName}</p>
        <p><strong>Email:</strong> ${pdfData.email}</p>
        <p><strong>Status:</strong> Pending</p>
        <h3><strong>Amount:</strong> ₹${pdfData.price}</h3>
        <h3>Payment Details</h3>
        ${
          adminPayment?.imageUrl
            ? `<img src="${adminPayment.imageUrl}" style="width:200px;" />`
            : ""
        }
        <p>Phone: ${adminPayment?.paymentNumber}</p>
        <p>UPI: ${adminPayment?.upiId}</p>
        <p>Account No: ${adminPayment?.accountNumber}</p>
        <p style="color:green;"><strong>Pay ₹2000 in advance to confirm booking after admin verification.</strong></p>
      </div>
    `;

    html2pdf()
      .set({
        margin: 0.5,
        filename: "booking_confirmation.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      })
      .from(div)
      .save();
  };

  return (
    <div className="booking-lr-container">
      <div className="booking-left">
        <div className="user-inputs">
          {["firstName", "lastName", "address", "pincode", "phone", "email"].map(
            (field) => (
              <input
                key={field}
                type={field === "email" ? "email" : "text"}
                placeholder={field.replace(/^\w/, (c) => c.toUpperCase())}
                value={user[field]}
                onChange={(e) =>
                  setUser({ ...user, [field]: e.target.value })
                }
              />
            )
          )}
        </div>

        <h3>Select Event Date</h3>
        <Calendar
          onClickDay={(date) => setSelectedDate(date)}
          tileClassName={({ date }) => {
            const formatted = date.toISOString().split("T")[0];
            if (bookedDates.includes(formatted)) return "booked-date";
            if (
              selectedDate &&
              formatted === selectedDate.toISOString().split("T")[0]
            )
              return "selected-date";
            return "available-date";
          }}
        />
      </div>

      <div className="booking-right">
        <h2>Book {event?.eventName}</h2>
        <img
          src={event?.mediaUrl}
          alt={event?.eventName}
          className="user-book-img"
        />
        <p className="event-price">Price: ₹{event?.price}</p>

        {adminPayment && (
          <div className="admin-payment-info">
            <h3>Pay to this account</h3>
            <img
              src={adminPayment.imageUrl}
              alt="Scanner"
              className="payment-scanner"
            />
            <p><strong>Phone/Pay Number:</strong> {adminPayment.paymentNumber}</p>
            <p><strong>UPI ID:</strong> {adminPayment.upiId}</p>
            <p><strong>Bank A/C Number:</strong> {adminPayment.accountNumber}</p>
          </div>
        )}
        <p className="payment-note" style={{ color: "green" }}>
          <strong>Note:</strong> Make a minimum payment of ₹2000 in advance.
          After verification, admin will confirm your booking.
        </p>

        <button
          className="pay-button"
          onClick={handleBooking}
          disabled={buttonDisabled}
        >
          Proceed to Pay
        </button>
      </div>

      {popupVisible && (
        <div className="popup">
          <div className="popup-content">
            <div className="checkmark-animation">✅</div>
            <p>Booking successful! Your invoice is being downloaded.</p>
            <button
              onClick={() => {
                setPopupVisible(false);
                handleDownloadPDF();
              }}
            >
              OK
            </button>
            <button onClick={() => setPopupVisible(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
