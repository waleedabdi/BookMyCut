import { useEffect, useState } from "react"; 
import { useAuth } from "../context/useAuth"; 
import Navbar from "../components/Navbar"; 
import { auth } from "../firebase"; 

export default function MyBookings() { 

const { user } = useAuth(); 
const [bookings, setBookings] = useState([]); 
const [loading, setLoading] = useState(true); 

 

const fetchBookings = async () => { 

setLoading(true); 

const currentUser = auth.currentUser; 
if (!currentUser) { 
setBookings([]); 
setLoading(false); 
return; 

} 

 

try { 

const token = await currentUser.getIdToken(); 

const response = await fetch("/api/my-bookings", { 

headers: { "Authorization": `Bearer ${token}` } 

}); 

const data = await response.json(); 

if (!response.ok) throw new Error(data.error || "Unable to load bookings."); 

setBookings(Array.isArray(data) ? data : []); 

} catch { 

alert("Error loading bookings. Is your API running?"); 

setBookings([]); 

} finally { 

setLoading(false); 

} 

}; 

 

useEffect(() => { 

let cancelled = false; 

const load = async () => { 

const currentUser = auth.currentUser; 

if (!currentUser) return; 

try { 

const token = await currentUser.getIdToken(); 

const response = await fetch("/api/my-bookings", { 

headers: { "Authorization": `Bearer ${token}` } 

}); 

const data = await response.json(); 

if (!cancelled) { 

if (!response.ok) throw new Error(data.error || "Unable to load bookings."); 

setBookings(Array.isArray(data) ? data : []); 

} 

} catch { 

if (!cancelled) { 

setBookings([]); 

alert("Error loading bookings. Is your API running?"); 

} 

} finally { 

if (!cancelled) setLoading(false); 

} 

}; 

void load(); 

return () => { 

cancelled = true; 

}; 

}, []); 

 

const handleCancel = async (id) => { 

if (window.confirm("Are you sure you want to cancel this booking?")) { 

const currentUser = auth.currentUser; 

if (!currentUser) return alert("Please sign in again."); 

const token = await currentUser.getIdToken(); 

const response = await fetch(`/api/bookings/${encodeURIComponent(id)}`, { 

method: "DELETE", 

headers: { "Authorization": `Bearer ${token}` } 

}); 

const data = await response.json(); 

if (!response.ok) { 

alert(data.error || "Unable to cancel booking."); 

return; 

} 

 

alert("Booking Cancelled"); 

fetchBookings();  

} 

}; 

 

return ( 

<div className="min-h-screen bg-gray-100"> 

<Navbar user={user} /> 

<div className="p-8 max-w-2xl mx-auto"> 

<h2 className="text-2xl font-bold mb-4">My Bookings</h2> 

{loading ? ( 

<p className="text-gray-600">Loading bookings...</p> 

) : bookings.length === 0 ? ( 

<p className="bg-white p-4 rounded shadow text-gray-500">You don't have any active bookings.</p> 

) : ( 

<div className="space-y-4"> 

{bookings.map((booking) => ( 

<div key={booking.id} className="bg-white p-4 rounded shadow flex justify-between items-center"> 

<div> 

<p className="font-bold text-lg text-slate-800">{booking.serviceName}</p> 

<p className="text-gray-600">Date: {booking.date}</p> 

<p className="text-gray-600">Time: {booking.time}</p> 

</div> 

<button  

onClick={() => handleCancel(booking.id)} 

className="bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200 font-semibold" 

> 

Cancel 

</button> 

</div> 

))} 

</div> 

)} 

</div> 

</div> 

); 

} 

 