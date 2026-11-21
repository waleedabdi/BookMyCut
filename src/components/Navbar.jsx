import { Link, useNavigate } from "react-router-dom"; 

import { auth } from "../firebase"; 

import { signOut } from "firebase/auth"; 

 

export default function Navbar({ user }) { 

const navigate = useNavigate(); 

 

const handleLogout = () => { 

signOut(auth); 

navigate("/login"); 

}; 

 

return ( 

<nav className="bg-slate-900 p-4 text-white flex justify-between items-center shadow-lg"> 

<h1 className="text-2xl font-extrabold tracking-wider text-amber-500"> 

BookMyCut 

</h1> 

 

{/* Navigation Links */} 

<div className="flex gap-6 items-center font-medium"> 

<Link to="/" className="hover:text-amber-500 transition-colors"> 

Home 

</Link> 

<Link to="/my-bookings" className="hover:text-amber-500 transition-colors"> 

My Bookings 

</Link> 

 

{user && user.email === "owner@bookmycut.com" && ( 

<Link to="/owner" className="text-orange-400 hover:text-orange-300 font-bold"> 

Owner Panel 

</Link> 

)} 

 

<button  

onClick={handleLogout}  

className="bg-black-500 px-4 py-2 rounded-lg hover:bg-black-600 transition-all font-semibold shadow-md ml-4" 

> 

Logout 

</button> 

</div> 

</nav> 

); 

} 