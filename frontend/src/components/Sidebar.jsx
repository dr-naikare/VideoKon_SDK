import { Calendar, Contact, HomeIcon, LogOutIcon, Menu, SwitchCameraIcon } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet"
import { Button } from "./ui/button"

function Sidebar() {
  return (
    <>
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
              <a href="/" className="ml-3 text-blue-200 hover:text-white">
                Home
              </a>
            </li>
            <li className="flex items-center py-2 px-4 hover:bg-gray-700 rounded-lg">
              <Calendar />
              <a href="/calendar" className="ml-3">
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
                  <a href="/" className="ml-3 text-blue-200 hover:text-white">
                    Home
                  </a>
                </li>
                <li className="flex items-center py-2 px-4 hover:bg-gray-700 rounded-lg">
                  <Calendar />
                  <a href="/calendar" className="ml-3">
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
    </>
  )
}

export default Sidebar
