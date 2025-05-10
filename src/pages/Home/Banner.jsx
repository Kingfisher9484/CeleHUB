import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // ✅ make sure this is imported
import { auth, db } from "../../../Firebase/Firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import './Banner.css';

const Banner = () => {
    const [role, setRole] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try {
                    const userDocRef = doc(db, "users", currentUser.uid);
                    const userDocSnap = await getDoc(userDocRef);

                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data();
                        setRole(userData.role);
                    } else {
                        console.warn("No such user document.");
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="banner">
            <div className="banner-overlay">
                <div className="banner-content">
                    
                    <h1>Your Celebration, Our Passion</h1>
                    <p>Book unforgettable events with ease and joy.</p>
                    
                    <div className="banner-buttons">
                        {role === "admin" && (
                            <Link to="/admin" className="banner-btn">Get Started</Link>
                        )}
                        {role === "user" && (
                            <Link to="/user" className="banner-btn">Get Started</Link>
                        )}

                        <Link to="/auth" className="banner-btn2">Register</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Banner;
