// BookingConfirmation.jsx
import React from "react";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./BookingConfirmation.css"; // Add styles below

export default function BookingConfirmation() {
  const navigate = useNavigate();

  return (
    <div className="confirmation-container">
      <CheckCircle size={80} color="#4BB543" />
      <h2>Booking Confirmed!</h2>
      <p>Thank you for booking with <strong>CeleHub</strong>. We’ve received your payment and booking details.</p>
      <button className="go-home-btn" onClick={() => navigate("/")}>Back to Home</button>
    </div>
  );
}

