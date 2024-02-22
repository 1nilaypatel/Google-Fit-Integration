import axios from 'axios';

// Component for signing up with Google
export default function SignUp() {
  // Function to handle sign-in with Google
  const handleSignIn = async () => {
    try {
      // Send request to server to get Google authentication URL
      const response = await axios.get("http://localhost:8000/auth/google");
      // Redirect to the authentication URL received from the server
      window.location.href = response.data.authUrl;
    } catch (error) {
      // Handle errors if sign-in fails
      console.error('Error signing in with Google:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        {/* Button to initiate sign-in with Google */}
        <button
          onClick={handleSignIn}
          className="p-4 bg-indigo-500 text-slate-100 border hover:border-indigo-500 hover:bg-white  hover:text-indigo-500"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
