import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>All Recipes</h4>
          <p>Your favorite recipe companion</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/popular">Popular</a></li>
            <li><a href="/veggie">Veggie</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Account</h4>
          <ul>
            <li><a href="/auth/login">Login</a></li>
            <li><a href="/auth/register">Sign Up</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 All Recipes. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;