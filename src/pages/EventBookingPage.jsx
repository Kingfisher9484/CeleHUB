// //NEW RAZOR PAY INTEGRATED
// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import Calendar from "react-calendar";
// import "react-calendar/dist/Calendar.css";
// import { db, auth } from "../../Firebase/Firebase";
// import { collection, addDoc, getDocs, doc, getDoc, query, where } from "firebase/firestore";
// import "./EventBookingPage.css";

// export default function EventBookingPage() {
//   const { eventId } = useParams();
//   const [user, setUser] = useState({ firstName: "", lastName: "", address: "", pincode: "", phone: "", email: "" });
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [bookedDates, setBookedDates] = useState([]);
//   const [event, setEvent] = useState(null);
//   const [userId, setUserId] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       if (auth.currentUser) {
//         setUserId(auth.currentUser.uid);
//         const userRef = doc(db, "users", auth.currentUser.uid);
//         const userSnap = await getDoc(userRef);
//         if (userSnap.exists()) {
//           const userData = userSnap.data();
//           setUser(prev => ({
//             ...prev,
//             firstName: userData.firstName || "",
//             lastName: userData.lastName || "",
//             address: userData.address || "",
//             pincode: userData.pincode || "",
//             phone: userData.phone || "",
//             email: userData.email || "",
//           }));
//         }
//       }

//       const eventRef = doc(db, "events", eventId);
//       const eventSnap = await getDoc(eventRef);
//       if (eventSnap.exists()) setEvent(eventSnap.data());

//       const q = query(collection(db, "bookings"), where("eventId", "==", eventId));
//       const snapshot = await getDocs(q);
//       const dates = snapshot.docs.map((doc) => doc.data().eventDate);
//       setBookedDates(dates);
//     };

//     fetchData();
//   }, [eventId]);

//   const handlePayment = async () => {
//     if (!user.firstName || !user.lastName || !user.phone || !user.email || !selectedDate) {
//       alert("Please complete all fields and select a date.");
//       return;
//     }

//     const formattedDate = new Date(selectedDate).toISOString().split("T")[0];
//     if (bookedDates.includes(formattedDate)) {
//       alert("This date is already booked. Choose another.");
//       return;
//     }

//     const options = {
//       key: "YOUR_RAZORPAY_KEY_ID", // Replace with your Razorpay Key ID
//       amount: event.price * 100,
//       currency: "INR",
//       name: "CeleHub Events",
//       description: event.eventName,
//       image: event.mediaUrl,
//       handler: async function (response) {
//         // On payment success
//         await saveBooking(formattedDate, "paid");
//         alert("Payment successful!");
//       },
//       prefill: {
//         name: user.firstName + " " + user.lastName,
//         email: user.email,
//         contact: user.phone,
//       },
//       theme: { color: "#7b4c94" },
//     };

//     const razor = new window.Razorpay(options);
//     razor.open();
//   };

//   const saveBooking = async (eventDate, status) => {
//     try {
//       const bookingData = {
//         userId,
//         eventId,
//         eventName: event?.eventName,
//         eventType: event?.type,
//         createdDate: new Date().toISOString(),
//         eventDate,
//         ...user,
//         price: event?.price || 0,
//         paymentStatus: status,
//         viewedByAdmin: false,
//       };

//       await addDoc(collection(db, "bookings"), bookingData);
//     } catch (error) {
//       console.error("Booking save error:", error);
//     }
//   };



// Simulate payment success
//   const mockStatus = "paid"; // We'll mark it as paid for now

//   try {
//     const bookingData = {
//       userId,
//       eventId,
//       eventName: event?.eventName,
//       eventType: event?.type,
//       createdDate: new Date().toISOString(),
//       eventDate: formattedDate,
//       ...user,
//       price: event?.price || 0,
//       paymentStatus: mockStatus,
//       viewedByAdmin: false,
//     };

//     await addDoc(collection(db, "bookings"), bookingData);
//     navigate("/booking-confirmation"); // 🧭 Navigate to confirmation
//   } catch (error) {
//     console.error("Error saving simulated booking:", error);
//     alert("Failed to simulate booking.");
//   }
// };




//   return (
//     <div className="booking-container">
//       <div className="booking-left">
//         <div className="user-inputs">
//           <input type="text" placeholder="First Name" value={user.firstName} onChange={(e) => setUser(prev => ({ ...prev, firstName: e.target.value }))} />
//           <input type="text" placeholder="Last Name" value={user.lastName} onChange={(e) => setUser(prev => ({ ...prev, lastName: e.target.value }))} />
//           <input type="text" placeholder="Address" value={user.address} onChange={(e) => setUser(prev => ({ ...prev, address: e.target.value }))} />
//           <input type="text" placeholder="Pincode" value={user.pincode} onChange={(e) => setUser(prev => ({ ...prev, pincode: e.target.value }))} />
//           <input type="text" placeholder="Phone" value={user.phone} onChange={(e) => setUser(prev => ({ ...prev, phone: e.target.value }))} />
//           <input type="email" placeholder="Email" value={user.email} onChange={(e) => setUser(prev => ({ ...prev, email: e.target.value }))} />
//         </div>

