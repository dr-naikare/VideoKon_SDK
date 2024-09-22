import { Button } from "@/components/ui/button";
import {
  Calendar,
  CalendarCheck,
  Contact,
  Edit,
  GroupIcon,
  HomeIcon,
  LogOutIcon,
  Menu,
  PhoneCall,
  SwitchCameraIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"; // Assuming ShadCN's Sheet component is here
//import { c } from 'vite/dist/node/types.d-aGj9QkWt';

const Home = () => {
  const location = useLocation();
  const[user, setUser] = useState({name: ''});
  const [meetings, setMeetings] = useState([
    { name: "Team Sync", time: "10:00 AM" },
    { name: "Project Review", time: "2:00 PM" },
  ]);
  const [calendar, setCalendar] = useState([
    { date: "August 5, 2024" },
    { date: "August 6, 2024" },
  ]);
  const [invitations, setInvitations] = useState([
    { inviter: "Alice", event: "Team Lunch" },
    { inviter: "Bob", event: "Weekly Standup" },
  ]);
  const [insights, setInsights] = useState({
    hostedMeetings: 5,
    attendedMeetings: 8,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        Navigate("/login");
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:5000/api/auth/user",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("User data:", response.data);
        setUser(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError(error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [location]);

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      return "Good morning";
    } else if (currentHour < 18) {
      return "Good afternoon";
    } else {
      return "Good evening";
    }
  };

  const greeting = getGreeting();

  useEffect(() => {
    // Mock data setup complete, no API calls needed for UI
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading data: {error.message}</div>;

  const handleReschedule = (meeting) => {
    alert(`Reschedule ${meeting}`);
  };

  const joinMeeting = () => {
    window.location.href = "/lobby";
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar for desktop */}
      <div className="hidden md:block w-1/4 bg-gray-900 text-white p-6 flex-col">
        <div className="flex items-center mb-8">
          <img src="/logo.jpg" alt="Logo" className="rounded-full w-10 h-10 mr-2" />
          <h1 className="text-2xl font-bold text-blue-400">VideoKon</h1>
        </div>
        <nav className="flex-1">
          <ul className="space-y-2">
            <li className="flex items-center py-2 px-4 bg-blue-800 rounded-lg">
              <HomeIcon />
              <a href="#" className="ml-3 text-blue-200 hover:text-white">
                Home
              </a>
            </li>
            <li className="flex items-center py-2 px-4 hover:bg-gray-700 rounded-lg">
              <Calendar />
              <a href="#" className="ml-3">
                Calendar
              </a>
            </li>
            <li className="flex items-center py-2 px-4 hover:bg-gray-700 rounded-lg">
              <SwitchCameraIcon />
              <a href="#" className="ml-3">
                Recording
              </a>
            </li>
            <li className="flex items-center py-2 px-4 hover:bg-gray-700 rounded-lg">
              <Contact />
              <a href="#" className="ml-3">
                Contacts
              </a>
            </li>
          </ul>
        </nav>
        <div className="mt-6">
          <a href="/login" className="flex items-center text-red-400 hover:text-red-500">
            <LogOutIcon />
            <span className="ml-3">Log out</span>
          </a>
        </div>
      </div>

      {/* Sidebar for mobile (Sheet) */}
      <div className="md:hidden fixed">
        <Sheet>
          <SheetTrigger asChild>
            <Button className="m-4">
              <Menu /> {/* Hamburger Icon */}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-6 bg-gray-900 text-white">
            <SheetHeader>
              <SheetTitle className="flex items-center">
                <img src="/logo.jpg" alt="Logo" className="rounded-full w-10 h-10 mr-2" />
                <h1 className="text-2xl font-bold text-blue-400">VideoKon</h1>
              </SheetTitle>
            </SheetHeader>
            <nav className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-center py-2 px-4 bg-blue-800 rounded-lg">
                  <HomeIcon />
                  <a href="#" className="ml-3 text-blue-200 hover:text-white">
                    Home
                  </a>
                </li>
                <li className="flex items-center py-2 px-4 hover:bg-gray-700 rounded-lg">
                  <Calendar />
                  <a href="#" className="ml-3">
                    Calendar
                  </a>
                </li>
                <li className="flex items-center py-2 px-4 hover:bg-gray-700 rounded-lg">
                  <SwitchCameraIcon />
                  <a href="#" className="ml-3">
                    Recording
                  </a>
                </li>
                <li className="flex items-center py-2 px-4 hover:bg-gray-700 rounded-lg">
                  <Contact />
                  <a href="#" className="ml-3">
                    Contacts
                  </a>
                </li>
              </ul>
            </nav>
            <div className="mt-6">
              <a href="/login" className="flex items-center text-red-400 hover:text-red-500">
                <LogOutIcon />
                <span className="ml-3">Log out</span>
              </a>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <div className="w-full bg-gray-100 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Welcome Section */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold">
              {greeting}, {user.name}!
            </h2>
            <div className="flex items-center my-4">
              <img
                src={user.avatar}
                alt="Avatar"
                className="w-16 h-16 rounded-full mr-4"
              />
              <p>Your agenda today:</p>
            </div>
            <ul className="space-y-2">
              {meetings.map((meeting, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span>
                    {meeting.name} {meeting.time}
                  </span>
                  <button
                    onClick={() => handleReschedule(meeting.name)}
                    className="text-blue-500 hover:underline"
                  >
                    Reschedule
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Meeting Actions */}
          <div className="bg-white p-6 rounded-lg shadow-lg grid grid-cols-1 gap-4">
            <button className="flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg bg-blue-500 text-white hover:bg-blue-600">
              <span className="material-icons"><GroupIcon/></span>
              <a href="/meeting" className="ml-2">Start a meeting</a>
            </button>
            <Button
              onClick={joinMeeting}
              className="flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg bg-green-500 text-white hover:bg-green-600"
            >
              <span className="material-icons">
                <PhoneCall />
              </span>
              <span className="ml-2">Join a meeting</span>
            </Button>
            <button className="flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600">
              <span className="material-icons"><CalendarCheck/></span>
              <span className="ml-2">Schedule a meeting</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {/* Calendar */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold">Calendar</h3>
            <div className="mt-4">
              <div className="w-full h-48 bg-gray-200 rounded-lg">
                {/* Render Calendar Data */}
                {calendar.map((day, index) => (
                  <div key={index} className="p-2">
                    {day.date}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Invitations */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold">Invitations</h3>
            <ul className="mt-4 space-y-2">
              {invitations.map((invitation, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span>
                    {invitation.inviter} invited you to {invitation.event}
                  </span>
                  <button className="text-blue-500 hover:underline">
                    RSVP
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Insights */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold">Insights</h3>
            <p className="mt-4">Number of meetings you hosted this week:</p>
            <div className="flex justify-between mt-2">
              <span className="font-medium">{insights.hostedMeetings}</span>
            </div>
            <p className="mt-4">Number of meetings you attended this week:</p>
            <div className="flex justify-between mt-2">
              <span className="font-medium">{insights.attendedMeetings}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
