import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../Checkout/checkout.css";

const PublishFavorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("My Favorite Books");
  const [publishing, setPublishing] = useState(false);
  const [publishedLink, setPublishedLink] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("bookwise_favorites");
      const favs = raw ? JSON.parse(raw) : [];
      setFavorites(favs);
    } catch {
      setFavorites([]);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!favorites || favorites.length === 0) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data } = await axios.get("http://localhost:5000/allBook");
        setAllBooks(data.books || []);
      } catch (e) {
        setError("Failed to load books. Try again.");
      }
      setLoading(false);
    };
    load();
  }, [favorites]);

  const filteredBooks = useMemo(() => {
    const setBookIds = new Set(favorites);
    return (allBooks || []).filter((b) => setBookIds.has(b._id));
  }, [allBooks, favorites]);

  const publish = async () => {
    if (favorites.length === 0) {
      alert("No favorites to publish. Add some in Explore.");
      return;
    }
    if (!title.trim()) {
      alert("Please enter a list title.");
      return;
    }
    setPublishing(true);
    setError("");
    try {
      const { data } = await axios.post("http://localhost:5000/lists/publish", {
        title: title.trim(),
        isbns: favorites,
      });
      const url = `${window.location.origin}/list/${data.slug}`;
      setPublishedLink(url);
      try { await navigator.clipboard.writeText(url); } catch {}
    } catch (e) {
      setError("Failed to publish list. Please try again.");
    }
    setPublishing(false);
  };

  if (loading) {
    return (
      <div className="checkout-bg"><div className="checkout-card">Loading favorites…</div></div>
    );
  }

  if (!favorites || favorites.length === 0) {
    return (
      <div className="checkout-bg">
        <div className="checkout-card">
          <h2 style={{ marginTop: 0 }}>Publish favorites</h2>
          <div style={{ marginBottom: "1rem" }}>You have no favorites yet.</div>
          <button className="primary-btn" onClick={() => navigate("/explore")}>Go to Explore</button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-bg">
      <div className="checkout-card">
        <h2 style={{ marginTop: 0 }}>Publish favorites</h2>
        {error && (
          <div style={{ color: "#ffd1d1", background: "#5a1f1f", border: "1px solid #7a2b2b", padding: "0.5rem 0.75rem", borderRadius: 8, marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        <section style={{ marginBottom: "1rem" }}>
          <label htmlFor="list-title" style={{ display: "block", marginBottom: 6 }}>List title</label>
          <input
            id="list-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: 8, border: "1px solid #ddd" }}
            placeholder="Enter a catchy list title"
          />
        </section>

        <section style={{ marginBottom: "1rem" }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Preview ({filteredBooks.length} item{filteredBooks.length !== 1 ? "s" : ""})</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", rowGap: 8 }}>
            {filteredBooks.map((b) => (
              <React.Fragment key={b._id}>
                <div>{b.Title} <span style={{ color: "#777" }}>(Book ID: {b._id})</span></div>
                <div style={{ color: "#555" }}>{b.Author}</div>
              </React.Fragment>
            ))}
          </div>
        </section>

        {publishedLink ? (
          <section>
            <div style={{ marginBottom: 8 }}>Your list is live:</div>
            <div style={{ wordBreak: "break-all", padding: "0.6rem 0.8rem", border: "1px solid #ddd", borderRadius: 8, marginBottom: 8 }}>{publishedLink}</div>
            <div className="checkout-actions">
              <button className="primary-btn" onClick={() => window.open(publishedLink, "_blank")}>Open list</button>
              <button className="primary-btn" onClick={() => navigate(`/list/${publishedLink.split("/").pop()}`)}>View here</button>
              <button className="primary-btn" onClick={() => navigate("/explore")}>Back to Explore</button>
            </div>
          </section>
        ) : (
          <div className="checkout-actions">
            <button className="primary-btn" disabled={publishing} onClick={publish}>
              {publishing ? "Publishing…" : "Publish list"}
            </button>
            <button className="primary-btn" onClick={() => navigate("/explore")}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublishFavorites; 