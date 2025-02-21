import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import toast from 'react-hot-toast';
import 'react-quill/dist/quill.snow.css';
import { Dialog, Switch } from '@headlessui/react';
import { useDropzone } from 'react-dropzone';
import {
  LinkIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ClockIcon,
  PhotoIcon,
  TagIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import eventService from '../../services/eventService';
import axios from 'axios';
import worqhatService from '../../services/worqhatService';
import { useSubscription } from '../../context/SubscriptionContext';

// Custom Input Component with Heroicons
const InputField = ({ label, name, type, value, onChange, required, icon: Icon, error, ...props }) => (
  <div className="mb-4">
    <label htmlFor={name} className="block text-sm font-medium text-gray-900 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative mt-2 rounded-md shadow-sm">
      {Icon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
      )}
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`block w-full rounded-md border-0 py-1.5 ${Icon ? 'pl-10' : 'pl-3'
          } pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${error ? 'ring-red-300' : ''
          }`}
        {...props}
      />
    </div>
    {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
  </div>
);

// Custom Select Component
const SelectField = ({ label, name, value, onChange, required, options, error }) => (
  <div className="mb-4">
    <label htmlFor={name} className="block text-sm font-medium text-gray-900 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
    >
      <option value="">Select {label}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
  </div>
);

