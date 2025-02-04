// frontend/src/pages/ManualAddStock.tsx
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ManualAddStock = () => {
  const [stockSymbol, setStockSymbol] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState("");
  const [date, setDate] = useState("");
  const [industry, setIndustry] = useState("");
  const [error, setError] = useState("");

  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:3000/watchlist",
        {
          stock_symbol: stockSymbol.toUpperCase(),
          quantity,
          price_at_time: price,
          added_at: date,
          industry,
          manual: true,
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      alert("Stock added manually!");
      navigate("/user");
    } catch (err: any) {
      setError(err.response?.data.error || "Failed to add stock");
    }
  };

  return (
    <div className="manual-add-stock">
      <h2>Add Stock Manually</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Stock Symbol"
          value={stockSymbol}
          onChange={(e) => setStockSymbol(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          min="1"
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          step="0.01"
          required
        />
        <input
          type="datetime-local"
          placeholder="Date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Industry (optional)"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
        />
        <button type="submit">Add Stock Manually</button>
      </form>
    </div>
  );
};

export default ManualAddStock;
