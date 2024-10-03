import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", date: "", time: "", priority: "", description: "" });

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setIsAddEventOpen(true);
    setNewEvent({ ...newEvent, date }); // Set the date for the new event
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsEventDetailsOpen(true);
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getEventsForDate = (date) => {
    return events.filter((event) => event.date === date);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);

  const getPriorityClass = (priority) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-600";
      case "medium":
        return "bg-blue-600";
      case "low":
        return "bg-green-600";
      default:
        return "bg-gray-200";
    }
  };

  const handleAddEvent = () => {
    if (newEvent.title && newEvent.date) {
      setEvents((prev) => [...prev, { id: Date.now(), ...newEvent }]); // Use a timestamp for a simple unique ID
      setNewEvent({ title: "", date: "", time: "", priority: "", description: "" }); // Reset the form
      setIsAddEventOpen(false);
    }
  };

  return (
    <div className="calendar-container p-4 rounded-lg">
      <div className="flex justify-between mb-4">
        <button onClick={handlePrevMonth} className="bg-blue-500 text-white p-2 rounded">
          <ArrowLeft />
        </button>
        <h2 className="text-xl font-bold">
          {currentDate.toLocaleString("default", { month: "long" })} {year}
        </h2>
        <button onClick={handleNextMonth} className="bg-blue-500 text-white p-2 rounded">
          <ArrowRight />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center">
        {daysOfWeek.map((day) => (
          <div key={day} className="font-bold">{day}</div>
        ))}
        {[...Array(daysInMonth)].map((_, index) => {
          const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`;
          return (
            <div
              key={index}
              className="border p-2 cursor-pointer hover:bg-slate-200 hover:text-black transition-all"
              onClick={() => handleDateClick(date)}
            >
              {index + 1}
              <div className="flex flex-wrap gap-x-2 text-xs items-center justify-center">
                {getEventsForDate(date).map((event) => (
                  <div
                    key={event.id}
                    className={`p-1 mt-1 rounded-full w-4 h-4 flex ${getPriorityClass(event.priority)} text-white cursor-pointer`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event);
                    }}
                  >
                    {/* Optionally display title or icon here */}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Event on {newEvent.date || ""}</DialogTitle>
            <DialogDescription>
              <form className="flex flex-col">
                <input
                  type="text"
                  placeholder="Event Title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="mb-2 p-1 rounded border"
                />
                <input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  className="mb-2 p-1 rounded border"
                />
                <select
                  value={newEvent.priority}
                  onChange={(e) => setNewEvent({ ...newEvent, priority: e.target.value })}
                  className="mb-2 p-1 rounded border"
                >
                  <option value="">Select Priority</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <textarea
                  placeholder="Description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="mb-2 p-1 rounded border"
                />
                <button
                  type="button"
                  onClick={handleAddEvent}
                  className="bg-blue-500 text-white p-2 rounded"
                >
                  Add Event
                </button>
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={isEventDetailsOpen} onOpenChange={setIsEventDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
            <DialogDescription>
              <p><strong>Date:</strong> {selectedEvent?.date}</p>
              <p><strong>Time:</strong> {selectedEvent?.time}</p>
              <p><strong>Priority:</strong> {selectedEvent?.priority}</p>
              <p><strong>Description:</strong> {selectedEvent?.description}</p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;
