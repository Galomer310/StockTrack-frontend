import React, { useState, useEffect } from "react"; // Import React and necessary hooks
import { useSelector } from "react-redux"; // Import useSelector to access Redux state
import axios from "axios"; // Import axios for HTTP requests
import { RootState } from "../store"; // Import RootState for type definitions
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

const POLYGON_API_KEY = import.meta.env.VITE_POLYGON_API_KEY; // Get the Polygon API key from environment variables

// Define the StockSearch functional component
const StockSearch: React.FC = () => {
  const [query, setQuery] = useState(""); // State for storing the search query
  const [quantity, setQuantity] = useState(1); // State for storing the quantity (default is 1)
  const [stockData, setStockData] = useState<any>(null); // State for storing basic stock data
  const [companyInfo, setCompanyInfo] = useState<any>(null); // State for storing company info
  const [companyDetails, setCompanyDetails] = useState<any>(null); // State for storing additional company details
  const [news, setNews] = useState<any[]>([]); // State for storing news articles
  const [marketStatus, setMarketStatus] = useState<string | null>(null); // State for storing market status information
  const [error, setError] = useState(""); // State for storing error messages
  const navigate = useNavigate(); // Initialize navigate for redirection
  const user = useSelector((state: RootState) => state.auth.user); // Get the current user from Redux state
  const accessToken = useSelector((state: RootState) => state.auth.accessToken); // Get the access token from Redux state

  // useEffect hook to check market status on component mount
  useEffect(() => {
    const checkMarketStatus = async () => {
      try {
        // Make a GET request to check current market status via Polygon API
        const res = await axios.get(
          `https://api.polygon.io/v1/marketstatus/now?apiKey=${POLYGON_API_KEY}`
        );
        if (res.data.market === "closed") {
          // If market is closed
          setMarketStatus(
            "🚫 The market is closed, stock prices won’t update in real time."
          );
        } else {
          setMarketStatus(null); // Clear market status if market is open
        }
      } catch (err) {
        console.error("Error checking market status", err); // Log error if request fails
      }
    };
    checkMarketStatus(); // Invoke the function to check market status
  }, []); // Empty dependency array: run only on mount

  // Function to search for a stock by its symbol
  const searchStock = async () => {
    try {
      setError(""); // Clear any previous error messages
      // Fetch basic stock data (previous close information) from Polygon API
      const stockRes = await axios.get(
        `https://api.polygon.io/v2/aggs/ticker/${query}/prev?adjusted=true&apiKey=${POLYGON_API_KEY}`
      );
      if (stockRes.data.results && stockRes.data.results.length > 0) {
        setStockData(stockRes.data.results[0]); // Use the first result if available
      } else {
        setError("No stock data available."); // Set error message if no data is returned
        setStockData(null); // Clear stockData state
      }
      // Fetch basic company info from Polygon API
      const companyRes = await axios.get(
        `https://api.polygon.io/v3/reference/tickers/${query}?apiKey=${POLYGON_API_KEY}`
      );
      setCompanyInfo(companyRes.data.results); // Update companyInfo state with fetched data
      // Fetch additional company details using the /company endpoint
      const companyDetailsRes = await axios.get(
        `https://api.polygon.io/v1/meta/symbols/${query}/company?apiKey=${POLYGON_API_KEY}`
      );
      setCompanyDetails(companyDetailsRes.data); // Update companyDetails state with fetched data
      // Fetch latest news articles about the company
      const newsRes = await axios.get(
        `https://api.polygon.io/v2/reference/news?ticker=${query}&apiKey=${POLYGON_API_KEY}`
      );
      setNews(newsRes.data.results); // Update news state with fetched articles
    } catch (err) {
      setError("Stock not found or API error."); // Set error message if request fails
      setStockData(null); // Clear stockData state
      setCompanyInfo(null); // Clear companyInfo state
      setCompanyDetails(null); // Clear companyDetails state
      setNews([]); // Clear news state
    }
  };

  // Function to add the searched stock to the watchlist
  const addToWatchlist = async () => {
    if (!user) {
      // Check if user is logged in
      setError("You must be logged in to add to watchlist"); // Set error message if not logged in
      return; // Exit the function
    }
    try {
      // Make a POST request to add the stock to the watchlist
      await axios.post(
        `${import.meta.env.VITE_BACKEND_API_URL}/watchlist`,
        { stock_symbol: query, quantity }, // Send stock symbol and quantity in the request body
        { headers: { Authorization: `Bearer ${accessToken}` } } // Include access token in headers
      );
      alert(`${query} added to watchlist with quantity ${quantity}`); // Alert success message
    } catch (err) {
      setError("Failed to add to watchlist"); // Set error message if request fails
    }
  };

  // Return the StockSearch UI
  return (
    <div className="stock-search">
      {" "}
      {/* Container with CSS class */}
      <h2>Search Stocks</h2> {/* Page heading */}
      <input
        type="text" // Input field for stock symbol query
        placeholder="Enter stock symbol" // Placeholder text
        value={query} // Bind value to query state
        onChange={(e) => setQuery(e.target.value.toUpperCase())} // Update query state (convert input to uppercase)
      />
      <button onClick={searchStock}>Search</button>{" "}
      {/* Button triggers searchStock function */}
      {marketStatus && <p className="market-status">{marketStatus}</p>}{" "}
      {/* Display market status if available */}
      {error && <p className="error">{error}</p>}{" "}
      {/* Display error message if any */}
      {/* Display basic company info if available */}
      {companyInfo && (
        <div className="company-info">
          {" "}
          {/* Container for company info */}
          {companyInfo.branding?.logo_url && (
            <img
              src={`${companyInfo.branding.logo_url}?format=png`} // Display company logo if available
              alt={`${companyInfo.name} Logo`} // Alt text for image
              style={{ width: "100px", height: "100px", objectFit: "contain" }} // Inline styles for image
            />
          )}
          <h3>{companyInfo.name}</h3> {/* Display company name */}
          <p>Industry: {companyInfo.sic_description}</p>{" "}
          {/* Display company industry */}
        </div>
      )}
      {/* Display additional company details if available */}
      {companyDetails && (
        <div className="company-details">
          {" "}
          {/* Container for additional details */}
          <h4>About {companyDetails.name}</h4> {/* Heading with company name */}
          {companyDetails.description && (
            <p>{companyDetails.description}</p>
          )}{" "}
          {/* Display description if available */}
          {companyDetails.ceo && (
            <p>
              <strong>CEO:</strong> {companyDetails.ceo}{" "}
              {/* Display CEO information */}
            </p>
          )}
          {companyDetails.industry && (
            <p>
              <strong>Industry:</strong> {companyDetails.industry}{" "}
              {/* Display industry */}
            </p>
          )}
          {companyDetails.employees && (
            <p>
              <strong>Employees:</strong> {companyDetails.employees}{" "}
              {/* Display number of employees */}
            </p>
          )}
          {companyDetails.website && (
            <p>
              <strong>Website:</strong>{" "}
              <a
                href={companyDetails.website} // Link to company website
                target="_blank" // Open link in a new tab
                rel="noopener noreferrer" // Security attributes
              >
                {companyDetails.website} {/* Display website URL */}
              </a>
            </p>
          )}
        </div>
      )}
      {/* Display basic stock data if available */}
      {stockData && (
        <div className="stock-info">
          {" "}
          {/* Container for stock information */}
          <h3>
            {query} - Closing Price: ${stockData.c}{" "}
            {/* Display stock symbol and closing price */}
          </h3>
          <p>Volume: {stockData.v}</p> {/* Display stock volume */}
          <button onClick={addToWatchlist} disabled={!user}>
            {" "}
            {/* Button to add to watchlist; disabled if no user */}
            Add to Watchlist
          </button>
          <input
            type="number" // Input field for quantity selection
            min="1" // Minimum value is 1
            placeholder="choose quantity" // Placeholder text
            value={quantity} // Bind value to quantity state
            onChange={(e) => setQuantity(Number(e.target.value))} // Update quantity state on change
          />
        </div>
      )}
      {/* Display recent news articles if any exist */}
      {news.length > 0 && (
        <div className="company-news">
          {" "}
          {/* Container for news articles */}
          <h4>Latest News</h4> {/* Heading for news section */}
          <ul>
            {news.map(
              (
                article // Map over each news article
              ) => (
                <li key={article.id}>
                  {" "}
                  {/* Unique key for each article */}
                  <a
                    href={article.article_url} // Link to full article
                    target="_blank" // Open link in a new tab
                    rel="noopener noreferrer" // Security attributes
                  >
                    {article.title} {/* Display article title */}
                  </a>
                  <p>{new Date(article.published_utc).toLocaleString()}</p>{" "}
                  {/* Display formatted publication date */}
                </li>
              )
            )}
          </ul>
        </div>
      )}
      <button onClick={() => navigate("/")}>Log Out</button>{" "}
      {/* Button to navigate back to Home (logout) */}
      <button onClick={() => navigate("/user")}>User Dashboard</button>{" "}
      {/* Button to navigate to user dashboard */}
    </div>
  );
};

export default StockSearch; // Export component as default
