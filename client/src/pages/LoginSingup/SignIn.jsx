import { useState } from "react";
import "../Assets/css/login.css";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Navigate, useNavigate } from "react-router-dom";

const Signin = () => {
  const [user, setUser] = useState({});
  const navigate = useNavigate();
  
  const handleInputs = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };
  
  const submitForm = async () => {
    try {
      const response = await axios.post(`http://localhost:5000/login`, user, {
        withCredentials: true,
      });

      const message = response.data.message;
      const status = response.data.status;

      if (status === "200") {
        toast.success(message, {
          position: "top-center",
          autoClose: 2000,
          pauseOnHover: false,
          pauseOnFocusLoss: false,
          draggable: true,
          textAlign: "center",
        });
        window.location.href = "/profile";
      } else if (status === "202") {
        toast.warn(message, {
          position: "top-center",
          autoClose: 2000,
          pauseOnHover: false,
          pauseOnFocusLoss: false,
          draggable: true,
          textAlign: "center",
          theme: "dark",
        });
      } else if (status === "500") {
        toast.error(message, {
          position: "top-center",
          autoClose: 2000,
          pauseOnHover: false,
          pauseOnFocusLoss: false,
          draggable: true,
          textAlign: "center",
          theme: "dark",
        });
      }
    } catch (error) {
      console.error("An error occurred:", error);

      if (error.message === "Network Error") {
        toast.error("Network error. Please check your internet connection.", {
          position: "top-center",
          autoClose: 2000,
          pauseOnHover: false,
          pauseOnFocusLoss: false,
          draggable: true,
          textAlign: "center",
          theme: "dark",
        });
      }
    }
  };

  const img1 = "https://github.com/AnuragRoshan/images/blob/main/Lovepik_com-450098997-Account%20login%20flat%20illustration.png?raw=true";
  
  return (
    <div className="login-top">
      <div className="login-form-top fade-in-up">
        <div className="login-form-left slide-in-left">
          <img src={img1} alt="Login Illustration" />
          <div className="login-new-user">
            <p>New to bookWise? <a href="/signup">Create an account</a></p>
          </div>
        </div>
        
        <div className="login-form-right slide-in-right">
          <div className="login-title">
            <h2>Welcome Back</h2>
            <p>Sign in to your account to continue</p>
          </div>
          
          <div className="login-form">
            <div className="login-field">
              <span className="icon">👤</span>
              <input
                type="text"
                name="username"
                placeholder="Username"
                onChange={handleInputs}
                required
              />
            </div>
            
            <div className="login-field">
              <span className="icon">🔒</span>
              <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleInputs}
                required
              />
            </div>
            
            <button className="login-button" onClick={submitForm}>
              Sign In
            </button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Signin;
