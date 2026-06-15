import { useEffect, useState } from "react";
import api from "../services/api";

function BusinessDashboard() {

  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);
  const token =
  localStorage.getItem("token");

if (!token) {

  window.location.href =
    "/login";

  return;
}
const BACKEND_URL =
  "https://reviewpe-production.up.railway.app";

  const fetchDashboard = async () => {
    try {

      const token =
        localStorage.getItem("token");

      const response = await api.get(
        "/dashboard",
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setData(response.data);
      }

    } catch (error) {

      console.error(error);

      alert("Session Expired");

      localStorage.removeItem("token");

      localStorage.clear();

window.location.replace(
  "/login"
);
    }
  };

  const logout = () => {

    localStorage.removeItem("token");

    window.location.href = "/login";
  };

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold">
          Loading Dashboard...
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Header */}

      <div className="bg-white shadow">

        <div className="max-w-7xl mx-auto p-5 flex justify-between items-center">

          <h1 className="text-3xl font-bold">
            ReviewPe Dashboard
            <p className="text-slate-500">
  Welcome,
  {" "}
  {data.business_name}
</p>
          </h1>


          <button
            onClick={logout}
            className="bg-red-600 text-white px-5 py-2 rounded-lg"
          >
            Logout
          </button>

        </div>

      </div>

      <div className="max-w-7xl mx-auto p-6">

        {/* Profile Card */}

        <div className="bg-white rounded-2xl shadow p-8 mb-8">

          <div className="flex flex-col md:flex-row gap-8 items-center">

            <img
              src={
  data.logo_url
    ? `https://reviewpe-production.up.railway.app/${data.logo_url}`
    : "/default-business.png"
}
              alt="Logo"
              className="w-32 h-32 rounded-full object-cover border"
            />

            <div>

              <h2 className="text-3xl font-bold">
                {data.business_name}
              </h2>

              <p className="text-slate-500 mt-2">
                {data.category}
              </p>

              <p className="mt-1">
                {data.city}
              </p>

              <p className="mt-3 font-semibold">
                ReviewPe ID:
              </p>

              <p>
                {data.reviewpe_business_id}
              </p>

            </div>

          </div>

        </div>

        {/* Statistics */}

        <div className="grid md:grid-cols-4 gap-6">

          <div className="bg-white p-6 rounded-2xl shadow">

            <h3 className="font-semibold text-slate-600">
              Trust Score
            </h3>

            <p className="text-5xl font-bold mt-4">
              {data.trust_score}
            </p>

          </div>

          <div className="bg-white p-6 rounded-2xl shadow">

            <h3 className="font-semibold text-slate-600">
              Average Rating
            </h3>

            <p className="text-5xl font-bold mt-4">
              {data.average_rating}
            </p>

          </div>

          <div className="bg-white p-6 rounded-2xl shadow">

            <h3 className="font-semibold text-slate-600">
              Reviews
            </h3>

            <p className="text-5xl font-bold mt-4">
              {data.total_reviews}
            </p>

          </div>

          <div className="bg-white p-6 rounded-2xl shadow">

            <h3 className="font-semibold text-slate-600">
              GST Match
            </h3>

            <p className="text-5xl font-bold mt-4">
              {data.gst_match_score || 0}
            </p>

          </div>

        </div>

        {/* GST Status */}

        <div className="bg-white rounded-2xl shadow p-6 mt-8">

          <h2 className="text-2xl font-bold mb-4">
            GST Verification
          </h2>

          <div className="flex items-center gap-4">

            <span className="font-semibold">
              Status:
            </span>

            <span
              className={`px-4 py-2 rounded-lg text-white ${
                data.gst_verification_status ===
                "VERIFIED"
                  ? "bg-green-600"
                  : "bg-yellow-500"
              }`}
            >
              {data.gst_verification_status}
            </span>

          </div>

        </div>

        {/* QR Code */}

        <div className="bg-white rounded-2xl shadow p-6 mt-8 text-center">

          <h2 className="text-2xl font-bold mb-4">
            Your Review QR Code
          </h2>

          <img
  src={data.qr_code_url}
  alt="QR Code"
  className="w-64 mx-auto"
/>

          <p className="mt-4 text-slate-500">
            Customers can scan this QR code
            to view your profile and submit reviews.
          </p>

        </div>

      </div>

    </div>
  );
}

export default BusinessDashboard;