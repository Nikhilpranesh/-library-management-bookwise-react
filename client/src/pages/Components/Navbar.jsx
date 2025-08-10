import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../Assets/css/navbar.css";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ThemeToggle from "./ThemeToggle";

const Navbar = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleExploreClick = () => {
    navigate("/explore");
  };

  const handleRecentlyAddedClick = () => {
    navigate("/profile");
  };

  const handelCart = () => {
    if (user.userType === "user") {
      navigate("/cart");
    } else {
      navigate("/borrower");
    }
  };

  const handleOrdersClick = () => {
    navigate("/orders");
  };

  const handleFavoritesClick = () => {
    navigate("/favorites");
  };

  const handleLogout = async () => {
    // Clear user-specific data from localStorage
    if (user?.username) {
      const favoritesKey = `bookwise_favorites_${user.username}`;
      localStorage.removeItem(favoritesKey);
      
      // Clear any other user-specific keys that might exist
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes(user.username)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }

    await axios
      .post(`http://localhost:5000/logout`, null, {
        withCredentials: true,
      })
      .then((response) => {
        var message = response.data.msg;
        var status = response.status;
        console.log(message);

        if (status === 200) {
          toast.success(`${message}`, {
            position: "top-center",
            autoClose: 2000,
            pauseOnHover: false,
            pauseOnFocusLoss: false,
            draggable: true,
            textAlign: "center",
          });
          setTimeout(() => {
            window.location.href = "/";
          }, 1500);
        } else if (status === 202) {
          toast.warn(`${message}`, {
            position: "top-center",
            autoClose: 2000,
            pauseOnHover: false,
            pauseOnFocusLoss: false,
            draggable: true,
            textAlign: "center",
          });
        }
      });
  };

  // Function to determine whether a link should be underlined
  const isLinkActive = (path) => location.pathname === path;

  // Get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return "U";
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div>
      <div className="nav-top">
        <div className="nav-inner-top">
          <div>
            <div
              onClick={() => navigate("/home")}
              style={{
                fontSize: "2.4rem",
                fontWeight: "700",
                cursor: "pointer",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              bookWise
            </div>
          </div>
          <div className="nav-inner-element">
            <div
              className={`linked ${
                isLinkActive("/explore") ? "underline-link" : ""
              }`}
              onClick={handleExploreClick}
            >
              🔍 Explore
            </div>
            <div
              className={`linked ${
                isLinkActive("/profile") ? "underline-link" : ""
              }`}
              onClick={handleRecentlyAddedClick}
            >
              👤 Profile
            </div>
            <div
              className={`linked ${
                isLinkActive("/cart") || isLinkActive("/borrower") ? "underline-link" : ""
              }`}
              onClick={handelCart}
            >
              🛒 {user.userType === "user" ? "Cart" : "Borrower"}
            </div>
            <div
              className={`linked ${
                isLinkActive("/orders") ? "underline-link" : ""
              }`}
              onClick={handleOrdersClick}
            >
              📋 Orders
            </div>
            <div
              className={`linked ${
                isLinkActive("/favorites") ? "underline-link" : ""
              }`}
              onClick={handleFavoritesClick}
            >
              ❤️ Favorites
            </div>
          </div>
          <div className="nav-inner-element">
            <div className="user-profile">
              <div className="user-avatar">
                {getUserInitials(user.username)}
              </div>
              <div className="user-info">
                <div className="user-name">{user.username}</div>
                <div className="user-role">{user.userType}</div>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Navbar;
