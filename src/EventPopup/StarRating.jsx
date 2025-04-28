// components/EventRating.jsx
import React, { useState, useEffect } from "react";
import { db, auth } from "../../Firebase/Firebase";
import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  collection,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";
import "./StarRating.css";

const ratingDescriptions = {
  1: "Terrible",
  2: "Bad",
  3: "Okay",
  4: "Great",
  5: "Excellent",
};

const EventRating = ({ eventId }) => {
  const [user, setUser] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (eventId) {
      fetchAvgRating();
      if (user) fetchUserRating();
    }
  }, [eventId, user]);

  const fetchUserRating = async () => {
    const ratingRef = doc(db, "ratings", `${eventId}_${user.uid}`);
    const snap = await getDoc(ratingRef);
    if (snap.exists()) setRating(snap.data().rating);
  };

  const fetchAvgRating = async () => {
    const q = query(collection(db, "ratings"), where("eventId", "==", eventId));
    const snap = await getDocs(q);
    const ratings = snap.docs.map((d) => d.data().rating);
    if (ratings.length > 0) {
      const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      setAvgRating(avg.toFixed(1));
    }
  };

  const handleRate = async (index) => {
    const selected = index + 1;
    if (!user) return alert("Sign in to rate.");
    setRating(selected);
    await setDoc(doc(db, "ratings", `${eventId}_${user.uid}`), {
      eventId,
      userId: user.uid,
      rating: selected,
      label: ratingDescriptions[selected],
      timestamp: new Date(),
    });
    fetchAvgRating();
  };

  return (
    <div className="rating-section">
      <p>
        <strong>Average Rating:</strong> ⭐ {avgRating} (
        {ratingDescriptions[Math.round(avgRating)] || "No Rating"})
      </p>
      <p><strong>Your Rating:</strong></p>
      <div
        className="book-star-rating"
        onMouseLeave={() => setHoverRating(0)}
      >
        {[...Array(5)].map((_, index) => {
          const filled = index < (hoverRating || rating);
          return (
            <motion.span
              key={index}
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.95 }}
              className={`star ${filled ? "filled" : ""}`}
              onMouseEnter={() => setHoverRating(index + 1)}
              onClick={() => handleRate(index)}
              title={ratingDescriptions[index + 1]}
            >
              ★
            </motion.span>
          );
        })}
      </div>
      <p className="rating-label">
        {hoverRating > 0
          ? ratingDescriptions[hoverRating]
          : ratingDescriptions[rating] || "Click to rate"}
      </p>
    </div>
  );
};

export default EventRating;

{/*import React, { useEffect, useState } from 'react';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../Firebase/Firebase';
import './starRating.css';

const StarRating = ({ eventId, userId }) => {
  const [userRating, setUserRating] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);

  const ratingDocId = `${eventId}_${userId}`;

  // Fetch existing user rating
  useEffect(() => {
    const fetchRating = async () => {
      try {
        const docRef = doc(db, 'ratings', ratingDocId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserRating(docSnap.data().rating);
        }
      } catch (error) {
        console.error('Error fetching user rating:', error);
      }
    };
    fetchRating();
  }, [ratingDocId]);

  // Fetch average rating
  useEffect(() => {
    const fetchAverage = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'ratings'));
        const eventRatings = querySnapshot.docs
          .filter((doc) => doc.data().eventId === eventId)
          .map((doc) => doc.data().rating);
        if (eventRatings.length > 0) {
          const avg = eventRatings.reduce((a, b) => a + b, 0) / eventRatings.length;
          setAvgRating(avg.toFixed(1));
        }
      } catch (error) {
        console.error('Error fetching average rating:', error);
      }
    };
    fetchAverage();
  }, [eventId, userRating]);

  // Handle rating submission
  const handleRating = async (ratingValue) => {
    try {
      setUserRating(ratingValue);
      const ratingRef = doc(db, 'ratings', ratingDocId);
      await setDoc(ratingRef, {
        eventId,
        userId,
        rating: ratingValue,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Error saving rating:', error);
    }
  };

  return (
    <div className="star-rating">
      <p className="average-text">Average Rating: ⭐ {avgRating}</p>
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= (hoveredStar || userRating) ? 'filled' : ''}`}
            onClick={() => handleRating(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
          >
            ★
          </span>
        ))}
      </div>
    </div>
  );
};

export default StarRating;
*/}