//         <h3>Select Event Date</h3>
//         <Calendar
//           onClickDay={(date) => setSelectedDate(date)}
//           tileClassName={({ date }) => bookedDates.includes(date.toISOString().split("T")[0]) ? "booked-date" : "available-date"}
//         />
//       </div>
//       <div className="booking-right">
//         <h2>Book {event?.eventName}</h2>
//         <img src={event?.mediaUrl} alt={event?.eventName} className="user-book-img" />
//         <p className="event-price">Price: ₹{event?.price}</p>
//         <button className="pay-button" onClick={handlePayment}>Proceed to Pay</button>
//       </div>
//     </div>
//   );
// }















import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { db, auth } from "../../Firebase/Firebase";
import { collection, addDoc, getDocs, doc, getDoc, query, where, deleteDoc } from "firebase/firestore";
import "./EventBookingPage.css";
import html2pdf from "html2pdf.js";

import emailjs from "emailjs-com";

export default function EventBookingPage() {
  const { eventId } = useParams();
  const [user, setUser] = useState({ firstName: "", lastName: "", address: "", pincode: "", phone: "", email: "" });
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [event, setEvent] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        setUserId(auth.currentUser.uid);
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setIsAdmin(userSnap.data().role === "admin");
        }
      }
    };

    const fetchEventDetails = async () => {
      try {
        const eventRef = doc(db, "events", eventId);
        const eventSnap = await getDoc(eventRef);
        if (eventSnap.exists()) {
          setEvent(eventSnap.data());
        } else {
          console.error("Event not found");
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


  // ... your existing code

  const handleBooking = async () => {
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
      };

      const docRef = await addDoc(collection(db, "bookings"), bookingData);

      // ✅ Create printable content in DOM
      const pdfContainer = document.createElement("div");
      pdfContainer.id = "bookings-print-area";
      pdfContainer.style.display = "none"; // hide from screen

      pdfContainer.innerHTML = `
  <div style="
    font-family: Arial, sans-serif;
    color: #000;
    background-color: #fff;
    padding: 20px;
    width: 100%;
    box-sizing: border-box;
  ">
    <h2 style="text-align:center; margin-bottom: 20px;">Booking Confirmation</h2>
    <img src="${event?.mediaUrl}" alt="Event Image" style="width:100%; max-height:300px; object-fit:cover; margin-bottom: 20px;" />
    <p><strong>Booking ID:</strong> ${docRef.id}</p>
    <p><strong>Event:</strong> ${bookingData.eventName}</p>
    <p><strong>Type:</strong> ${bookingData.eventType}</p>
    <p><strong>Event Date:</strong> ${formattedDate}</p>
    <p><strong>Booked On:</strong> ${new Date().toLocaleDateString()}</p>
    <p><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
    <p><strong>Email:</strong> ${user.email}</p>
    <p><strong>Phone:</strong> ${user.phone}</p>
    <p><strong>Price:</strong> ₹${bookingData.price}</p>
    <p><strong>Status:</strong> Pending</p>
  </div>
`;


      document.body.appendChild(pdfContainer);

      // ✅ Generate PDF
      const opt = {
        margin: 0.5,
        filename: "booking_confirmation.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      };

      html2pdf().set(opt).from(pdfContainer).save().then(() => {
        document.body.removeChild(pdfContainer); // clean up
        alert("Booking successful! Confirmation PDF downloaded.");

      });

    } catch (error) {
      console.error("Error booking event:", error);
      alert(`Booking failed. Try again. Error: ${error.message}`);
    }
  };



  return (
    <div className="booking-container">
      <div className="booking-left">
        <div className="user-inputs">
          <input type="text" placeholder="First Name" value={user.firstName} onChange={(e) => setUser((prev) => ({ ...prev, firstName: e.target.value }))} />
          <input type="text" placeholder="Last Name" value={user.lastName} onChange={(e) => setUser((prev) => ({ ...prev, lastName: e.target.value }))} />
          <input type="text" placeholder="Address" value={user.address} onChange={(e) => setUser((prev) => ({ ...prev, address: e.target.value }))} />
          <input type="text" placeholder="Pincode" value={user.pincode} onChange={(e) => setUser((prev) => ({ ...prev, pincode: e.target.value }))} />
          <input type="text" placeholder="Phone" value={user.phone} onChange={(e) => setUser((prev) => ({ ...prev, phone: e.target.value }))} />
          <input type="email" placeholder="Email" value={user.email} onChange={(e) => setUser((prev) => ({ ...prev, email: e.target.value }))} />
        </div>

        <h3>Select Event Date</h3>
        <Calendar
          onClickDay={(date) => setSelectedDate(date.toISOString().split("T")[0])}
          tileClassName={({ date }) => bookedDates.includes(date.toISOString().split("T")[0]) ? "booked-date" : "available-date"}
        />
      </div>
      <div className="booking-right">
        <h2>Book {event?.eventName}</h2>
        <img src={event?.mediaUrl} alt={event?.eventName} className="user-book-img" />
        <p className="event-price">Price: ₹{event?.price}</p>
        <button className="pay-button" onClick={handleBooking}>Proceed to Pay</button>
      </div>
    </div>
  );
}