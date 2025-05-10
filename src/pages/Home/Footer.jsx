import React from 'react';
import './Footer.css';

const HomeFooter = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo">
          <h2>CeleHUB</h2>
        </div>

        <div className="footer-links">
          <ul>
            <li><a href="/about">About Us</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/terms">Terms & Conditions</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
          </ul>
        </div>

        <div className="footer-socials">
          <a href="https://facebook.com" className="social-icon">Facebook</a>
          <a href="https://twitter.com" className="social-icon">Twitter</a>
          <a href="https://instagram.com" className="social-icon">Instagram</a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} EventHub. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default HomeFooter;
