import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { db, auth } from "../../Firebase/Firebase";
import { collection, addDoc, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import html2pdf from "html2pdf.js";
import "./EventBookingPage.css";

export default function EventBookingPage() {
  const { eventId } = useParams();
  const [user, setUser] = useState({ firstName: "", lastName: "", address: "", pincode: "", phone: "", email: "" });
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [event, setEvent] = useState(null);
  const [userId, setUserId] = useState(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const [pdfData, setPdfData] = useState(null);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        setUserId(auth.currentUser.uid);
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
      }
    };

    const fetchEventDetails = async () => {
      try {
        const eventRef = doc(db, "events", eventId);
        const eventSnap = await getDoc(eventRef);
        if (eventSnap.exists()) {
          setEvent(eventSnap.data());
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
      }
    };

    const fetchBookedDates = async () => {
      try {
        const q = query(collection(db, "bookings"), where("eventId", "==", eventId));
        const querySnapshot = await getDocs(q);
        const dates = querySnapshot.docs.map((doc) => doc.data().eventDate);
        setBookedDates(dates);
      } catch (error) {
        console.error("Error fetching booked dates:", error);
      }
    };

    fetchUserData();
    fetchEventDetails();
    fetchBookedDates();
  }, [eventId]);

  const handleBooking = async () => {
    if (buttonDisabled) return;

    if (!user.firstName || !user.lastName || !user.phone || !user.email) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!selectedDate) {
      alert("Please select an event date.");
      return;
    }

    const formattedDate = new Date(selectedDate).toISOString().split("T")[0];

    if (bookedDates.includes(formattedDate)) {
      alert("This date is already booked. Please choose another date.");
      return;
    }

    if (!auth.currentUser) {
      alert("You need to log in to book an event.");
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
        acceptedByAdmin: false
      };

      const docRef = await addDoc(collection(db, "bookings"), bookingData);
      setPdfData({ ...bookingData, id: docRef.id });
      setPopupVisible(true);
    } catch (error) {
      console.error("Error booking event:", error);
      alert(`Booking failed. Try again. Error: ${error.message}`);
      setButtonDisabled(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!pdfData) return;

    let base64Image = "";
    try {
      const imageBlob = await fetch(event?.mediaUrl, { mode: 'cors' }).then(r => r.blob());
      base64Image = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(imageBlob);
      });
    } catch (error) {
      console.error("Failed to load image for PDF:", error);
    }

    const pdfContent = document.createElement("div");
    pdfContent.innerHTML = `
    <div style="padding: 20px; font-family: Arial;">
      <h2>Booking Confirmation</h2>
      <img src="${base64Image}" alt="Event" style="width:100%; max-height:100%; object-fit:cover;"/>
      <p><strong>Booking ID:</strong> ${pdfData.id}</p>
      <p><strong>Event:</strong> ${pdfData.eventName}</p>
      <p><strong>Type:</strong> ${pdfData.eventType}</p>
      <p><strong>Event Date:</strong> ${pdfData.eventDate}</p>
      <p><strong>Booked On:</strong> ${new Date(pdfData.createdDate).toLocaleDateString()}</p>
      <p><strong>Name:</strong> ${pdfData.firstName} ${pdfData.lastName}</p>
      <p><strong>Email:</strong> ${pdfData.email}</p>
      <p><strong>Phone:</strong> ${pdfData.phone}</p>
      <p><strong>Status:</strong> Pending</p>
      <h2/>
      <h3><strong>Price:</strong> ₹${pdfData.price}</h3>
    </div>
  `;

    html2pdf().set({
      margin: 0.5,
      filename: "booking_confirmation.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    }).from(pdfContent).save();
  };

  return (
    <div className="booking-container">
      <div className="booking-left">
        <div className="user-inputs">
          <input type="text" placeholder="First Name" value={user.firstName} onChange={(e) => setUser({ ...user, firstName: e.target.value })} />
          <input type="text" placeholder="Last Name" value={user.lastName} onChange={(e) => setUser({ ...user, lastName: e.target.value })} />
          <input type="text" placeholder="Address" value={user.address} onChange={(e) => setUser({ ...user, address: e.target.value })} />
          <input type="text" placeholder="Pincode" value={user.pincode} onChange={(e) => setUser({ ...user, pincode: e.target.value })} />
          <input type="text" placeholder="Phone" value={user.phone} onChange={(e) => setUser({ ...user, phone: e.target.value })} />
          <input type="email" placeholder="Email" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} />
        </div>

        <h3>Select Event Date</h3>
        <Calendar
          onClickDay={(date) => setSelectedDate(date)}
          tileClassName={({ date }) => bookedDates.includes(date.toISOString().split("T")[0]) ? "booked-date" : "available-date"}
        />
      </div>

      <div className="booking-right">
        <h2>Book {event?.eventName}</h2>
        <img src={event?.mediaUrl} alt={event?.eventName} className="user-book-img" />
        <p className="event-price">Price: ₹{event?.price}</p>
        <button className="pay-button" onClick={handleBooking} disabled={buttonDisabled}>Proceed to Pay</button>
      </div>

      {popupVisible && (
        <div className="popup">
          <div className="popup-content">
            <div className="checkmark-animation">✅</div>
            <p>Booking successful! Your invoice is being downloaded.</p>
            <button onClick={() => { setPopupVisible(false); handleDownloadPDF(); }}>OK</button>
            <button onClick={() => setPopupVisible(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
