import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import concernTicketService from "../../services/concernTicketService";

// eslint-disable-next-line react/prop-types
const ConcernTicketFormModal = ({ isOpen, onClose }) => {
    const [events, setEvents] = useState([]);
    const [eventId, setEventId] = useState("");
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/events");
                console.log(response, 'EVENTS RESPONSE');
                setEvents(response?.data?.events);
            } catch (error) {
                console.error("Error fetching events:", error);
                toast.error("Failed to load events");
            }
        };

        fetchEvents();
    }, []);

    const submitTicket = async (e) => {
        e.preventDefault();
        if (!eventId) return toast.error("Please select an event");

        setLoading(true);
        try {
            await concernTicketService.createTicket(eventId, subject, description);
            toast.success("Ticket submitted successfully");
            setEventId("");
            setSubject("");
            setDescription("");
            onClose();
        } catch (error) {
            console.log(error);
            toast.error("Error submitting ticket!");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Raise an Issue</h2>
                <form onSubmit={submitTicket} className="space-y-3">
                    <label className="block">
                        <span className="text-gray-700">Event</span>
                        <select
                            value={eventId}
                            onChange={(e) => setEventId(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        >
                            <option value="">Select an Event</option>
                            {events?.map((event) => (
                                <option key={event?._id} value={event?._id}>
                                    {event?.title}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="block">
                        <span className="text-gray-700">Subject</span>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </label>

                    <label className="block">
                        <span className="text-gray-700">Description</span>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        ></textarea>
                    </label>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            className="px-4 py-2 bg-gray-300 rounded"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded"
                            disabled={loading}
                        >
                            {loading ? "Submitting..." : "Submit Ticket"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ConcernTicketFormModal;
