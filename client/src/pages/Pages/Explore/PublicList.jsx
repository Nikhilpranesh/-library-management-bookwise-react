import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const PublicList = () => {
  const { slug } = useParams();
  const [list, setList] = useState({ title: "", owner: "", books: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await axios.get(`http://localhost:5000/lists/${slug}`);
        setList(data);
      } catch (e) {
        setError("List not found");
      }
      setLoading(false);
    };
    load();
  }, [slug]);

  if (loading) return <div style={{ padding: "2rem" }}>Loading…</div>;
  if (error) return <div style={{ padding: "2rem" }}>{error}</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ marginTop: 0 }}>{list.title}</h2>
      <div style={{ color: "#666", marginBottom: "1rem" }}>By {list.owner || "guest"}</div>
      {list.books.length === 0 ? (
        <div>No books in this list.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
          {list.books.map((b) => (
            <div key={b._id} style={{ border: "1px solid #eee", borderRadius: "1rem", padding: "1rem", background: "#fff" }}>
              <h4>{b.Title}</h4>
              <p>{b.Author}</p>
              <div style={{ fontSize: "0.8rem", color: "#777" }}>Book ID: {b._id}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicList; 