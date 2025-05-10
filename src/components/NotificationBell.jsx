import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../Firebase/Firebase"; // Adjust import as needed

const NotificationBell = () => {
  const [newBookingsCount, setNewBookingsCount] = useState(0);

  useEffect(() => {
    const fetchNewBookings = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "bookings"));
        const newBookings = querySnapshot.docs.filter(doc => !doc.data().viewedByAdmin);
        setNewBookingsCount(newBookings.length);
      } catch (error) {
        console.error("Error fetching new bookings:", error);
      }
    };

    fetchNewBookings();
  }, []);

  return (
    <div className="notification-bell" >
      {newBookingsCount > 0 && (
        <span className="badge bg-danger" style={{ padding:"2px" ,fontSize: "0.7rem", cursor: "pointer", zIndex:"25000",position:"absolute",marginLeft:"-17px",marginTop:"-17px", background:"red",borderRadius:"5px"}}>{newBookingsCount}</span>
      )}
      
      
      
    </div>
  );
};

export default NotificationBell;
