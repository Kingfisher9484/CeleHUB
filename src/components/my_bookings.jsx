import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { db } from "../../Firebase/Firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
// import jsPDF from "jspdf";
// import "jspdf-autotable"; // ✅ Auto-registers itself — DO NOT manually assign it

import html2pdf from "html2pdf.js";

import "./my_bookings.css";

// Register the plugin
// jsPDF.prototype.autoTable = autoTable;

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;

    const fetchBookings = async () => {
      try {
        const q = query(collection(db, "bookings"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        const bookingList = querySnapshot.docs.map((doc, index) => ({
          serial: index + 1,
          id: doc.id,
          ...doc.data()
        }));
        setBookings(bookingList);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [userId]);

  const filteredBookings = bookings.filter((booking) => {
    const search = searchTerm.toLowerCase();
    return (
      booking.eventName.toLowerCase().includes(search) ||
      new Date(booking.createdDate).toLocaleDateString().includes(search) ||
      new Date(booking.eventDate).toLocaleDateString().includes(search) ||
      booking.price.toString().includes(search)
    );
  });

  const completed = filteredBookings.filter((b) => b.completed);
  const ongoing = filteredBookings.filter((b) => !b.completed);

//   const exportToPDF = () => {
//     const doc = new jsPDF();
//     doc.text("My Bookings", 14, 20);
  
//     const head = [["S.No", "Event", "Created", "Event Date", "Price", "Viewed", "Status"]];
//     const body = filteredBookings.map((b, i) => [
//       i + 1,
//       b.eventName,
//       new Date(b.createdDate).toLocaleDateString(),
//       new Date(b.eventDate).toLocaleDateString(),
//       `₹${b.price}`,
//       b.viewedByAdmin ? "✔✔" : "✔",
//       b.completed || new Date(b.eventDate) < new Date() ? "✅" : "⏳"
//     ]);
  
//     doc.autoTable({
//       head,
//       body,
//       startY: 30
//     });
  
//     doc.save("My_Bookings.pdf");
//   };
  

const exportToPDF = () => {
  const element = document.getElementById("bookings-print-area");
  const opt = {
    margin:       0.5,
    filename:     'My_Bookings.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(element).save();
};

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const printContent = document.getElementById("bookings-print-area").innerHTML;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print My Bookings</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ccc;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f3f4f6;
            }
          </style>
        </head>
        <body>
          <h2>📋 My Bookings</h2>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="bookings-wrapper">
      {/*<h2 className="heading">📋 My Bookings</h2>*/}

      <input
        className="search-input"
        type="text"
        placeholder="Search Event, Date or Price..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="export-controls">
        <button onClick={exportToPDF} className="export-btn">📄 Export as PDF</button>
        <button onClick={handlePrint} className="print-btn">🖨️ Print Bookings</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div id="bookings-print-area">
          <BookingTable title="🟢 Ongoing Bookings" bookings={ongoing} navigate={navigate} />
          <BookingTable title="✅ Completed Bookings" bookings={completed} navigate={navigate} />
        </div>
      )}
    </div>
  );
}

