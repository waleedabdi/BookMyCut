import { Routes, Route, Navigate } from 'react-router-dom'; 

import Login from './pages/Login';  

import Signup from './pages/Signup'; // Import the new page 

import Home from './pages/Home';  

import MyBookings from './pages/MyBookings'; 

import Owner from './pages/Owner'; 

import { useAuth } from './context/useAuth';  

 

function App() { 

const { user, loading } = useAuth();  

 

if (loading) { 

return ( 

<div className="min-h-screen flex flex-col items-center justify-center bg-gray-50"> 

<div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div> 

<p className="mt-4 text-gray-600 font-semibold">Loading BookMyCut...</p> 

</div> 

); 

} 

 

return ( 

<div> 

<Routes> 

<Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} /> 

{/* Add the signup route */} 

<Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} /> 

<Route path="/" element={user ? <Home /> : <Navigate to="/login" />} /> 

<Route path="/my-bookings" element={user ? <MyBookings /> : <Navigate to="/login" />} /> 

<Route path="/owner" element={user ? <Owner /> : <Navigate to="/login" />} /> 

</Routes> 

</div> 

); 

} 

 

export default App; 

 