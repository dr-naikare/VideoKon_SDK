import { useState } from 'react';
import axios from "axios";

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle login logic here


    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });
      console.log('Response:', response.data);
      // Handle successful login (e.g., store token, redirect)
    } catch (error) {

      console.error('Error logging in:', error);
      // Handle login error (e.g., show error message)
    }

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
          <h2 className="text-2xl font-bold text-center text-blue-600">Log in</h2>
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
                className="group relative flex w-full justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Log in
              </button>
            </div>
          </form>
        <div className='text-center'>
          <p className='text-muted-foreground'>Don&apos;t have an account ? <a href="/signup" className='text-blue-500'>register</a></p>
        </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
