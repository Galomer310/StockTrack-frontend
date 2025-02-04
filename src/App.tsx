// frontend/src/App.tsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "./store";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserPage from "./pages/UserPage";
import StockSearch from "./pages/StockSearch";
import ManualAddStock from "./pages/ManualAddStock";
import Navbar from "./components/layout/Navbar";

const App = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/user"
          element={user ? <UserPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/search"
          element={user ? <StockSearch /> : <Navigate to="/login" />}
        />
        <Route
          path="/manual-add"
          element={user ? <ManualAddStock /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
};

export default App;
