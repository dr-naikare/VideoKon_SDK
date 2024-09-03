import { useState } from 'react';
import axios from "axios";
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [name , setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle login logic here

    try {
      const response = await axios.post(`http://localhost:5000/api/auth/register`, {
        name,
        email,
        password
      }).then((response) => {
        console.log(response.data);
        if (response.status === 201) {
          console.log('User registered successfully');
          // Redirect to the specified URL
          navigate('/login');
        }
      });
      toast.success('Signup successful');
      setLoading(true);
      setEmail('');
      setName('');
      setPassword('');
    } catch (error) {
      toast.error('Signup failed');
      console.error('Error signing up:', error);
      // Handle signup error (e.g., show error message)
    }

    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Password:', password);
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex flex-col items-center justify-center w-1/3 bg-blue-600 p-8">
        <h1 className="text-4xl font-bold text-white mb-8">VideoKon</h1>
      </div>
      <div className="flex flex-col items-center justify-center w-2/3 bg-gray-100">
        <div className="flex flex-col items-center justify-center w-full max-w-md p-8 space-y-8 bg-white shadow-md rounded-xl">
          <h2 className="text-2xl font-bold text-center text-blue-600">Register</h2>
          <form className="mt-8 space-y-6 w-full" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="name" className="sr-only">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>    
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Signup
              </button>
            </div>
          </form>
          <div className='text-center'>
          <p className='text-muted-foreground'>Already have an account ? <a href="/login" className='text-blue-500'>Login</a></p>
        </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
