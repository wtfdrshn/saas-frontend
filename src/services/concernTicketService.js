import api from "./api"

const concernTicketService = {
    createTicket: async (eventId, subject, description) => {
        try {
            if (eventId && subject && description) {
                await api.post('/tickets/create', { eventId, subject, description });
            }
        } catch (error) {
            console.error('Service Error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to create ticket');
        }
    },
    getUserTickets: async () => {
        try {
            const response = await api.get('/tickets/user');
            return response;
        } catch (error) {
            console.error('Service Error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to fetch tickets');
        }
    },
    getOrganizerTickets: async () => {
        try {
            const response = await api.get('/tickets/organizer');
            return response;
        } catch (error) {
            console.error('Service Error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to fetch tickets');
        }
    },
    updateConcernTicketStatus: async (ticketId, status) => {
        try {
            const response = await api.put(`/tickets/${ticketId}`, { status });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default concernTicketService;