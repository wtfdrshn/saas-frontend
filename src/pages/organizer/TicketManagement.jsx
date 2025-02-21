import { useEffect, useState } from "react";
import concernTicketService from "../../services/concernTicketService";
import toast from "react-hot-toast";

const statusColors = {
    Open: "bg-red-100 text-red-700 border-red-500",
    "In Progress": "bg-yellow-100 text-yellow-700 border-yellow-500",
    Resolved: "bg-green-100 text-green-700 border-green-500",
};

const TicketManagement = () => {
    const [tickets, setTickets] = useState([]);

    const fetchMyTickets = async () => {
        try {
            const response = await concernTicketService.getOrganizerTickets();
            setTickets(response?.data?.tickets || []);
        } catch (error) {
            console.error(error);
            toast.error("Error fetching tickets!");
        }
    };

    useEffect(() => {
        fetchMyTickets();
    }, []);

    const updateStatus = async (ticketId, status) => {
        try {
            await concernTicketService.updateConcernTicketStatus(ticketId, status);
            setTickets((prev) =>
                prev.map((ticket) =>
                    ticket._id === ticketId ? { ...ticket, status } : ticket
                )
            );
            toast.success("Status updated successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update ticket status.");
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Ticket Management</h1>
                <p className="text-gray-500 mb-4">Manage concerns raised for your events</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tickets.map((ticket) => (
                        <div key={ticket._id} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition">
                            <div className="flex justify-between items-start">
                                <div className="w-3/4">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-1">{ticket.subject}</h2>
                                    <p className="text-gray-600 text-sm mb-2">{ticket.description}</p>
                                    
                                    <div className="mt-2 text-sm text-gray-500">
                                        <p><strong>User:</strong> {ticket.userId?.name || "N/A"}</p>
                                        <p><strong>Email:</strong> {ticket.userId?.email || "N/A"}</p>
                                        <p><strong>Event:</strong> {ticket.eventId?.title || "N/A"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Status Update Section */}
                            <div className="mt-4 flex items-center space-x-2">
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${statusColors[ticket.status]}`}>
                                    {ticket.status}
                                </span>

                                <div className="flex space-x-2">
                                    {["Open", "In Progress", "Resolved"].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => updateStatus(ticket._id, status)}
                                            className={`px-3 py-1 text-xs font-medium rounded-md border transition ${
                                                ticket.status === status
                                                    ? "bg-gray-300 cursor-not-allowed"
                                                    : "bg-blue-100 text-blue-700 border-blue-500 hover:bg-blue-200"
                                            }`}
                                            disabled={ticket.status === status}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TicketManagement;
