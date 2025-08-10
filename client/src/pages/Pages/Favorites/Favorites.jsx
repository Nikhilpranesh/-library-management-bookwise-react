import React, { useEffect, useState } from "react";
import "../../Assets/css/favorites.css";
import Footer from "../../Components/Footer";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Favorites = ({ user }) => {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load favorites from localStorage using user-specific key
    const loadFavorites = async () => {
      try {
        setIsLoading(true);
        const storedFavorites = localStorage.getItem(`bookwise_favorites_${user?.username || 'guest'}`);
        if (storedFavorites) {
            const favoriteBookIds = JSON.parse(storedFavorites);
            
            if (favoriteBookIds.length === 0) {
                setFavorites([]);
                setIsLoading(false);
                return;
            }

            // Fetch full book details for each favorite book ID
            try {
                const { data } = await axios.get("http://localhost:5000/allBooks");
                const allBooks = data.books || [];
                
                // Filter books to only include favorited ones
                const favoriteBooks = allBooks.filter(book => 
                    favoriteBookIds.includes(book._id)
                );
                
                setFavorites(favoriteBooks);
            } catch (fetchError) {
                console.error("Error fetching book details:", fetchError);
                setError("Failed to load favorite books. Please try again.");
            }
        } else {
          setFavorites([]);
        }
      } catch (error) {
        console.error("Error loading favorites:", error);
        setError("Failed to load favorites. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, [user?.username]);

  // Clear favorites when user changes
  useEffect(() => {
    if (user?.username) {
      setFavorites([]);
      setIsLoading(true);
      const saved = localStorage.getItem(`bookwise_favorites_${user?.username || 'guest'}`);
      if (saved) {
        const favoriteBookIds = JSON.parse(saved);
        if (favoriteBookIds.length > 0) {
          // Fetch full book details for each favorite book ID
          axios.get("http://localhost:5000/allBooks")
            .then(({ data }) => {
              const allBooks = data.books || [];
              const favoriteBooks = allBooks.filter(book => 
                favoriteBookIds.includes(book._id)
              );
              setFavorites(favoriteBooks);
            })
            .catch((error) => {
              console.error("Error fetching book details:", error);
              setError("Failed to load favorite books. Please try again.");
            })
            .finally(() => {
              setIsLoading(false);
            });
        } else {
          setFavorites([]);
          setIsLoading(false);
        }
      } else {
        setFavorites([]);
        setIsLoading(false);
      }
    }
  }, [user?.username]);

  const removeFavorite = (bookId) => {
    try {
      // Remove from local state
      setFavorites(prev => prev.filter(book => 
        book._id !== bookId
      ));
      
      // Update localStorage
      const storedFavorites = localStorage.getItem(`bookwise_favorites_${user?.username || 'guest'}`);
      if (storedFavorites) {
        const favoriteBookIds = JSON.parse(storedFavorites);
        const updatedFavoriteBookIds = favoriteBookIds.filter(id => id !== bookId);
        localStorage.setItem(`bookwise_favorites_${user?.username || 'guest'}`, JSON.stringify(updatedFavoriteBookIds));
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  const addToCart = async (book) => {
    if (!user) {
      alert("Please login to add books to cart");
      return;
    }
    
    try {
      const response = await axios.post("http://localhost:5000/addToCart", {
        username: user.username,
        bookId: book._id,
        title: book.title || book.Title || "Unknown Title",
        price: book.price || book.Price || Math.floor(Math.random() * 500) + 100
      });
      
      if (response.data.success) {
        alert("Book added to cart successfully!");
      } else {
        alert("Failed to add book to cart: " + response.data.msg);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add book to cart. Please try again.");
    }
  };

  const coverUrl = (bookId, title) => {
    // Use a placeholder image since we no longer have ISBN
    return `https://picsum.photos/seed/${title || bookId}/240/340`;
  };

  if (isLoading) {
    return (
      <div className="favorites-container">
        <div className="favorites-content">
          <div className="favorites-header fade-in">
            <div className="favorites-title">❤️ Your Favorites</div>
            <div className="favorites-subtitle">
              Your personal collection of beloved books
            </div>
          </div>
          <div className="loading-state">
            <div className="loader"></div>
            <p>Loading your favorites...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="favorites-container">
        <div className="favorites-content">
          <div className="favorites-header fade-in">
            <div className="favorites-title">❤️ Your Favorites</div>
            <div className="favorites-subtitle">
              Your personal collection of beloved books
            </div>
          </div>
          <div className="error-state">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Try Again</button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="favorites-container">
      <div className="favorites-content">
        <div className="favorites-header fade-in">
          <div className="favorites-title">❤️ Your Favorites</div>
          <div className="favorites-subtitle">
            Your personal collection of beloved books
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className="no-favorites fade-in">
            <div className="no-favorites-icon">📚</div>
            <h3>No Favorites Yet</h3>
            <p>Start exploring books and add your favorites!</p>
            <button 
              className="explore-btn"
              onClick={() => navigate("/explore")}
            >
              Explore Books
            </button>
          </div>
        ) : (
          <div className="favorites-grid">
            {favorites.map((book) => (
              <div key={book._id} className="favorite-card slide-in-left">
                <div className="favorite-image-container">
                  <img
                    src={coverUrl(book._id, book.title || book.Title)}
                    alt={book.title || book.Title}
                    className="favorite-image"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/240x340?text=Book+Cover";
                    }}
                  />
                  <div className="favorite-overlay">
                    <button
                      className="remove-favorite-btn"
                      onClick={() => removeFavorite(book._id)}
                      title="Remove from favorites"
                    >
                      ❌
                    </button>
                  </div>
                </div>

                <div className="favorite-details">
                  <h3 className="favorite-title">{book.title || book.Title}</h3>
                  <p className="favorite-author">by {book.author || book.Author || "Unknown Author"}</p>
                  <p className="favorite-description">
                    {book.description || book.Description || "A fascinating book that will take you on an incredible journey..."}
                  </p>

                  <div className="favorite-actions">
                    <button
                      className="add-to-cart-btn"
                      onClick={() => addToCart(book)}
                    >
                      🛒 Add to Cart
                    </button>
                    <span className="favorite-genre">
                      {book.genre || book.Genre || "Fiction"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {favorites.length > 0 && (
          <div className="favorites-summary fade-in">
            <div className="summary-stats">
              <span className="stat-item">
                <span className="stat-number">{favorites.length}</span>
                <span className="stat-label">Total Favorites</span>
              </span>
            </div>
            <div className="summary-actions">
              <button 
                className="explore-more-btn"
                onClick={() => navigate("/explore")}
              >
                Explore More Books
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Favorites;
