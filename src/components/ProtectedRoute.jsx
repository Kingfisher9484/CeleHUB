import React, { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { auth, db } from "../../Firebase/Firebase";
import { getDoc, doc } from "firebase/firestore";

export default function ProtectedRoute({ role }) {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          } else {
            setUserRole(null); // Handle if user data doesn't exist
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserRole(null); // Handle error fetching user data
        }
      } else {
        setUserRole(null); // If user is not logged in
      }
      setLoading(false);
    };

    // Check the user role on component mount and whenever the auth state changes
    const unsubscribe = auth.onAuthStateChanged(() => {
      setLoading(true);
      checkUserRole();
    });

    checkUserRole(); // Initial check

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, []);

  if (loading) return <h2>Loading...</h2>; // Keep loading UI user-friendly

  // If the user doesn't have the required role, redirect to the home page
  return userRole === role ? <Outlet /> : <Navigate to="/" />;
}

// import React from "react";
// import { Navigate, Outlet } from "react-router-dom";
// import { auth, db } from "../../Firebase/Firebase";
// import { useState, useEffect } from "react";
// import { getDoc, doc } from "firebase/firestore";

// export default function ProtectedRoute({ role }) {
//   const [userRole, setUserRole] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const checkUserRole = async () => {
//       const user = auth.currentUser;
//       if (user) {
//         const userDoc = await getDoc(doc(db, "users", user.uid));
//         if (userDoc.exists()) {
//           setUserRole(userDoc.data().role);
//         }
//       }
//       setLoading(false);
//     };
//     checkUserRole();
//   }, []);

//   if (loading) return <h2>Loading...</h2>;

//   return userRole === role ? <Outlet /> : <Navigate to="/" />;
// }