// Free/Paid Toggle using Headless UI Switch
const PriceToggle = ({ enabled, onChange }) => (
  <Switch.Group>
    <div className="flex items-center">
      <Switch
        checked={enabled}
        onChange={onChange}
        className={`${enabled ? 'bg-indigo-600' : 'bg-gray-200'
          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2`}
      >
        <span
          className={`${enabled ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
        />
      </Switch>
      <Switch.Label className="ml-3 text-sm font-medium text-gray-900">
        This is a free event
      </Switch.Label>
    </div>
  </Switch.Group>
);

const FileDropzone = ({ onDrop, label, accept }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize: 10485760, // 10MB
    multiple: false
  });

  return (
    <div className="mt-2">
      <div
        {...getRootProps()}
        className={`flex justify-center rounded-lg border-2 border-dashed px-6 py-10 
          ${isDragActive
            ? 'border-indigo-400 bg-indigo-50'
            : 'border-gray-300 hover:border-indigo-400'}`}
      >
        <div className="text-center">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
          <div className="mt-4">
            <input {...getInputProps()} />
            {isDragActive ? (
              <p className="text-sm text-gray-500">Drop the file here...</p>
            ) : (
              <div>
                <p className="text-sm text-gray-500">
                  <span className="text-indigo-600 font-semibold hover:text-indigo-500">
                    Click to upload
                  </span>{' '}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const EventForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [subscriptions, setSubscription] = useState({
    tier: "free"
  })
  const [event, setEvent] = useState({
    title: '',
    description: '',
    category: '',
    type: '',
    startDate: '',
    endDate: '',
    location: '',
    virtualLink: '',
    isFree: false,
    price: 0,
    bannerImage: null,
    coverImage: null,
    status: 'upcoming',
    manualStatusControl: false
  });

  const [viewport, setViewport] = useState({
    width: '100%',
    height: 400,
    latitude: 37.7577,
    longitude: -122.4376,
    zoom: 8
  });

  const [locationSearch, setLocationSearch] = useState('');
  const [mapCoordinates, setMapCoordinates] = useState(null);
  // const { subscription } = useSubscription();

  const subscription = subscriptions.tier

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const eventData = await eventService.getEvent(id);

        // Format dates for input fields
        const formattedEvent = {
          ...eventData,
          startDate: formatDateForInput(eventData.startDate),
          endDate: formatDateForInput(eventData.endDate),
          isFree: eventData.price === 0,
          location: eventData.location,
        };

        console.log(formattedEvent);
        
        setEvent(formattedEvent);
        setLocationSearch(formattedEvent.location);
        
        // If coordinates exist in the event data, set them
        if (eventData.coordinates) {
          setMapCoordinates(eventData.coordinates);
        }

      } catch (error) {
        console.error('Error fetching event:', error);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  const generateDescription = async () => {
    if (!aiPrompt.trim()) return;
    setLoading(true);
    try {
      const description = await worqhatService.generateDescription(aiPrompt);
      setEvent(prev => ({ ...prev, description }));
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format date for input fields
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Format: "YYYY-MM-DDThh:mm"
  };

  // Quill modules configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };

  // Handle rich text editor change
  const handleDescriptionChange = (content) => {
    setEvent(prev => ({
      ...prev,
      description: content
    }));
  };

  // Updated handleChange to properly handle tags
  const handleChange = (e) => {
    if (e?.target) {
      const { name, value, type, checked } = e.target;

      if (name === 'tags') {
        // Split by comma but preserve the last comma if it exists
        const tagsString = value.endsWith(',') ? value : value.replace(/,\s*$/, '');
        const tagsArray = tagsString.split(',').map(tag => tag.trim());
        setEvent(prev => ({
          ...prev,
          tags: tagsArray
        }));
      } else if (type === 'datetime-local') {
        setValidationErrors(prev => ({
          ...prev,
          startDate: undefined,
          endDate: undefined
        }));
        setEvent(prev => ({
          ...prev,
          [name]: value
        }));
      } else {
        setEvent(prev => ({
          ...prev,
          [name]: type === 'checkbox' ? checked : value
        }));
      }
    }
  };

  // Handle Switch component change
  const handleSwitchChange = (checked) => {
    setEvent(prev => ({
      ...prev,
      isFree: checked,
      price: checked ? 0 : prev.price
    }));
  };

  // Handle file drops
  const handleBannerDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setEvent(prev => ({
        ...prev,
        bannerImage: file
      }));
    }
  }, []);

  const handleCoverDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setEvent(prev => ({
        ...prev,
        coverImage: file
      }));
    }
  }, []);

  // Update when coordinates change
  useEffect(() => {
    if (event.coordinates) {
      setMapCoordinates(event.coordinates);
    }
  }, [event.coordinates]);

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setLocationSearch(value);
    
    // Update form state with the address string
    setEvent(prev => ({
      ...prev,
      location: value
    }));
    
    // Clear coordinates if location is changed
    setMapCoordinates(null);
  };

  // Add debounced geocoding
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (locationSearch && locationSearch.length > 3) {
        try {
          const response = await axios.get('/api/geocode', {
            params: { address: locationSearch }
          });
          // Update map coordinates if we get a result
          if (response.data.coordinates) {
            setMapCoordinates(response.data.coordinates);
          }
        } catch (error) {
          console.error('Geocoding error:', error);
        }
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [locationSearch]);

  // Add validation function
  const validateForm = () => {
    const errors = {};

    // Validate dates
    if (event.startDate && event.endDate) {
      if (new Date(event.endDate) < new Date(event.startDate)) {
        errors.endDate = 'End date must be after or equal to start date';
      }
    }

    // Validate description
    if (event.description && event.description.length < 10) {
      errors.description = 'Description must be at least 10 characters long';
    }

    // Add status validation
    if (event.status === 'cancelled' || event.status === 'postponed') {
      if (!window.confirm(`Are you sure you want to mark this event as ${event.status}? This will invalidate all tickets.`)) {
        errors.status = `Cannot mark event as ${event.status}`;
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Update handleSubmit to handle dates properly
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create FormData object
      const formData = new FormData();

      // Process tags before adding to formData
      const processedTags = Array.isArray(event.tags)
        ? event.tags.join(',')
        : event.tags;

      // Add all fields to formData
      Object.keys(event).forEach(key => {
        if (key === 'tags') {
          formData.append(key, processedTags);
        } else if (key === 'attendance') {
          // Serialize attendance object to JSON string
          formData.append(key, JSON.stringify(event.attendance));
        } else if (key !== 'bannerImage' && key !== 'coverImage' && key !== 'organizer') { // Exclude organizer
          // Don't append empty virtualLink for physical events
          if (key === 'virtualLink' && event.type === 'physical') {
            return;
          }
          formData.append(key, event[key]);
        }
      });

      // Add images if they exist
      if (event.bannerImage instanceof File) {
        formData.append('bannerImage', event.bannerImage);
      }
      if (event.coverImage instanceof File) {
        formData.append('coverImage', event.coverImage);
      }

      // Submit the form
      if (id) {
        await eventService.updateEvent(id, formData);
        toast.success('Event updated successfully');
      } else {
        await eventService.createEvent(formData);
        toast.success('Event created successfully');
      }

      navigate('/organizer/events');
    } catch (error) {
      console.error('Error saving event:', error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-5">
      <form onSubmit={handleSubmit} className="space-y-8 bg-white shadow-xl rounded-lg p-6">
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-2xl font-semibold text-gray-900">
            {id ? 'Edit Event' : 'Create New Event'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Fill in the details for your event.
          </p>
        </div>

        <div className="space-y-6">
          <InputField
            label="Title"
            name="title"
            type="text"
            value={event.title}
            onChange={handleChange}
            required
            placeholder="Enter event title"
            error={validationErrors.title}
          />

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <div className="mt-2">
              <ReactQuill
                theme="snow"
                value={event.description}
                onChange={handleDescriptionChange}
                modules={quillModules}
                className="h-48 mb-12" // Add padding at bottom for toolbar
                placeholder="Describe your event (minimum 10 characters)"
              />
            </div>

            <div className='flex flex-row justify-start gap-4 mt-4'>
          
              <button
                onClick={() => setIsModalOpen(true)}
                className={`px-4 py-2 rounded inline-flex items-center ${
                  subscription?.tier === 'pro' 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-indigo-400 text-white cursor-not-allowed'
                }`}
                disabled={subscription?.tier !== 'pro'}
                title={subscription?.tier !== 'pro' ? 'Upgrade to Pro for AI features' : 'Generate description with AI'}
              >
                {subscription?.tier !== 'pro' && (
                  <LockClosedIcon className="h-4 w-4 mr-2" />
                )}
                {subscription?.tier === 'pro' ? 'Generate Description with AI' : 'Generate Description with AI'}
              </button>

              {subscription?.tier !== 'pro' && (
                <p className="mt-2 text-sm text-gray-500">
                  <span className="font-medium">Want AI features?</span>{' '}
                  <a 
                    href="/subscription" 
                    className="text-indigo-600 hover:underline"
                  >
                    Upgrade to Pro
                  </a> to unlock AI-powered description generation.
                </p>
              )}

            </div>


            <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
              <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
                <div className="bg-white p-6 rounded shadow-lg w-96">
                  <h2 className="text-lg font-semibold">Enter a prompt for AI</h2>
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Describe what you want..."
                    className="w-full p-2 border rounded mt-2"
                  />
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 bg-gray-300 rounded mr-2"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={generateDescription}
                      className="px-4 py-2 bg-indigo-600 text-white rounded"
                      disabled={loading}
                    >
                      {loading ? 'Generating...' : 'Generate'}
                    </button>
                  </div>
                </div>
              </div>
            </Dialog>
            {validationErrors.description && (
              <p className="mt-2 text-sm text-red-600">{validationErrors.description}</p>
            )}
          </div>

          <SelectField
            label="Category"
            name="category"
            value={event.category}
            onChange={handleChange}
            required
            options={[
              { value: 'Conference', label: 'Conference' },
              { value: 'Workshop', label: 'Workshop' },
              { value: 'Webinar', label: 'Webinar' },
              { value: 'Meetup', label: 'Meetup' },
              { value: 'Training', label: 'Training' },
              { value: 'Other', label: 'Other' },
            ]}
          />

          <SelectField
            label="Event Type"
            name="type"
            value={event.type}
            onChange={handleChange}
            required
            options={[
              { value: 'physical', label: 'Physical' },
              { value: 'virtual', label: 'Virtual' },
              { value: 'hybrid', label: 'Hybrid' },
            ]}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Start Date"
              name="startDate"
              type="datetime-local"
              value={event.startDate}
              onChange={handleChange}
              required
              icon={CalendarIcon}
              error={validationErrors.startDate}
            />

            <InputField
              label="End Date"
              name="endDate"
              type="datetime-local"
              value={event.endDate}
              onChange={handleChange}
              required
              icon={ClockIcon}
              error={validationErrors.endDate}
            />
          </div>

          {(event.type === 'physical' || event.type === 'hybrid') && (
            <div className="mb-6">
  
              <InputField
                label="Physical Location"
                name="location"
                type="text"
                value={event.location || ''}
                onChange={handleChange}
                required={event.type === 'physical'}
                icon={MapPinIcon}
                placeholder="Enter event address"
              />
            </div>
          )}

          {(event.type === 'virtual' || event.type === 'hybrid') && (
            <InputField
              label="Virtual Link"
              name="virtualLink"
              type="url"
              value={event.virtualLink}
              onChange={handleChange}
              required={event.type === 'virtual'}
              icon={LinkIcon}
              placeholder="https://your-meeting-link.com"
            />
          )}

          <div className="space-y-4">
            <PriceToggle
              enabled={event.isFree}
              onChange={handleSwitchChange}
            />

            {!event.isFree && (
              <InputField
                label="Ticket Price"
                name="price"
                type="number"
                value={event.price}
                onChange={handleChange}
                required
                icon={CurrencyDollarIcon}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            )}
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
              Tags
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <TagIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                name="tags"
                id="tags"
                value={Array.isArray(event.tags) ? event.tags.join(', ') : ''}
                onChange={handleChange}
                className={`block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ${validationErrors.tags ? 'ring-red-300' : 'ring-gray-300'
                  } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}
                placeholder="Enter tags separated by commas"
              />
            </div>
            {validationErrors.tags && (
              <p className="mt-2 text-sm text-red-600">{validationErrors.tags}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Separate tags with commas (e.g., conference, tech, workshop)
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Banner Image
              </label>
              <FileDropzone
                onDrop={handleBannerDrop}
                accept={{
                  'image/*': ['.png', '.jpg', '.jpeg', '.gif']
                }}
              />
              {event.bannerImage && (
                <p className="mt-2 text-sm text-gray-500">
                  Selected: {event.bannerImage.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Cover Image
              </label>
              <FileDropzone
                onDrop={handleCoverDrop}
                accept={{
                  'image/*': ['.png', '.jpg', '.jpeg', '.gif']
                }}
              />
              {event.coverImage && (
                <p className="mt-2 text-sm text-gray-500">
                  Selected: {event.coverImage.name}
                </p>
              )}
            </div>
          </div>

          {id && ( // Only show status field when editing existing event
            <SelectField
              label="Event Status"
              name="status"
              value={event.status}
              onChange={handleChange}
              required
              options={[
                { value: 'upcoming', label: 'Upcoming' },
                { value: 'ongoing', label: 'Ongoing' },
                { value: 'postponed', label: 'Postponed' },
                { value: 'cancelled', label: 'Cancelled' }
              ]}
              error={validationErrors.status}
            />
          )}

          {(event.status === 'cancelled' || event.status === 'postponed') && (
            <div className="mb-4">
              <label htmlFor="statusReason" className="block text-sm font-medium text-gray-900 mb-1">
                Reason for {event.status === 'cancelled' ? 'Cancellation' : 'Postponement'} <span className="text-red-500">*</span>
              </label>
              <textarea
                id="statusReason"
                name="statusReason"
                value={event.statusReason || ''}
                onChange={handleChange}
                required
                rows={3}
                className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${validationErrors.statusReason ? 'ring-red-300' : 'ring-gray-300'
                  } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}
                placeholder={`Please provide a reason for ${event.status === 'cancelled' ? 'cancelling' : 'postponing'} the event`}
              />
              {validationErrors.statusReason && (
                <p className="mt-2 text-sm text-red-600">{validationErrors.statusReason}</p>
              )}
            </div>
          )}

          <div className="col-span-2">
            <Switch.Group as="div" className="flex items-center">
              <Switch
                checked={event.manualStatusControl}
                onChange={(checked) => setEvent(prev => ({ ...prev, manualStatusControl: checked }))}
                className={`${event.manualStatusControl ? 'bg-indigo-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors`}
              >
                <span className="sr-only">Enable manual status control</span>
                <span
                  className={`${event.manualStatusControl ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform mt-1`}
                />
              </Switch>
              <Switch.Label as="span" className="ml-3 text-sm">
                <span className="font-medium text-gray-900">Manual Status Control</span>
                <span className="text-gray-500"> - Manually start and end the event</span>
              </Switch.Label>
            </Switch.Group>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/organizer/events')}
            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
          >
            {loading ? 'Saving...' : id ? 'Update Event' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm; 