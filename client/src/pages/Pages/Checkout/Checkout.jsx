import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./checkout.css";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const Checkout = () => {
  const navigate = useNavigate();
  const query = useQuery();
  const [isbns, setIsbns] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState("COD");
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    const raw = query.get("isbns") || "";
    const list = raw.split(",").map((s) => s.trim()).filter(Boolean);
    setIsbns(list);
  }, [query]);

  useEffect(() => {
    const load = async () => {
      if (isbns.length === 0) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const { data } = await axios.post("http://localhost:5000/pricing", { isbns });
        setItems(data.prices || []);
      } catch (e) {
        setError("Failed to fetch pricing. Please try again.");
      }
      setLoading(false);
    };
    load();
  }, [isbns]);

  const total = items.reduce((s, it) => s + (it.price || 0), 0);

  const placeOrder = async () => {
    if (!address.trim()) {
      alert("Please enter a shipping address");
      return;
    }
    setPlacing(true);
    try {
      const { data } = await axios.post("http://localhost:5000/order", {
        username: "guest",
        isbns,
        shippingAddress: address,
        paymentMethod: payment,
      });
      navigate(`/order/${data.orderId}`, { state: { order: data, items } });
    } catch (e) {
      alert("Failed to place order. Try again.");
    }
    setPlacing(false);
  };

  if (loading) return <div className="checkout-bg"><div className="checkout-card">Loading checkout…</div></div>;
  if (isbns.length === 0) return <div className="checkout-bg"><div className="checkout-card">No items selected. Go back to Explore and choose books to buy.</div></div>;

  return (
    <div className="checkout-bg">
      <div className="checkout-card">
        <h2 style={{ marginTop: 0 }}>Checkout</h2>
        {error && <div style={{ color: "#ffd1d1", background: "#5a1f1f", border: "1px solid #7a2b2b", padding: "0.5rem 0.75rem", borderRadius: 8, marginBottom: "1rem" }}>{error}</div>}

        <section style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ margin: 0, marginBottom: "0.75rem" }}>Order summary</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", rowGap: "0.5rem" }}>
            {items.map((it) => (
              <React.Fragment key={it.isbn}>
                <div>{it.title} <span style={{ color: "#777" }}>({it.isbn})</span></div>
                <div>₹{it.price}</div>
              </React.Fragment>
            ))}
            <div style={{ borderTop: "1px solid #ddd", marginTop: "0.5rem" }} />
            <div style={{ fontWeight: 600 }}>Total</div>
            <div style={{ fontWeight: 600 }}>₹{total}</div>
          </div>
        </section>

        <section style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ margin: 0, marginBottom: "0.75rem" }}>Shipping address</h3>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter full address"
            rows={4}
            style={{ width: "100%", border: "1px solid #ddd", borderRadius: "0.5rem", padding: "0.75rem" }}
          />
        </section>

        <section style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ margin: 0, marginBottom: "0.75rem" }}>Payment method</h3>
          <select value={payment} onChange={(e) => setPayment(e.target.value)} style={{ padding: "0.6rem 0.9rem", borderRadius: "0.5rem", border: "1px solid #ddd" }}>
            <option value="COD">Cash on Delivery (COD)</option>
            <option value="CARD" disabled>Card (coming soon)</option>
            <option value="UPI" disabled>UPI (coming soon)</option>
          </select>
        </section>

        <div className="checkout-actions">
          <button onClick={placeOrder} disabled={placing} className="primary-btn">
            {placing ? "Placing order…" : `Place order for ₹${total}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 