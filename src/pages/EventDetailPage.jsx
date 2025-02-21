import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPinIcon, ClockIcon, TagIcon, GlobeAltIcon, LinkIcon, CalendarIcon, ArrowTopRightOnSquareIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import EventService from '../services/eventService';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

import { formatPrice, formatDate } from '../utils/miscUtils';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import geocodingService from '../services/geocodingService';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import { useAuth } from '../context/AuthContext';

// Update the icon configuration
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const SocialMediaLink = ({ url, icon: Icon, platform }) => {

  if (!url) return null;
  
  return (
    <a 
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-400 hover:text-gray-600 transition-colors"
      title={platform}
    >
      <Icon className="w-5 h-5" />
    </a>
  );
};

const isBookingDisabled = (status) => {
  return status === 'cancelled' || status === 'postponed' || status === 'past';
};

const EventDetailPage = () => {

  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [mapError, setMapError] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleBooking = () => {
    if (!user) {
      navigate('/', { 
        state: { from: `/events/${id}` }
      });
    } else {
      navigate(`/checkout/${id}`);
    }
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const data = await EventService.getEvent(id);
        setEvent(data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch event details');
        console.error('Error fetching event:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  useEffect(() => {
    const fetchCoordinates = async () => {
      if (event?.location) {
        try {
          const coords = await geocodingService.getCoordinates(event.location);
          if (coords?.lat && coords?.lng) {
            setCoordinates(coords);
            setMapError(null);
          } else {
            setMapError('Invalid location coordinates');
          }
        } catch (err) {
          setMapError('Failed to load map location');
          console.error('Geocoding error:', err);
        }
      }
    };

    fetchCoordinates();
  }, [event?.location]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Event not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-12">
      {/* Banner Image */}
      <div className="relative w-full aspect-[21/9] object-cover rounded-xl overflow-hidden mb-8">
        <img
          src={event.bannerImage}
          alt={event.title}
          className="w-full h-auto object-cover"
        />
      </div>

      {(event.status === 'cancelled' || event.status === 'postponed') && event.statusReason && (
        <div className={`mb-8 p-4 rounded-lg ${
          event.status === 'cancelled' ? 'bg-red-50' : 'bg-orange-50'
        }`}>
          <div className="flex">
            <div className={`flex-shrink-0 ${
              event.status === 'cancelled' ? 'text-red-400' : 'text-orange-400'
            }`}>
              <ExclamationCircleIcon className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${
                event.status === 'cancelled' ? 'text-red-800' : 'text-orange-800'
              }`}>
                Event {event.status === 'cancelled' ? 'Cancelled' : 'Postponed'}
              </h3>
              <div className={`mt-2 text-sm ${
                event.status === 'cancelled' ? 'text-red-700' : 'text-orange-700'
              }`}>
                <p>{event.statusReason}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Title Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                <TagIcon className="h-4 w-4 mr-2" />
                {event.category}
              </span>
              <div className="flex items-center text-gray-600">
                <CalendarIcon className="h-5 w-5 mr-2" />
                <span>{formatDate(event.startDate)}</span>
              </div>
              {event.location && (
                <div className="flex items-center text-gray-600">
                  <MapPinIcon className="h-5 w-5 mr-2" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">About This Event</h2>
            <div className="prose max-w-none">
              <div 
                dangerouslySetInnerHTML={{ __html: event.description }}
                className="text-gray-600 leading-relaxed"
              />
            </div>
          </div>

          {/* Location Map Section */}
          {event.location && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Location</h2>
              <div className="mb-4">
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPinIcon className="h-5 w-5 mr-2 text-indigo-600" />
                  <span>{event.location}</span>
                </div>
              </div>
              
              {coordinates && coordinates.lat && coordinates.lng ? (
                <div className="h-[400px] rounded-xl overflow-hidden shadow-inner">
                  <MapContainer
                    center={[coordinates.lat, coordinates.lng]}
                    zoom={13}
                    scrollWheelZoom={false}
                    className="h-full w-full"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[coordinates.lat, coordinates.lng]}>
                      <Popup>
                        <div className="p-2">
                          <h4 className="font-medium text-gray-900">{event.title}</h4>
                          <p className="text-sm text-gray-600">{event.location}</p>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              ) : mapError ? (
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-red-600 flex items-center">
                    <ExclamationCircleIcon className="h-5 w-5 mr-2" />
                    {mapError}
                  </p>
                </div>
              ) : (
                <div className="flex justify-center items-center h-[400px] bg-gray-50 rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              )}
            </div>
          )}

          {/* Virtual Event Section */}
          {event.virtualLink && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Virtual Event Access</h2>
              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-indigo-100 rounded-full p-2">
                    <GlobeAltIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Join Online</h3>
                    <p className="text-gray-600 mb-3">Click the button below to access the virtual event</p>
                    <a
                      href={event.virtualLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Access Virtual Event
                      <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-2" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-lg rounded-xl p-6 sticky top-8">
            {/* Price Section */}
            <div className="mb-6 flex items-center justify-between">
              <span className="text-3xl font-bold text-gray-900">
                {event.isFree ? 'Free' : formatPrice(event.price)}
              </span>
              {/* <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Available
              </span> */}
            </div>

            {/* Book Now Button */}
            <button 
              onClick={handleBooking}
              disabled={isBookingDisabled(event.status)}
              className={`w-full px-6 py-3 rounded-xl transition-all duration-300 transform font-medium text-lg shadow-md ${
                isBookingDisabled(event.status)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-[1.02] hover:shadow-xl'
              }`}
            >
              {event.status === 'cancelled' 
                ? 'Event Cancelled' 
                : event.status === 'postponed'
                ? 'Event Postponed'
                : event.status === 'past'
                ? 'Event Ended'
                : event.isFree 
                ? 'Register Now' 
                : 'Book Now'}
            </button>

            {/* Event Details Section */}
            <div className="mt-8 pt-8 border-t border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Event Details</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-indigo-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900 mb-1">Date and Time</p>
                    <p className="text-gray-600">Starts: {formatDate(event.startDate)}</p>
                    <p className="text-gray-600">Ends: {formatDate(event.endDate)}</p>
                  </div>
                </div>

                {event.location && (
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <MapPinIcon className="h-6 w-6 text-indigo-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Location</p>
                      <p className="text-gray-600">{event.location}</p>
                    </div>
                  </div>
                )}

                {event.virtualLink && (
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <GlobeAltIcon className="h-6 w-6 text-indigo-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Virtual Event</p>
                      <a 
                        href={event.virtualLink}
                        target="_blank"
                        rel="noopener noreferrer" 
                        className="text-indigo-600 hover:text-indigo-500 underline"
                      >
                        Join Online
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Organizer Section */}
            <div className="mt-8 pt-8 border-t border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Organizer</h3>
              <div className="space-y-6">
                {/* Organizer Profile */}
                <div className="flex items-center space-x-4">
                  <img
                    src={event.organizer.profilePicture}
                    alt={event.organizer.organizationName}
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-gray-100"
                  />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      {event.organizer.organizationName}
                    </h4>
                    <p className="text-gray-500">{event.organizer.name}</p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3">
                  <a 
                    href={`mailto:${event.organizer.email}`}
                    className="flex items-center space-x-3 text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{event.organizer.email}</span>
                  </a>
                  
                  {event.organizer.website && (
                    <a 
                      href={event.organizer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 text-gray-600 hover:text-indigo-600 transition-colors"
                    >
                      <LinkIcon className="h-5 w-5" />
                      <span>Website</span>
                    </a>
                  )}
                </div>

                {/* Social Media Links */}
                {event.organizer.socialMedia && (
                  <div className="flex items-center space-x-4 pt-4">
                    <SocialMediaLink 
                      url={event.organizer.socialMedia.facebook}
                      icon={FaFacebook}
                      platform="Facebook"
                    />
                    <SocialMediaLink 
                      url={event.organizer.socialMedia.twitter}
                      icon={FaTwitter}
                      platform="Twitter"
                    />
                    <SocialMediaLink 
                      url={event.organizer.socialMedia.instagram}
                      icon={FaInstagram}
                      platform="Instagram"
                    />
                    <SocialMediaLink 
                      url={event.organizer.socialMedia.linkedin}
                      icon={FaLinkedin}
                      platform="LinkedIn"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage; 