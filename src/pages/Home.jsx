import { useAuth } from "../services/context/useAuth";

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div>
      {/* Navigation Bar using Tailwind */}
      <nav className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold tracking-wide">BookMyCut</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">{user?.email}</span>
          <button 
            onClick={logout} 
            className="bg-blue-800 px-4 py-2 rounded hover:bg-blue-900 transition text-sm font-semibold"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="p-8 text-center mt-10">
        <h1 className="text-4xl font-extrabold text-gray-800">Welcome to BookMyCut!</h1>
        <p className="mt-4 text-lg text-gray-600">You are successfully logged in.</p>
        <p className="mt-2 text-gray-500">The booking calendar will go here tomorrow.</p>
      </div>
    </div>
  );
}