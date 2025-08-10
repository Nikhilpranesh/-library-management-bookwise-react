import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../../Assets/css/home.css";
import { useNavigate } from "react-router-dom";
import Footer from "../../Components/Footer";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const FavoriteButton = ({ bookId, favorites, toggleFavorite }) => {
  const isFavorite = favorites.includes(bookId);
  return (
    <button
      onClick={() => toggleFavorite(bookId)}
      style={{
        borderRadius: "25px",
        padding: "0.5rem 1rem",
        border: "none",
        background: isFavorite 
          ? "linear-gradient(135deg, #ffd166, #f7931e)" 
          : "linear-gradient(135deg, #667eea, #764ba2)",
        color: "white",
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        fontWeight: "500"
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = "translateY(-2px)";
        e.target.style.boxShadow = "0 6px 20px rgba(0,0,0,0.2)";
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = "translateY(0)";
        e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
      }}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      {isFavorite ? "★ Favorited" : "☆ Favorite"}
    </button>
  );
};

const AddToCartButton = ({ book, user, onAddToCart }) => {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please login to add books to cart");
      return;
    }

    setIsAdding(true);
    try {
      const send = { 
        bookId: book._id, 
        username: user.username,
        title: book.Title || book.title,
        price: book.Price || book.price
      };
      
      await axios.post(`http://localhost:5000/addToCart`, send);
      toast.success("Book added to cart successfully!");
      if (onAddToCart) onAddToCart();
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(error.response?.data?.msg || "Failed to add book to cart");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding}
      style={{
        borderRadius: "25px",
        padding: "0.5rem 1rem",
        border: "none",
        background: "linear-gradient(135deg, #27ae60, #2ecc71)",
        color: "white",
        cursor: isAdding ? "not-allowed" : "pointer",
        transition: "all 0.3s ease",
        boxShadow: "0 4px 12px rgba(39, 174, 96, 0.3)",
        fontWeight: "500",
        opacity: isAdding ? 0.7 : 1
      }}
      onMouseEnter={(e) => {
        if (!isAdding) {
          e.target.style.transform = "translateY(-2px)";
          e.target.style.boxShadow = "0 6px 20px rgba(39, 174, 96, 0.4)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isAdding) {
          e.target.style.transform = "translateY(0)";
          e.target.style.boxShadow = "0 4px 12px rgba(39, 174, 96, 0.3)";
        }
      }}
      aria-label="Add to cart"
    >
      {isAdding ? "🔄 Adding..." : "🛒 Add to Cart"}
    </button>
  );
};

const coverUrl = (bookId, title, adminImage) => {
  // Use admin's image if available, otherwise fallback to placeholder
  if (adminImage && adminImage.trim() !== '') {
    return adminImage;
  }
  // Use a placeholder image since we no longer have ISBN
  const seed = encodeURIComponent((title || "book").slice(0, 50));
  return `https://picsum.photos/seed/${seed}/240/340`;
};

