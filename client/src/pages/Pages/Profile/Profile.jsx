import React, { useState, useEffect } from "react";
import "../../Assets/css/profile.css";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Profile = ({ user }) => {
  const dateStr = user.createdAt;
  const date = new Date(dateStr);
  const options = { day: "numeric", month: "long", year: "numeric" };
  const formattedDate = date.toLocaleDateString("en-US", options);

  const [data, setData] = useState({
    name: user.name || "",
    username: user.username || "",
    phone: user.phone || "",
    address: user.address || "",
    uniqueId: user.uniqueId || "",
  });

  const handleInputs = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const submitForm = async () => {
    try {
      const response = await axios.post(`http://localhost:5000/updateUser`, data);
      const message = response.data.msg;
      const status = response.status;

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
          window.location.href = "/profile";
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
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update profile", {
        position: "top-center",
        autoClose: 2000,
        pauseOnHover: false,
        pauseOnFocusLoss: false,
        draggable: true,
        textAlign: "center",
      });
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-content">
        <div className="profile-header fade-in">
          <div className="profile-name">{data.name || user.username}</div>
          <div className="profile-username">@{user.username}</div>
          <div className="profile-role">{user.userType}</div>
          <div style={{ marginTop: "1rem", color: "#7f8c8d" }}>
            Member since {formattedDate}
          </div>
        </div>

        <div className="profile-form slide-in-left">
          <div className="profile-form-title">Edit Profile</div>
          <div className="profile-form-grid">
            <div className="profile-field">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={data.name}
                onChange={handleInputs}
                placeholder="Enter your full name"
              />
            </div>
            <div className="profile-field">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={data.username}
                onChange={handleInputs}
                placeholder="Enter username"
                disabled
              />
            </div>
            <div className="profile-field">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={data.phone}
                onChange={handleInputs}
                placeholder="Enter phone number"
              />
            </div>
            <div className="profile-field">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={data.address}
                onChange={handleInputs}
                placeholder="Enter your address"
              />
            </div>
            <div className="profile-field">
              <label>Unique ID</label>
              <input
                type="text"
                name="uniqueId"
                value={data.uniqueId}
                onChange={handleInputs}
                placeholder="Enter unique ID"
                disabled
              />
            </div>
          </div>
          <button className="profile-button" onClick={submitForm}>
            Update Profile
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Profile;
