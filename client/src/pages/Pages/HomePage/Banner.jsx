import React, { useState, useEffect } from "react";
import axios from "axios";

const Banner = ({ user }) => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    borrowedBooks: 0,
    overdueBooks: 0,
    totalMembers: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch books count
        const booksResponse = await axios.get("http://localhost:5000/allBook");
        const totalBooks = booksResponse.data.length;

        // Fetch borrowed books
        const borrowedResponse = await axios.get("http://localhost:5000/borrowedBooks");
        const borrowedBooks = borrowedResponse.data.length;

        // Mock data for other stats (you can replace with actual API calls)
        const overdueBooks = Math.floor(borrowedBooks * 0.1); // 10% of borrowed books
        const totalMembers = Math.floor(totalBooks * 0.8); // Mock member count

        setStats({
          totalBooks,
          borrowedBooks,
          overdueBooks,
          totalMembers
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="modern-card slide-in-right">
      <div className="home-banner">
        Welcome back, {user.username}! 📚
      </div>
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-number">{stats.totalBooks}</div>
          <div className="stat-label">Total Books</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.borrowedBooks}</div>
          <div className="stat-label">Borrowed Books</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.overdueBooks}</div>
          <div className="stat-label">Overdue Books</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalMembers}</div>
          <div className="stat-label">Total Members</div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
