import Calendar from "@/components/Calendar"
import Sidebar from "@/components/Sidebar"

const CalendarPage = () => {
    return (
        <div className="flex h-screen" >
            <Sidebar />
            <div className="w-full bg-gray-100 p-8">
                <Calendar />
            </div>
        </div>
    )
}

export default CalendarPage