const Explore = ({ user }) => {
  const navigate = useNavigate();
  const [allBooks, setAllBooks] = useState([]);
  const [query, setQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState(() => {
    try {
      const favoritesKey = `bookwise_favorites_${user?.username || 'guest'}`;
      const saved = localStorage.getItem(favoritesKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const favoritesKey = `bookwise_favorites_${user?.username || 'guest'}`;
    localStorage.setItem(favoritesKey, JSON.stringify(favorites));
  }, [favorites, user?.username]);

  // Clear favorites when user changes
  useEffect(() => {
    if (user?.username) {
      const favoritesKey = `bookwise_favorites_${user.username}`;
      const saved = localStorage.getItem(favoritesKey);
      if (saved) {
        setFavorites(JSON.parse(saved));
      } else {
        setFavorites([]);
      }
    }
  }, [user?.username]);

  const toggleFavorite = (bookId) => {
    setFavorites((prev) =>
      prev.includes(bookId) ? prev.filter((i) => i !== bookId) : [...prev, bookId]
    );
  };

  const handleAddToCart = () => {
    // This function can be used to refresh cart data or show notifications
    // For now, we'll just show a success message via toast
  };

  const fetchBooks = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/allBooks");
      setAllBooks(data.books || data || []);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching books:", err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const { data } = await axios.get("http://localhost:5000/allBooks");
        const books = data.books || data || [];
        if (books.length === 0) {
          try {
            await axios.post("http://localhost:5000/seed");
          } catch {}
          await fetchBooks();
        } else {
          setAllBooks(books);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error initializing:", error);
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const genres = useMemo(() => {
    const gset = new Set();
    allBooks.forEach((b) => {
      if (typeof b.Genre === "string" && b.Genre.trim().length > 0) gset.add(b.Genre);
      if (Array.isArray(b.Genre)) b.Genre.forEach((g) => gset.add(g));
    });
    return ["all", ...Array.from(gset).sort()];
  }, [allBooks]);

  const filtered = useMemo(() => {
    return allBooks.filter((book) => {
      const matchesQuery = !query || 
        book.title?.toLowerCase().includes(query.toLowerCase()) ||
        book.Title?.toLowerCase().includes(query.toLowerCase()) ||
        book.author?.toLowerCase().includes(query.toLowerCase()) ||
        book.Author?.toLowerCase().includes(query.toLowerCase()) ||
        book.description?.toLowerCase().includes(query.toLowerCase()) ||
        book.Description?.toLowerCase().includes(query.toLowerCase());
      
      const matchesGenre = genreFilter === "all" || 
        (book.Genre && (
          (Array.isArray(book.Genre) && book.Genre.includes(genreFilter)) ||
          (typeof book.Genre === "string" && book.Genre === genreFilter)
        ));
      
      return matchesQuery && matchesGenre;
    });
  }, [allBooks, query, genreFilter]);

  if (isLoading) {
    return (
      <div className="home-top" style={{ paddingTop: "4.5rem" }}>
        <div className="home-inner-top">
          <div className="modern-card">
            <div className="home-banner">Exploring Books</div>
            <div className="loader"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-top" style={{ paddingTop: "4.5rem" }}>
      <div className="home-inner-top">
        <div className="modern-card fade-in">
          <div className="home-banner">Explore Our Library</div>
          
          {/* Search and Filter Section */}
          <div style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "2rem",
            flexWrap: "wrap",
            alignItems: "center"
          }}>
            <div style={{ flex: "1", minWidth: "300px" }}>
              <input
                type="text"
                placeholder="Search books by title, author, or description..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "1rem",
                  border: "2px solid rgba(102, 126, 234, 0.2)",
                  borderRadius: "25px",
                  fontSize: "1rem",
                  background: "rgba(255, 255, 255, 0.9)",
                  transition: "all 0.3s ease"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#667eea";
                  e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(102, 126, 234, 0.2)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
            
            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              style={{
                padding: "1rem",
                border: "2px solid rgba(102, 126, 234, 0.2)",
                borderRadius: "25px",
                fontSize: "1rem",
                background: "rgba(255, 255, 255, 0.9)",
                cursor: "pointer",
                minWidth: "150px"
              }}
            >
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre === "all" ? "All Genres" : genre}
                </option>
              ))}
            </select>

            <button
              onClick={() => navigate("/cart")}
              style={{
                padding: "1rem 1.5rem",
                border: "2px solid rgba(39, 174, 96, 0.3)",
                borderRadius: "25px",
                fontSize: "1rem",
                background: "linear-gradient(135deg, #27ae60, #2ecc71)",
                color: "white",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 12px rgba(39, 174, 96, 0.3)",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 20px rgba(39, 174, 96, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(39, 174, 96, 0.3)";
              }}
            >
              🛒 View Cart
            </button>
          </div>

          {/* Results Count */}
          <div style={{
            marginBottom: "2rem",
            padding: "1rem",
            background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))",
            borderRadius: "16px",
            border: "1px solid rgba(102, 126, 234, 0.2)"
          }}>
            <span style={{ fontWeight: "600", color: "#2c3e50" }}>
              Found {filtered.length} book{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Books Grid */}
          <div className="books-grid">
            {filtered.map((book) => (
              <div key={book._id} className="book-card">
                <img
                  src={coverUrl(book._id, book.title || book.Title, book.Image)}
                  alt={book.title || book.Title}
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/240x340?text=Book+Cover";
                  }}
                />
                <div className="book-title">{book.title || book.Title || "Untitled"}</div>
                <div className="book-author">by {book.author || book.Author || "Unknown Author"}</div>
                <div className="book-description">
                  {book.description?.slice(0, 120) || book.Description?.slice(0, 120) || "A fascinating book that will take you on an incredible journey..."}
                  {(book.description?.length > 120 || book.Description?.length > 120) ? "..." : ""}
                </div>
                
                {/* Price Display */}
                <div style={{
                  marginTop: "0.5rem",
                  padding: "0.5rem",
                  background: "linear-gradient(135deg, #f39c12, #e67e22)",
                  color: "white",
                  borderRadius: "12px",
                  textAlign: "center",
                  fontWeight: "600",
                  fontSize: "1.1rem"
                }}>
                  ₹{book.price || book.Price || Math.floor(Math.random() * 500) + 100}
                </div>
                
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  marginTop: "1rem",
                  gap: "0.5rem"
                }}>
                  <span style={{ 
                    background: "linear-gradient(135deg, #667eea, #764ba2)", 
                    color: "white", 
                    padding: "0.3rem 0.8rem", 
                    borderRadius: "15px", 
                    fontSize: "0.8rem",
                    fontWeight: "500"
                  }}>
                    {book.Genre || "Fiction"}
                  </span>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <AddToCartButton 
                      book={book} 
                      user={user} 
                      onAddToCart={handleAddToCart}
                    />
                    <FavoriteButton
                      bookId={book._id}
                      favorites={favorites}
                      toggleFavorite={toggleFavorite}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{
              textAlign: "center",
              padding: "3rem",
              color: "#7f8c8d"
            }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📚</div>
              <h3>No books found</h3>
              <p>Try adjusting your search terms or filters</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default Explore; 