import { useState } from "react"; // Import useState hook from React
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { useToast } from "../components/ui/ToastProvider";
import TradeNoteModal, { TradeSubmission } from "../components/trades/TradeNoteModal";

// Define the ManualAddStock functional component
const ManualAddStock = () => {
  const [stockSymbol, setStockSymbol] = useState(""); // State for stock symbol input
  const [quantity, setQuantity] = useState(1); // State for quantity (default 1)
  const [price, setPrice] = useState(""); // State for price input
  const [date, setDate] = useState(""); // State for date input
  const [industry, setIndustry] = useState(""); // State for industry input (optional)
  const [error, setError] = useState(""); // State for error messages
  const navigate = useNavigate(); // Initialize navigate for redirection
  const toast = useToast();
  const [noteOpen, setNoteOpen] = useState(false); // note window for the entry

  // The form only collects the trade details; submitting opens the note
  // window, and the entry is recorded once the thesis is written.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNoteOpen(true);
  };

  // Records the backdated purchase together with its note.
  const recordPurchase = async ({ note }: TradeSubmission) => {
    await axiosInstance.post(
      `${import.meta.env.VITE_BACKEND_API_URL}/watchlist`,
      {
        stock_symbol: stockSymbol.toUpperCase(),
        quantity,
        price_at_time: price,
        added_at: date,
        industry,
        manual: true,
        note,
      }
    );
    setNoteOpen(false);
    toast.success(
      `${stockSymbol.toUpperCase()} × ${quantity} at $${price} added, with your note.`,
      "Purchase recorded"
    );
    navigate("/user");
  };

  // Return the manual add stock form UI
  return (
    <div className="manual-add-stock">
      {" "}
      {/* Container with CSS class */}
      <h2>Add Stock Manually</h2> {/* Form heading */}
      <TradeNoteModal
        open={noteOpen}
        mode="buy"
        symbol={stockSymbol.toUpperCase() || "—"}
        defaultQuantity={quantity}
        defaultPrice={parseFloat(price) || 0}
        onClose={() => setNoteOpen(false)}
        onSubmit={recordPurchase}
      />
      {error && <p className="error">{error}</p>}{" "}
      {/* Display error message if any */}
      <form onSubmit={handleSubmit}>
        {" "}
        {/* Form submission triggers handleSubmit */}
        <input
          type="text" // Input field for stock symbol
          placeholder="Stock Symbol" // Placeholder text
          value={stockSymbol} // Bind value to stockSymbol state
          onChange={(e) => setStockSymbol(e.target.value)} // Update state on change
          required // Mark as required
        />
        <input
          type="number" // Input field for quantity
          placeholder="Quantity" // Placeholder text
          value={quantity} // Bind value to quantity state
          onChange={(e) => setQuantity(Number(e.target.value))} // Update state on change
          min="1" // Minimum value is 1
          required // Mark as required
        />
        <input
          type="number" // Input field for price
          placeholder="Price" // Placeholder text
          value={price} // Bind value to price state
          onChange={(e) => setPrice(e.target.value)} // Update state on change
          step="0.01" // Step for decimal values
          required // Mark as required
        />
        <input
          type="datetime-local" // Input field for date/time
          placeholder="Date" // Placeholder text (note: placeholder might not be visible for datetime-local)
          value={date} // Bind value to date state
          onChange={(e) => setDate(e.target.value)} // Update state on change
          required // Mark as required
        />
        <input
          type="text" // Input field for industry (optional)
          placeholder="Industry (optional)" // Placeholder text
          value={industry} // Bind value to industry state
          onChange={(e) => setIndustry(e.target.value)} // Update state on change
        />
        <button type="submit">Continue to notes…</button> {/* Submit button */}
      </form>
    </div>
  );
};

export default ManualAddStock; // Export component as default
