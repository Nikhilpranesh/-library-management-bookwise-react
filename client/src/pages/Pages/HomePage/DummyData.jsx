import React, { useState, useEffect } from "react";
import axios from "axios";

const DummyData = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get("http://localhost:5000/allBook");
        setBooks(response.data.slice(0, 6)); // Show only first 6 books
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  if (loading) {
    return (
      <div className="modern-card">
        <div className="home-banner">Featured Books</div>
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="modern-card slide-in-left">
      <div className="home-banner">Featured Books</div>
      <div className="books-grid">
        {books.map((book) => (
          <div key={book._id} className="book-card">
            <img
              src={book.image || "https://via.placeholder.com/300x200?text=Book+Cover"}
              alt={book.title}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/300x200?text=Book+Cover";
              }}
            />
            <div className="book-title">{book.title}</div>
            <div className="book-author">by {book.author}</div>
            <div className="book-description">
              {book.description?.slice(0, 100) || "A fascinating book that will take you on an incredible journey..."}
              {book.description?.length > 100 ? "..." : ""}
            </div>
            <div style={{ marginTop: "1rem" }}>
              <span style={{ 
                background: "linear-gradient(135deg, #667eea, #764ba2)", 
                color: "white", 
                padding: "0.3rem 0.8rem", 
                borderRadius: "15px", 
                fontSize: "0.8rem",
                fontWeight: "500"
              }}>
                {book.genre || "Fiction"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DummyData;
