import axios from 'axios';

export default function SignUp() {

  const handleSignIn = async () => {
    try {
      const response = await axios.get("http://localhost:8000/auth/google");
      // console.log(response.data.authUrl);
      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
          <button
            onClick={handleSignIn}
            className="p-4 bg-indigo-500 text-slate-100 border hover:border-indigo-500 hover:bg-white  hover:text-indigo-500"
          >
            Sign in with Google
          </button>
      </div>
    </div>
  )
}