import { Routes, Route, BrowserRouter as Router, Navigate } from "react-router-dom";
import HomePage from "./pages/Pages/HomePage/HomePage"
import SignIn from "./pages/LoginSingup/SignIn.jsx";
import SignUp from "./pages/LoginSingup/SignUp.jsx";
import Profile from "./pages/Pages/Profile/Profile";
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./pages/Components/Navbar";
import LandingPage from "./pages/Pages/LandingPage";
import Cart from "./pages/Pages/Cart/Cart";
import EditProfile from "./pages/Pages/Profile/EditProfile"
import Borrower from "./pages/Pages/Cart/Borrower";
import Explore from "./pages/Pages/Explore/Explore";
import PublicList from "./pages/Pages/Explore/PublicList";
import Checkout from "./pages/Pages/Checkout/Checkout";
import OrderConfirmation from "./pages/Pages/Checkout/OrderConfirmation";
import PublishFavorites from "./pages/Pages/Explore/PublishFavorites";

import Orders from "./pages/Pages/Orders/Orders";
import Favorites from "./pages/Pages/Favorites/Favorites";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminDashboard from "./pages/Admin/AdminDashboard";

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const { data } = await axios.get(`http://localhost:5000/logedinuser/`, { withCredentials: true });
      setUser(data.user);
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Router>
        {user && <Navbar user={user} />}
        {!isLoading && (
          <Routes>
            <Route
              exact
              path="/"
              element={user ? <Navigate to="/home" /> : <LandingPage />}
            />
            <Route
              exact
              path="/home"
              element={user ? <HomePage user={user} /> : <SignIn />}
            />
            <Route exact path="/explore" element={user ? <Explore user={user} /> : <Navigate to="/signin" />} />
            <Route exact path="/publish" element={<PublishFavorites />} />
            <Route exact path="/list/:slug" element={<PublicList />} />
            <Route exact path="/checkout" element={<Checkout />} />
            <Route exact path="/order/:id" element={<OrderConfirmation />} />
            <Route
              exact
              path="/signup"
              element={user ? <Navigate to="/home" /> : <SignUp />}
            />
            <Route
              exact
              path="/signin"
              element={user ? <Navigate to="/home" /> : <SignIn />}
            />
            <Route
              exact
              path="/cart"
              element={user ? <Cart user={user} /> : <Navigate to="/home" />}
            />
            <Route
              exact
              path="/profile"
              element={user ? <Profile user={user} /> : <Navigate to="/home" />}
            />
            <Route
              exact
              path="/edit/:id"
              element={user ? <EditProfile user={user} /> : <Navigate to="/home" />}
            />
            <Route
              exact
              path="/borrower"
              element={user ? <Borrower user={user} /> : <Navigate to="/home" />}
            />

            <Route
              exact
              path="/orders"
              element={user ? <Orders user={user} /> : <Navigate to="/home" />}
            />
            <Route
              exact
              path="/favorites"
              element={user ? <Favorites user={user} /> : <Navigate to="/home" />}
            />
            
            {/* Admin Routes */}
            <Route exact path="/admin/login" element={<AdminLogin />} />
            <Route exact path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        )}
      </Router>
    </>
  );
}

export default App;
