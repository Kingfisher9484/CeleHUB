import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../Firebase/Firebase";
import html2pdf from "html2pdf.js";
import "./AdminOrders.css";

function AdminOrders() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "bookings"));
        const fetchedBookings = querySnapshot.docs.map((doc, index) => ({
          serial: index + 1,
          id: doc.id,
          ...doc.data(),
        }));
        setBookings(fetchedBookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    const search = searchTerm.toLowerCase();
    return (
      booking.eventName?.toLowerCase().includes(search) ||
      booking.firstName?.toLowerCase().includes(search) ||
      booking.lastName?.toLowerCase().includes(search) ||
      new Date(booking.createdDate).toLocaleDateString().includes(search) ||
      new Date(booking.eventDate).toLocaleDateString().includes(search)
    );
  });

  const newOrders = filteredBookings.filter((b) => !b.viewedByAdmin);
  const completedOrders = filteredBookings.filter((b) => b.viewedByAdmin);

  const exportToPDF = () => {
    const element = document.getElementById("bookings-print-area");
    const opt = {
      margin: 0.5,
      filename: "Admin_Bookings.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const printContent = document.getElementById("bookings-print-area").innerHTML;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Admin Bookings</title>
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
          <h2>📋 Admin Bookings</h2>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleOpenBooking = (bookingId) => {
    navigate(`/userOrder/${bookingId}`);
  };

  return (
    <div className="bookings-wrapper">
      <input
        className="search-input"
        type="text"
        placeholder="Search Event, Name, or Date..."
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
          <BookingTable title="🆕 New Orders" bookings={newOrders} onOpen={handleOpenBooking} />
          <BookingTable title="✅ Completed Orders" bookings={completedOrders} onOpen={handleOpenBooking} />
        </div>
      )}
    </div>
  );
}

function BookingTable({ title, bookings, onOpen }) {
  if (bookings.length === 0) return null;

  return (
    <div className="table-section">
      <h3>{title}</h3>
      <table className="bookings-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Customer</th>
            <th>Event</th>
            <th>Created</th>
            <th>Event Date</th>
            <th>Price</th>
            <th>Open</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking, index) => (
            <tr key={booking.id}>
              <td>#{index + 1}</td>
              <td>{booking.firstName} {booking.lastName}</td>
              <td>{booking.eventName}</td>
              <td>{new Date(booking.createdDate).toLocaleDateString()}</td>
              <td>{new Date(booking.eventDate).toLocaleDateString()}</td>
              <td>₹{booking.price}</td>
              <td>
                <button
                  className="order-card-btn"
                  onClick={() => onOpen(booking.id)}
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

export default AdminOrders;
