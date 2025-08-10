import React from "react";

const Footer = () => {
  return (
    <footer style={{
      background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
      color: "white",
      padding: "3rem 0 1rem 0",
      marginTop: "4rem",
      position: "relative"
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 2rem",
        textAlign: "center"
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "2rem",
          marginBottom: "2rem"
        }}>
          <div>
            <h3 style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              marginBottom: "1rem",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}>
              bookWise
            </h3>
            <p style={{ lineHeight: "1.6", opacity: "0.8" }}>
              Your gateway to knowledge and imagination. Discover, learn, and grow with our extensive collection of books.
            </p>
          </div>
          
          <div>
            <h4 style={{ fontSize: "1.2rem", marginBottom: "1rem", color: "#667eea" }}>Quick Links</h4>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li style={{ marginBottom: "0.5rem" }}>
                <a href="/explore" style={{ color: "white", textDecoration: "none", opacity: "0.8", transition: "opacity 0.3s" }}>
                  Explore Books
                </a>
              </li>
              <li style={{ marginBottom: "0.5rem" }}>
                <a href="/profile" style={{ color: "white", textDecoration: "none", opacity: "0.8", transition: "opacity 0.3s" }}>
                  My Profile
                </a>
              </li>
              <li style={{ marginBottom: "0.5rem" }}>
                <a href="/cart" style={{ color: "white", textDecoration: "none", opacity: "0.8", transition: "opacity 0.3s" }}>
                  My Cart
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 style={{ fontSize: "1.2rem", marginBottom: "1rem", color: "#667eea" }}>Contact Info</h4>
            <div style={{ lineHeight: "1.6", opacity: "0.8" }}>
              <p>📧 info@bookwise.com</p>
              <p>📞 +1 (555) 123-4567</p>
              <p>📍 123 Library Street, Book City</p>
            </div>
          </div>
          
          <div>
            <h4 style={{ fontSize: "1.2rem", marginBottom: "1rem", color: "#667eea" }}>Follow Us</h4>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <a href="#" style={{ 
                display: "inline-block",
                width: "40px",
                height: "40px",
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                textDecoration: "none",
                transition: "transform 0.3s"
              }}>
                📘
              </a>
              <a href="#" style={{ 
                display: "inline-block",
                width: "40px",
                height: "40px",
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                textDecoration: "none",
                transition: "transform 0.3s"
              }}>
                📖
              </a>
              <a href="#" style={{ 
                display: "inline-block",
                width: "40px",
                height: "40px",
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                textDecoration: "none",
                transition: "transform 0.3s"
              }}>
                📚
              </a>
            </div>
          </div>
        </div>
        
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.1)",
          paddingTop: "2rem",
          textAlign: "center",
          opacity: "0.7"
        }}>
          <p>&copy; 2024 bookWise Library Management System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 