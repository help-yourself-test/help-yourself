import React from "react";
import "./Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">Your App</h3>
            <p className="footer-description">
              Building amazing experiences with modern web technologies.
            </p>
            <div className="social-links">
              <a href="#facebook" className="social-link" aria-label="Facebook">
                <span>📘</span>
              </a>
              <a href="#twitter" className="social-link" aria-label="Twitter">
                <span>🐦</span>
              </a>
              <a href="#linkedin" className="social-link" aria-label="LinkedIn">
                <span>💼</span>
              </a>
              <a
                href="#instagram"
                className="social-link"
                aria-label="Instagram"
              >
                <span>📷</span>
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">Quick Links</h4>
            <ul className="footer-links">
              <li>
                <a href="#home">Home</a>
              </li>
              <li>
                <a href="#about">About Us</a>
              </li>
              <li>
                <a href="#services">Services</a>
              </li>
              <li>
                <a href="#contact">Contact</a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">Support</h4>
            <ul className="footer-links">
              <li>
                <a href="#help">Help Center</a>
              </li>
              <li>
                <a href="#faq">FAQ</a>
              </li>
              <li>
                <a href="#privacy">Privacy Policy</a>
              </li>
              <li>
                <a href="#terms">Terms of Service</a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">Contact Info</h4>
            <div className="contact-info">
              <p>📧 info@yourapp.com</p>
              <p>📞 +1 (555) 123-4567</p>
              <p>📍 123 Main St, City, State 12345</p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>&copy; {currentYear} Your App. All rights reserved.</p>
          </div>
          <div className="footer-bottom-links">
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="#cookies">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
