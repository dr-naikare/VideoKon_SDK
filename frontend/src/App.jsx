import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import LoginPage from './pages/Login'
import SignupPage from './pages/Signup'
import MeetingPage from './pages/Meeting'
import PrivateRoute from './components/PrivateRoutes'
import { Toaster } from 'react-hot-toast'
import LobbyPage from './pages/Lobby'
import CalendarPage from './pages/Calendar'
import { SocketProvider } from './components/SocketContext'  // Import the SocketProvider

const router = createBrowserRouter([
  {
    path: "/",
    element:
    <PrivateRoute>
     <Home/>
    </PrivateRoute>
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
    path: "/meeting/:roomId",
    element: <MeetingPage/>
  },
  {
    path:"/lobby",
    element:<LobbyPage/>
  },
  {
    path:"/calendar",
    element:<CalendarPage/>
  }
])

// Create a new component that wraps RouterProvider with SocketProvider
const SocketWrappedRouter = ({ router }) => (
  <SocketProvider>
    <RouterProvider router={router} />
  </SocketProvider>
)

function App() {
  return (
   <>
   <Toaster/>
    <SocketWrappedRouter router={router} />
   </>
  )
}

export default App
