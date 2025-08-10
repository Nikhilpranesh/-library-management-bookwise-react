import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CopyTypeModal from "./CopyTypeModal";
import OrderDetails from "../Checkout/OrderDetails";
import PaymentPage from "../Checkout/PaymentPage";
import "../../Assets/css/cart.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Cart = ({ user }) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCopyTypeModal, setShowCopyTypeModal] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showPaymentPage, setShowPaymentPage] = useState(false);
  const [selectedCopyType, setSelectedCopyType] = useState(null);
  const [selectedBookForCheckout, setSelectedBookForCheckout] = useState(null);
  const [isBuyNowMode, setIsBuyNowMode] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/booksInCart/${user.username}`
      );
      setData(response.data.books || []);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const handleCheckout = () => {
    if (data.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    setIsBuyNowMode(false);
    setShowCopyTypeModal(true);
  };

  const handleCopyTypeSelection = (copyType) => {
    setSelectedCopyType(copyType);
    setShowCopyTypeModal(false);
    
    if (copyType === 'hardcopy') {
      setShowOrderDetails(true);
    } else if (copyType === 'softcopy') {
      setShowPaymentPage(true);
    }
  };

  const handleBackFromOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedCopyType(null);
    // Restore original cart data
    fetchData();
    // Reset buy now mode
    if (isBuyNowMode) {
      setIsBuyNowMode(false);
      setSelectedBookForCheckout(null);
    }
  };

  const handleBackFromPayment = () => {
    setShowPaymentPage(false);
    setSelectedCopyType(null);
    // Restore original cart data
    fetchData();
    // Reset buy now mode
    if (isBuyNowMode) {
      setIsBuyNowMode(false);
      setSelectedBookForCheckout(null);
    }
  };

  const removeFromCart = async (bookId) => {
    try {
      await axios.post(`http://localhost:5000/removeFromCart`, {
        username: user.username,
        bookId: bookId
      });
      toast.success("Book removed from cart successfully!");
      fetchData(); // Refresh cart data
    } catch (error) {
      console.error("Remove from cart error:", error);
      toast.error("Failed to remove book from cart");
    }
  };

  const handleBuyNow = (book) => {
    // Set the selected book for checkout
    setSelectedBookForCheckout(book);
    setIsBuyNowMode(true);
    setShowCopyTypeModal(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Cleanup effect for buy now mode
  useEffect(() => {
    return () => {
      // Reset buy now mode when component unmounts
      setIsBuyNowMode(false);
      setSelectedBookForCheckout(null);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="cart-container">
        <div className="cart-content">
          <div className="cart-empty">
            <div className="loader"></div>
            <h2>Loading your cart...</h2>
          </div>
        </div>
      </div>
    );
  }

  // Calculate total price
  const totalPrice = data.reduce((sum, book) => {
    const price = book.price || book.Price || Math.floor(Math.random() * 500) + 100;
    return sum + price;
  }, 0);



  return (
    <div className="cart-container">
      <div className="cart-content">
        <div className="cart-header fade-in">
          <div className="cart-title">🛒 Your Cart</div>
          {data.length > 0 && (
            <div style={{ textAlign: "right" }}>
              <div style={{
                background: "linear-gradient(135deg, #f39c12, #e67e22)",
                color: "white",
                padding: "0.8rem 1.5rem",
                borderRadius: "20px",
                fontSize: "1.2rem",
                fontWeight: "600",
                marginBottom: "1rem",
                display: "inline-block"
              }}>
                Total: ₹{totalPrice}
              </div>
            </div>
          )}
        </div>

        {data.length === 0 ? (
          <div className="cart-empty fade-in">
            <img
              src="https://raw.githubusercontent.com/AnuragRoshan/images/2da16323d0b50258ee4a9f8ffe0ec96bf73ed0b9/undraw_happy_music_g6wc.svg"
              alt="Empty Cart"
            />
            <h2>Your cart is empty</h2>
            <p>Add some amazing books to get started!</p>
            <a href="/explore" className="cart-empty-button">
              Explore Books
            </a>
          </div>
        ) : (
          <div className="cart-items">
            {data.map((book, index) => (
              <div key={book._id || index} className="cart-item slide-in-left">
                <img
                  src={book.image || "https://via.placeholder.com/120x160?text=Book+Cover"}
                  alt={book.title || book.Title || "Book Cover"}
                  className="cart-item-image"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/120x160?text=Book+Cover";
                  }}
                />
                <div className="cart-item-details">
                  <h3 className="cart-item-title">{book.title || book.Title || "Unknown Title"}</h3>
                  <p className="cart-item-author">by {book.author || book.Author || "Unknown Author"}</p>
                  <p className="cart-item-description">
                    {book.description?.slice(0, 150) || "A fascinating book that will take you on an incredible journey..."}
                    {book.description?.length > 150 ? "..." : ""}
                  </p>
                  <div style={{ marginTop: "0.5rem" }}>
                    <span style={{ 
                      background: "linear-gradient(135deg, #667eea, #764ba2)", 
                      color: "white", 
                      padding: "0.3rem 0.8rem", 
                      borderRadius: "15px", 
                      fontSize: "0.8rem",
                      fontWeight: "500"
                    }}>
                      {book.genre || book.Genre || "Fiction"}
                    </span>
                    <span style={{ 
                      background: "linear-gradient(135deg, #f39c12, #e67e22)", 
                      color: "white", 
                      padding: "0.3rem 0.8rem", 
                      borderRadius: "15px", 
                      fontSize: "0.8rem",
                      fontWeight: "500",
                      marginLeft: "0.5rem"
                    }}>
                      ₹{book.price || book.Price || Math.floor(Math.random() * 500) + 100}
                    </span>
                  </div>
                </div>
                <button
                  className="cart-item-remove"
                  onClick={() => removeFromCart(book.bookId || book._id)}
                >
                  🗑️
                </button>
                <button
                  className="cart-item-buy-now"
                  onClick={() => handleBuyNow(book)}
                >
                  Buy Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Copy Type Selection Modal */}
      {showCopyTypeModal && (
        <CopyTypeModal
          onClose={() => {
            setShowCopyTypeModal(false);
            // Reset buy now mode if modal is closed without proceeding
            if (isBuyNowMode) {
              setIsBuyNowMode(false);
              setSelectedBookForCheckout(null);
            }
          }}
          onProceed={handleCopyTypeSelection}
          items={isBuyNowMode ? [selectedBookForCheckout] : data}
          totalPrice={isBuyNowMode ? (selectedBookForCheckout?.price || selectedBookForCheckout?.Price || 0) : totalPrice}
        />
      )}

      {/* Order Details Modal */}
      {showOrderDetails && (
        <OrderDetails
          items={isBuyNowMode ? [selectedBookForCheckout] : data}
          totalPrice={isBuyNowMode ? (selectedBookForCheckout?.price || selectedBookForCheckout?.Price || 0) : totalPrice}
          onBack={handleBackFromOrderDetails}
        />
      )}

      {/* Payment Page Modal */}
      {showPaymentPage && (
        <PaymentPage
          items={isBuyNowMode ? [selectedBookForCheckout] : data}
          totalPrice={isBuyNowMode ? (selectedBookForCheckout?.price || selectedBookForCheckout?.Price || 0) : totalPrice}
          onBack={handleBackFromPayment}
        />
      )}
      
      {/* Toast Container */}
      <ToastContainer
        position="top-center"
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

export default Cart;
