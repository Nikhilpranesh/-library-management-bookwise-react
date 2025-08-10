import React, { useEffect, useState } from "react";
import axios from "axios";

const Recommendations = ({ username }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`http://localhost:5000/recommendations/${username}`);
        setBooks(data.books || []);
      } catch {}
      setLoading(false);
    };
    if (username) load();
  }, [username]);

  if (!username) return null;

  return (
    <section style={{ marginTop: "1.5rem" }}>
      <h3 style={{ margin: 0, marginBottom: "0.75rem" }}>Recommended for you</h3>
      {loading ? (
        <div>Loading…</div>
      ) : books.length === 0 ? (
        <div>No recommendations yet.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
          {books.map((b) => (
            <div key={b._id} style={{ border: "1px solid #eee", borderRadius: "1rem", padding: "1rem", background: "#fff" }}>
              <h4>{b.Title}</h4>
              <p>{b.Author}</p>
              <div style={{ fontSize: "0.8rem", color: "#777" }}>Book ID: {b._id}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Recommendations; 