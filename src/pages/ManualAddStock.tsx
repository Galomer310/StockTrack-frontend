import { useState } from "react"; // Import useState hook from React
import { useSelector } from "react-redux"; // Import useSelector to access Redux state
import { RootState } from "../store"; // Import RootState for type definitions
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

// Define the ManualAddStock functional component
const ManualAddStock = () => {
  const [stockSymbol, setStockSymbol] = useState(""); // State for stock symbol input
  const [quantity, setQuantity] = useState(1); // State for quantity (default 1)
  const [price, setPrice] = useState(""); // State for price input
  const [date, setDate] = useState(""); // State for date input
  const [industry, setIndustry] = useState(""); // State for industry input (optional)
  const [error, setError] = useState(""); // State for error messages
  // Get the access token from Redux state
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const navigate = useNavigate(); // Initialize navigate for redirection

  // Handler function for the form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    try {
      // Make a POST request to add the stock manually
      await axiosInstance.post(
        `${import.meta.env.VITE_BACKEND_API_URL}/watchlist`,
        {
          stock_symbol: stockSymbol.toUpperCase(), // Convert symbol to uppercase
          quantity, // Quantity from state
          price_at_time: price, // Price at time from state
          added_at: date, // Date added from state
          industry, // Industry from state (optional)
          manual: true, // Flag indicating manual addition
        },
        { headers: { Authorization: `Bearer ${accessToken}` } } // Include access token in headers
      );
      alert("Stock added manually!"); // Alert success message
      navigate("/user"); // Redirect to user dashboard
    } catch (err: any) {
      // Update error state with error message from response if available
      setError(err.response?.data.error || "Failed to add stock");
    }
  };

  // Return the manual add stock form UI
  return (
    <div className="manual-add-stock">
      {" "}
      {/* Container with CSS class */}
      <h2>Add Stock Manually</h2> {/* Form heading */}
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
        <button type="submit">Add Stock Manually</button> {/* Submit button */}
      </form>
    </div>
  );
};

export default ManualAddStock; // Export component as default
