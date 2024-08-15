import { createBrowserRouter , RouterProvider } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import LoginPage from './pages/Login'
import SignupPage from './pages/Signup'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home/>
  },
  {
    path: "/login",
    element: <LoginPage/>
  },
  {
    path: "/signup",
    element: <SignupPage/>
  }
])

function App() {

  return (
   <>
    <RouterProvider router={router}/>
   </>
  )
}

export default App
