import { useEffect, useState } from "react"; // Import useEffect and useState hooks
import axiosInstance from "../api/axiosInstance";
import { useParams } from "react-router-dom"; // Import useParams to access route parameters
import { Line } from "react-chartjs-2"; // Import Line chart component from react-chartjs-2
import "chart.js/auto"; // Import auto-registration for Chart.js components

// Market data is proxied through our backend, which holds the Polygon API key.

// Define the StockDetails functional component (note: file name is StackDetails.tsx but component is StockDetails)
const StockDetails = () => {
  const { ticker } = useParams(); // Destructure the ticker parameter from the URL
  const [companyInfo, setCompanyInfo] = useState<any>(null); // State for storing company information
  const [chartData, setChartData] = useState<any>(null); // State for storing chart data

  // useEffect hook to fetch company info and chart data when ticker changes
  useEffect(() => {
    const fetchStockDetails = async () => {
      try {
        // Fetch company information from Polygon API
        const companyRes = await axiosInstance.get(
          `${import.meta.env.VITE_BACKEND_API_URL}/stocks/${ticker}/details`
        );
        setCompanyInfo(companyRes.data.results); // Update companyInfo state with fetched data

        // Fetch aggregated chart data from Polygon API for a specific date range
        const chartRes = await axiosInstance.get(
          `${import.meta.env.VITE_BACKEND_API_URL}/stocks/${ticker}/aggregates`,
          {
            params: {
              multiplier: 1,
              timespan: "day",
              from: "2024-01-01",
              to: "2024-02-01",
            },
          }
        );
        // Prepare chart data object
        setChartData({
          labels: chartRes.data.results.map(
            (entry: any) => new Date(entry.t).toLocaleDateString() // Convert timestamp to locale date string
          ),
          datasets: [
            {
              label: `${ticker} Stock Price`, // Label for the dataset
              data: chartRes.data.results.map((entry: any) => entry.c), // Use closing prices as data points
              borderColor: "red", // Set the line color to red
              borderWidth: 2, // Set the line width
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching stock details:", error); // Log error if fetching fails
      }
    };
    fetchStockDetails(); // Invoke the async function to fetch details
  }, [ticker]); // Dependency array: re-run when ticker changes

  // Return the UI for the StockDetails page
  return (
    <div>
      {companyInfo && ( // If companyInfo is available, display it
        <div>
          <img
            src={`${companyInfo.branding?.logo_url}?format=png`} // Display company logo if available
            alt="Company Logo" // Alt text for the image
            width="100" // Set width of the image
          />
          <h1>
            {companyInfo.name} ({ticker}){" "}
            {/* Display company name and ticker */}
          </h1>
        </div>
      )}
      {chartData && <Line data={chartData} />}{" "}
      {/* Render Line chart if chartData is available */}
    </div>
  );
};

export default StockDetails; // Export component as default
