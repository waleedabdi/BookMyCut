import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import Navbar from "../components/Navbar";
import ServiceCard from "../components/ServiceCard";
import { auth } from "../firebase";

const SERVICES = [
  { id: "1", name: "Haircut", price: 300, duration: "30 mins" },
  { id: "2", name: "Beard Trim", price: 200, duration: "15 mins" },
  { id: "3", name: "Hair Wash", price: 150, duration: "10 mins" },
  { id: "4", name: "Hair Coloring", price: 800, duration: "60 mins" },
  { id: "5", name: "Shampoo & Blow Dry", price: 400, duration: "45 mins" },
  { id: "6", name: "Facial", price: 500, duration: "30 mins" }
];

const ALL_SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

export default function Home() {
  const { user } = useAuth();
  
  const [selectedService, setSelectedService] = useState(null);
  const [date, setDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const year = new Date().getFullYear();
        const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/KE`);
        if (!response.ok) throw new Error("Holiday request failed");
        
        const data = await response.json();
        setHolidays(Array.isArray(data) ? data : []);
      } catch {
        setHolidays([]);
      }
    };
    
    fetchHolidays();
  }, []);

  const checkSlots = async () => {
    if (!date) {
      alert("Please pick a date first!");
      return;
    }

    const holiday = holidays.find((item) => item.date === date);
    if (holiday) {
      alert(`Sorry, we are closed on ${holiday.localName}! Please pick another date.`);
      return;
    }

    setLoading(true);
    setSearched(true);
    setSelectedTime("");

    try {
      const response = await fetch(`/api/slots?date=${encodeURIComponent(date)}`);
      if (!response.ok) throw new Error("Slot API failed");
      
      const data = await response.json();
      setAvailableSlots(Array.isArray(data) ? data : []);
    } catch {
      setAvailableSlots([]);
      alert("Unable to load available slots. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const bookAppointment = async () => {
    if (!selectedService || !date || !selectedTime) {
      alert("Please select a service and a time!");
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("Please sign in again before booking.");
      return;
    }

    setBookingLoading(true);
    
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch("/api/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceName: selectedService.name,
          date,
          time: selectedTime,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Booking failed.");
        return;
      }

      alert("Booking Successful!");
      setSelectedTime("");
      setSearched(false);
      await checkSlots(); // Refresh slots
    } catch (error) {
      console.error("Booking failed:", error);
      alert("Something went wrong while booking. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar user={user} />

      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-10 text-center md:text-left mt-4">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">
            Welcome back, <span className="text-orange-500">{user?.displayName || "Customer"}</span>!
          </h1>
          <p className="text-slate-500 text-lg">Ready for a fresh cut? Book your appointment below.</p>
        </div>

        <h2 className="text-2xl font-bold mb-4">1. Choose a Service</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {SERVICES.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onClick={setSelectedService}
              isSelected={selectedService?.id === service.id}
            />
          ))}
        </div>

        {selectedService && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-bold mb-4">2. Pick a Date & Time</h2>

            <div className="flex gap-4 mb-4">
              <input
                type="date"
                value={date}
                min={new Date().toLocaleDateString("en-CA")}
                onChange={(event) => {
                  setDate(event.target.value);
                  setAvailableSlots([]);
                  setSelectedTime("");
                  setSearched(false);
                }}
                className="border p-2 rounded"
              />
              <button
                onClick={checkSlots}
                disabled={loading}
                className="bg-slate-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-slate-800 transition-all flex items-center justify-center min-w-[140px]"
              >
                {loading ? (
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  "Check Slots"
                )}
              </button>
            </div>

            {holidays.length > 0 && (
              <div className="mb-4 text-sm text-gray-600 bg-gray-50 p-3 rounded border">
                <p className="font-semibold text-gray-800">Note: We are closed on these upcoming holidays:</p>
                <ul className="list-disc list-inside">
                  {holidays.slice(0, 3).map((holiday) => (
                    <li key={holiday.date}>{holiday.date} - {holiday.localName}</li>
                  ))}
                </ul>
              </div>
            )}

            {availableSlots.length > 0 && (
              <div className="mt-4">
                <p className="font-semibold mb-2">Available Times:</p>
                <div className="flex flex-wrap gap-2">
                  {availableSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`px-4 py-2 border rounded ${
                        selectedTime === time ? "bg-blue-500 text-white" : "bg-gray-50"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {searched && availableSlots.length === 0 && !loading && (
              <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-6 text-center">
                <p className="text-lg font-bold text-slate-800">Fully Booked!</p>
                <p className="mt-1 text-sm text-slate-500">
                  We&apos;re all booked up on this date. Please try another day.
                </p>
              </div>
            )}

            {selectedTime && (
              <button
                onClick={bookAppointment}
                disabled={bookingLoading}
                className="mt-6 w-full bg-green-500 text-white p-3 rounded font-bold hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {bookingLoading ? "Confirming..." : `Confirm Booking for ${selectedTime}`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}