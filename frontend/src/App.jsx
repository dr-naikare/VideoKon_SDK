import { createBrowserRouter , RouterProvider } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import LoginPage from './pages/Login'
import SignupPage from './pages/Signup'
import MeetingPage from './pages/Meeting'

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
  },
  {
    path: "/meeting",
    element: <MeetingPage/>
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