function BookingTable({ title, bookings, navigate }) {
  if (bookings.length === 0) return null;

  return (
    <div className="table-section">
      <h3>{title}</h3>
      <table className="bookings-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Event</th>
            <th>Created</th>
            <th>Event Date</th>
            <th>Price</th>
            <th>Viewed</th>
            <th>Status</th>
            <th>Open</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking, index) => (
            <tr key={booking.id}>
              <td>#{index + 1}</td>
              <td>{booking.eventName}</td>
              <td>{new Date(booking.createdDate).toLocaleDateString()}</td>
              <td>{new Date(booking.eventDate).toLocaleDateString()}</td>
              <td>₹{booking.price}</td>
              <td>{booking.viewedByAdmin ? 
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check2-all" viewBox="0 0 16 16">
                    <path d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0zm-4.208 7-.896-.897.707-.707.543.543 6.646-6.647a.5.5 0 0 1 .708.708l-7 7a.5.5 0 0 1-.708 0" />
                    <path d="m5.354 7.146.896.897-.707.707-.897-.896a.5.5 0 1 1 .708-.708" />
                </svg>
                  :
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check2" viewBox="0 0 16 16">
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0" />
              </svg>}
              </td>
              <td>{booking.completed || new Date(booking.eventDate) < new Date() ?
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-patch-check-fill" viewBox="0 0 16 16">
                    <path d="M10.067.87a2.89 2.89 0 0 0-4.134 0l-.622.638-.89-.011a2.89 2.89 0 0 0-2.924 2.924l.01.89-.636.622a2.89 2.89 0 0 0 0 4.134l.637.622-.011.89a2.89 2.89 0 0 0 2.924 2.924l.89-.01.622.636a2.89 2.89 0 0 0 4.134 0l.622-.637.89.011a2.89 2.89 0 0 0 2.924-2.924l-.01-.89.636-.622a2.89 2.89 0 0 0 0-4.134l-.637-.622.011-.89a2.89 2.89 0 0 0-2.924-2.924l-.89.01zm.287 5.984-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708.708" />
                </svg>
                 :
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-patch-check" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M10.354 6.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708 0" />
                    <path d="m10.273 2.513-.921-.944.715-.698.622.637.89-.011a2.89 2.89 0 0 1 2.924 2.924l-.01.89.636.622a2.89 2.89 0 0 1 0 4.134l-.637.622.011.89a2.89 2.89 0 0 1-2.924 2.924l-.89-.01-.622.636a2.89 2.89 0 0 1-4.134 0l-.622-.637-.89.011a2.89 2.89 0 0 1-2.924-2.924l.01-.89-.636-.622a2.89 2.89 0 0 1 0-4.134l.637-.622-.011-.89a2.89 2.89 0 0 1 2.924-2.924l.89.01.622-.636a2.89 2.89 0 0 1 4.134 0l-.715.698a1.89 1.89 0 0 0-2.704 0l-.92.944-1.32-.016a1.89 1.89 0 0 0-1.911 1.912l.016 1.318-.944.921a1.89 1.89 0 0 0 0 2.704l.944.92-.016 1.32a1.89 1.89 0 0 0 1.912 1.911l1.318-.016.921.944a1.89 1.89 0 0 0 2.704 0l.92-.944 1.32.016a1.89 1.89 0 0 0 1.911-1.912l-.016-1.318.944-.921a1.89 1.89 0 0 0 0-2.704l-.944-.92.016-1.32a1.89 1.89 0 0 0-1.912-1.911z" />
                </svg>    
               }</td>
              <td>
                <button
                  onClick={() => navigate(`/userBooking/${booking.id}`)}
                  className="open-booking-btn"
                >
                  Open
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MyBookings;

//   // Fetch bookings when userId is set
//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         setUserId(user.uid); // Update userId state when authentication state changes
//       } else {
//         setUserId(null);
//       }
//     });

//     return () => unsubscribe(); // Cleanup listener on unmount
//   }, [auth]);

//   useEffect(() => {
//     if (!userId) return; // Only fetch if userId is available

//     const fetchBookings = async () => {
//       try {
//         const q = query(collection(db, "bookings"), where("userId", "==", userId));
//         const querySnapshot = await getDocs(q);
//         const bookingList = querySnapshot.docs.map((doc, index) => ({
//           serial: index + 1,
//           id: doc.id,
//           ...doc.data()
//         }));
//         setBookings(bookingList);
//       } catch (error) {
//         console.error("Error fetching bookings:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBookings();
//   }, [userId]); // Fetch bookings only when userId updates
              {/* <div className="user-bookings-section">
                <h2 className="heading">My Bookings</h2>
                {loading ? (
                  <p>Loading...</p>
                ) : bookings.length > 0 ? (
                  <div className="bookings-container">
                    <div className="booking-card header">
                      <p><strong>S.No</strong></p>
                      <p><strong>Event</strong></p>
                      <p><strong>Created</strong></p>
                      <p><strong>Event Date</strong></p>
                      <p><strong>Price</strong></p>
                      <p><strong>View</strong></p>
                      <p><strong>Status</strong></p>
                      <p><strong>Open</strong></p>
                    </div>

                    {bookings.map((booking) => (
                      <div key={booking.id} className="booking-card">
                        <p>#{booking.serial}</p>
                        <p>{booking.eventName}</p>
                        <p>{new Date(booking.createdDate).toLocaleDateString()}</p>
                        <p>{new Date(booking.eventDate).toLocaleDateString()}</p>
                        <p> ₹{booking.price}</p>
                        <p>
                          {booking.viewedByAdmin ?
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check2-all" viewBox="0 0 16 16">
                              <path d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0zm-4.208 7-.896-.897.707-.707.543.543 6.646-6.647a.5.5 0 0 1 .708.708l-7 7a.5.5 0 0 1-.708 0" />
                              <path d="m5.354 7.146.896.897-.707.707-.897-.896a.5.5 0 1 1 .708-.708" />
                            </svg>
                            :
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check2" viewBox="0 0 16 16">
                              <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0" />
                            </svg>}
                        </p>
                        <p>
                          {booking.completed || new Date(booking.eventDate) < new Date() ?
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-patch-check-fill" viewBox="0 0 16 16">
                              <path d="M10.067.87a2.89 2.89 0 0 0-4.134 0l-.622.638-.89-.011a2.89 2.89 0 0 0-2.924 2.924l.01.89-.636.622a2.89 2.89 0 0 0 0 4.134l.637.622-.011.89a2.89 2.89 0 0 0 2.924 2.924l.89-.01.622.636a2.89 2.89 0 0 0 4.134 0l.622-.637.89.011a2.89 2.89 0 0 0 2.924-2.924l-.01-.89.636-.622a2.89 2.89 0 0 0 0-4.134l-.637-.622.011-.89a2.89 2.89 0 0 0-2.924-2.924l-.89.01zm.287 5.984-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708.708" />
                            </svg> :
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-patch-check" viewBox="0 0 16 16">
                              <path fillRule="evenodd" d="M10.354 6.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708 0" />
                              <path d="m10.273 2.513-.921-.944.715-.698.622.637.89-.011a2.89 2.89 0 0 1 2.924 2.924l-.01.89.636.622a2.89 2.89 0 0 1 0 4.134l-.637.622.011.89a2.89 2.89 0 0 1-2.924 2.924l-.89-.01-.622.636a2.89 2.89 0 0 1-4.134 0l-.622-.637-.89.011a2.89 2.89 0 0 1-2.924-2.924l.01-.89-.636-.622a2.89 2.89 0 0 1 0-4.134l.637-.622-.011-.89a2.89 2.89 0 0 1 2.924-2.924l.89.01.622-.636a2.89 2.89 0 0 1 4.134 0l-.715.698a1.89 1.89 0 0 0-2.704 0l-.92.944-1.32-.016a1.89 1.89 0 0 0-1.911 1.912l.016 1.318-.944.921a1.89 1.89 0 0 0 0 2.704l.944.92-.016 1.32a1.89 1.89 0 0 0 1.912 1.911l1.318-.016.921.944a1.89 1.89 0 0 0 2.704 0l.92-.944 1.32.016a1.89 1.89 0 0 0 1.911-1.912l-.016-1.318.944-.921a1.89 1.89 0 0 0 0-2.704l-.944-.92.016-1.32a1.89 1.89 0 0 0-1.912-1.911z" />
                            </svg>
                          }
                        </p>
                        <button className="open-booking-btn" onClick={() => navigate(`/userBooking/${booking.id}`)}>Open</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-booking-found"><i className="bi bi-exclamation-octagon"></i>No bookings found.....</p>
                )}
              </div> */}
            

              // <>
              //   <h2 className="heading">📋 My Bookings</h2>
              //   <div className="user-bookings-section">
              //     <h2 className="heading">My Bookings</h2>
              //     {loading ? (
              //       <p>Loading...</p>
              //     ) : bookings.length > 0 ? (
              //       <div className="bookings-container">
              //         <div className="booking-card header">
              //           <p><strong>S.No</strong></p>
              //           <p><strong>Event</strong></p>
              //           <p><strong>Created</strong></p>
              //           <p><strong>Event Date</strong></p>
              //           <p><strong>Price</strong></p>
              //           <p><strong>View</strong></p>
              //           <p><strong>Status</strong></p>
              //           <p><strong>Open</strong></p>
              //         </div>
  
              //         {bookings.map((booking) => (
              //           <div key={booking.id} className="booking-card">
  
              //             <p>#{booking.serial}</p>
              //             <p>{booking.eventName}</p>
              //             <p>{new Date(booking.createdDate).toLocaleDateString()}</p>
              //             <p>{new Date(booking.eventDate).toLocaleDateString()}</p>
              //             <p> ₹{booking.price}</p>
              //             <p>
              //               {booking.viewedByAdmin ?
              //                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check2-all" viewBox="0 0 16 16">
              //                   <path d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0zm-4.208 7-.896-.897.707-.707.543.543 6.646-6.647a.5.5 0 0 1 .708.708l-7 7a.5.5 0 0 1-.708 0" />
              //                   <path d="m5.354 7.146.896.897-.707.707-.897-.896a.5.5 0 1 1 .708-.708" />
              //                 </svg>
              //                 :
              //                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check2" viewBox="0 0 16 16">
              //                   <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0" />
              //                 </svg>}
              //             </p>
              //             <p>
              //               {booking.completed || new Date(booking.eventDate) < new Date() ?
              //                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-patch-check-fill" viewBox="0 0 16 16">
              //                   <path d="M10.067.87a2.89 2.89 0 0 0-4.134 0l-.622.638-.89-.011a2.89 2.89 0 0 0-2.924 2.924l.01.89-.636.622a2.89 2.89 0 0 0 0 4.134l.637.622-.011.89a2.89 2.89 0 0 0 2.924 2.924l.89-.01.622.636a2.89 2.89 0 0 0 4.134 0l.622-.637.89.011a2.89 2.89 0 0 0 2.924-2.924l-.01-.89.636-.622a2.89 2.89 0 0 0 0-4.134l-.637-.622.011-.89a2.89 2.89 0 0 0-2.924-2.924l-.89.01zm.287 5.984-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708.708" />
              //                 </svg> :
              //                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-patch-check" viewBox="0 0 16 16">
              //                   <path fillRule="evenodd" d="M10.354 6.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708 0" />
              //                   <path d="m10.273 2.513-.921-.944.715-.698.622.637.89-.011a2.89 2.89 0 0 1 2.924 2.924l-.01.89.636.622a2.89 2.89 0 0 1 0 4.134l-.637.622.011.89a2.89 2.89 0 0 1-2.924 2.924l-.89-.01-.622.636a2.89 2.89 0 0 1-4.134 0l-.622-.637-.89.011a2.89 2.89 0 0 1-2.924-2.924l.01-.89-.636-.622a2.89 2.89 0 0 1 0-4.134l.637-.622-.011-.89a2.89 2.89 0 0 1 2.924-2.924l.89.01.622-.636a2.89 2.89 0 0 1 4.134 0l-.715.698a1.89 1.89 0 0 0-2.704 0l-.92.944-1.32-.016a1.89 1.89 0 0 0-1.911 1.912l.016 1.318-.944.921a1.89 1.89 0 0 0 0 2.704l.944.92-.016 1.32a1.89 1.89 0 0 0 1.912 1.911l1.318-.016.921.944a1.89 1.89 0 0 0 2.704 0l.92-.944 1.32.016a1.89 1.89 0 0 0 1.911-1.912l-.016-1.318.944-.921a1.89 1.89 0 0 0 0-2.704l-.944-.92.016-1.32a1.89 1.89 0 0 0-1.912-1.911z" />
              //                 </svg>
              //               }
              //             </p>
              //             <button className="open-booking-btn" onClick={() => navigate(`/userBooking/${booking.id}`)}>Open</button>
              //           </div>
              //         ))}
              //       </div>
              //     ) : (
              //       <p className="no-booking-found"><i className="bi bi-exclamation-octagon"></i>No bookings found.....</p>
              //     )}
              //   </div>
              // </>