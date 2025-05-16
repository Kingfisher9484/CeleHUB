import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../Firebase/Firebase"; // Adjust path as needed

const BookingAcceptNotifications = ({ userId }) => {
  const [acceptedCount, setAcceptedCount] = useState(0);

  useEffect(() => {
    const fetchAcceptedBookings = async () => {
      try {
        const snapshot = await getDocs(collection(db, "bookings"));
        const acceptedBookings = snapshot.docs.filter(doc => {
          const data = doc.data();
          return (
            data.userId === userId &&
            data.acceptedByAdmin === true &&
            data.viewedByUser !== true // Only show if not viewed
          );
        });
        setAcceptedCount(acceptedBookings.length);
      } catch (error) {
        console.error("Error fetching accepted bookings:", error);
      }
    };

    fetchAcceptedBookings();
  }, [userId]);

  return (
    <div className="notification-bell">
      {acceptedCount > 0 && (
        <span
          className="badge bg-danger"
          style={{ padding:"2px" ,fontSize: "0.7rem", cursor: "pointer", zIndex:"25000",position:"absolute",marginLeft:"-17px",marginTop:"-17px", background:"red",borderRadius:"5px"}}
        >
          {acceptedCount}
        </span>
      )}
    </div>
  );
};

export default BookingAcceptNotifications;
{/* <BookingAcceptNotifications userId={user?.uid} /> */}