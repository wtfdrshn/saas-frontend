import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ConcernTicketFormModal from "./ConcernTicketFormModal";
import concernTicketService from "../../services/concernTicketService";

const MySupportTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchMyTickets = async () => {
        try {
            const response = await concernTicketService.getUserTickets();
            setTickets(response.data.tickets); // Ensure API returns 'tickets' in response data
        } catch (error) {
            console.error(error);
            toast.error("Error fetching tickets!");
        }
    };

    useEffect(() => {
        fetchMyTickets();
    }, []);

    return (
        <>
            <div className="container mx-auto px-4 py-8 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="sm:flex sm:items-center sm:justify-between mb-4">
                        <h1 className="text-2xl font-bold text-gray-700">Your Support Tickets</h1>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Raise Ticket
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tickets.length > 0 ? (
                            tickets.map((ticket) => (
                                <div key={ticket._id} className="p-4 border rounded-lg shadow-md hover:shadow-lg transition duration-300">
                                    <h2 className="font-semibold text-gray-800 text-lg">{ticket.subject}</h2>
                                    <p className="text-gray-600 text-sm mt-1">{ticket.description}</p>

                                    {/* Event Details */}
                                    <p className="text-gray-500 text-sm mt-2">
                                        <strong>Event:</strong> {ticket.eventId?.title || "N/A"}
                                    </p>

                                    {/* Organizer Details */}
                                    <p className="text-gray-500 text-sm">
                                        <strong>Organizer:</strong> {ticket.organizerId?.name || "N/A"} ({ticket.organizerId?.organizationName || "N/A"})
                                    </p>

                                    {/* Ticket Status */}
                                    <p className="text-sm font-medium mt-2">
                                        <span
                                            className={`px-2 py-1 rounded-md text-white ${
                                                ticket.status === "Open"
                                                    ? "bg-red-500"
                                                    : ticket.status === "In Progress"
                                                    ? "bg-yellow-500"
                                                    : "bg-green-500"
                                            }`}
                                        >
                                            {ticket.status}
                                        </span>
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">No tickets found.</p>
                        )}
                    </div>
                </div>
            </div>

            <ConcernTicketFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
};

export default MySupportTickets;
