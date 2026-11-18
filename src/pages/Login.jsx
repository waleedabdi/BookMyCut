import { useState } from "react";
import { auth, googleProvider } from "../services/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/"); 
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleAuth = async () => {
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">BookMyCut</h2>
        
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
            required 
          />
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white p-3 rounded font-semibold hover:bg-blue-700 transition"
          >
            {isRegistering ? "Sign Up" : "Login"}
          </button>
        </form>

        {error && (
          <p className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <div className="my-4 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="px-2 text-gray-500 text-sm">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <button 
          onClick={handleGoogleAuth} 
          className="w-full bg-white border border-gray-300 text-gray-700 p-3 rounded font-semibold hover:bg-gray-50 transition flex justify-center items-center"
        >
          Sign in with Google
        </button>

        <p 
          className="mt-6 text-center text-sm cursor-pointer text-blue-600 hover:underline" 
          onClick={() => setIsRegistering(!isRegistering)}
        >
          {isRegistering ? "Already have an account? Login" : "Need an account? Sign Up"}
        </p>
      </div>
    </div>
  );
}