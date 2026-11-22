import { useState } from "react";
import { useAuth } from "../context/useAuth";
import Navbar from "../components/Navbar";
import { auth } from "../firebase";

export default function Owner() {
  const { user } = useAuth();
  const [date, setDate] = useState("");
  const [bookings, setBookings] = useState([]);
  const [searched, setSearched] = useState(false);

  const getSchedule = async () => {
    if (!date) return alert("Pick a date");

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return alert("Please sign in again.");

      const token = await currentUser.getIdToken();
      const response = await fetch(`/api/owner/schedule?date=${encodeURIComponent(date)}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Unable to load schedule.");
      
      setBookings(Array.isArray(data) ? data : []);
      setSearched(true);
    } catch (error) {
      alert(error.message);
      setBookings([]);
      setSearched(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar user={user} />
      
      <div className="p-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Owner Schedule</h2>
        
        <div className="flex gap-4 mb-6">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border p-2 rounded"
          />
          <button 
            onClick={getSchedule} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            View Schedule
          </button>
        </div>

        {searched && bookings.length === 0 && (
          <p className="bg-white p-4 rounded shadow text-gray-500">
            No bookings for this date.
          </p>
        )}

        {bookings.length > 0 && (
          <table className="w-full bg-white shadow rounded">
            <thead className="bg-gray-200 text-left">
              <tr>
                <th className="p-3">Time</th>
                <th className="p-3">Customer Email</th>
                <th className="p-3">Service</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-bold">{b.time}</td>
                  <td className="p-3">{b.userEmail}</td>
                  <td className="p-3">{b.serviceName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}