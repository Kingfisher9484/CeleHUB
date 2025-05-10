import React, { useState } from 'react';
import './Newsletter.css';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle subscription logic here (e.g., send email to backend or Firebase)
    alert(`Subscribed with email: ${email}`);
  };

  return (
    <section className="newsletter-section">
      <div className="newsletter-content">
        <h2>Stay Updated with Our Latest Events!</h2>
        <p>Subscribe to our newsletter and be the first to know about upcoming events, offers, and more!</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="Enter your email"
            required
            className="newsletter-input"
          />
          <button type="submit" className="newsletter-btn">Subscribe</button>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;
