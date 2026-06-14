import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute
from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import BusinessDashboard from "./pages/BusinessDashboard";
import TestLocation from "./pages/TestLocation";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <BusinessDashboard />
    </ProtectedRoute>
  }
/>

        <Route
          path="/test-location"
          element={<TestLocation />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;