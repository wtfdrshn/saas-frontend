import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircleIcon, GlobeAltIcon } from '@heroicons/react/24/solid';
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import EditProfileModal from '../../components/profile/EditProfileModal';
import profileService from '../../services/profileService';

const SocialMediaLink = ({ url, icon: Icon, platform }) => {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-400 hover:text-gray-500"
    >
      <Icon className="h-5 w-5" />
      <span className="sr-only">{platform}</span>
    </a>
  );
};

const SubscriptionStatus = ({ subscription }) => {
  if (!subscription) return null;

  const daysRemaining = Math.ceil(
    (new Date(subscription.expiresAt) - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="bg-indigo-50 p-4 rounded-lg w-11/12">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-indigo-800">
            {subscription.tier === 'pro' ? 'Pro Plan' : 'Free Plan'}
          </h3>
          <p className="text-sm text-indigo-700">
            Status: {subscription.status === 'active' ? 'Active' : 'Inactive'}
            {subscription.tier === 'pro' && ` • ${daysRemaining} days remaining`}
          </p>
          {subscription.expiresAt && (
            <p className="text-sm text-indigo-600">
              Renewal date: {new Date(subscription.expiresAt).toLocaleDateString()}
            </p>
          )}
        </div>
        {subscription.tier === 'free' && (
          <button
            onClick={() => window.location.href = '/subscription'}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm"
          >
            Upgrade to Pro
          </button>
        )}
      </div>
    </div>
  );
};

const OrganizerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await profileService.getOrganizerProfile();
      setProfile(data.organizer);
      console.log(data);
      
    } catch (error) {
      toast.error(error.message || 'Failed to fetch profile');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (updatedData) => {
    try {
      const data = await profileService.updateOrganizerProfile(updatedData);
      setProfile(data);
      setIsEditModalOpen(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const data = await profileService.uploadProfilePicture(file);
      setProfile(prev => ({ ...prev, profilePicture: data.profilePicture }));
      toast.success('Profile picture updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to upload profile picture');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg">
        {/* Profile Header */}
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Organizer Profile</h3>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Edit Profile
          </button>
        </div>


        {/* Profile Content */}
        <div className="border-t border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            {/* Profile Picture and Basic Info */}
            <div className="flex items-center space-x-5 mb-6">
              <div className="relative">
                {profile.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt="Profile"
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <UserCircleIcon className="h-24 w-24 text-gray-300" />
                )}
                <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-lg cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                  />
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </label>
              </div>
              <div>
                <h4 className="text-xl font-medium text-gray-900">{profile.organizationName}</h4>
                <p className="text-gray-500">{profile.email}</p>
              </div>
            </div>

            {/* Organization Details */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-6">
              <div>
                <h5 className="text-sm font-medium text-gray-500">Description</h5>
                <p className="mt-1 text-sm text-gray-900">{profile.description || 'No description provided'}</p>
              </div>

              {profile.website && (
                <div>
                  <h5 className="text-sm font-medium text-gray-500">Website</h5>
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-sm text-indigo-600 hover:text-indigo-500 flex items-center"
                  >
                    <GlobeAltIcon className="h-4 w-4 mr-1" />
                    {profile.website}
                  </a>
                </div>
              )}
            </div>

            {/* Social Media Links */}
            {profile.socialMedia && Object.values(profile.socialMedia).some(Boolean) && (
              <div className="border-t border-gray-200 pt-4">
                <h5 className="text-sm font-medium text-gray-500 mb-3">Social Media</h5>
                <div className="flex space-x-4">
                  <SocialMediaLink
                    url={profile.socialMedia.facebook}
                    icon={FaFacebook}
                    platform="Facebook"
                  />
                  <SocialMediaLink
                    url={profile.socialMedia.twitter}
                    icon={FaTwitter}
                    platform="Twitter"
                  />
                  <SocialMediaLink
                    url={profile.socialMedia.instagram}
                    icon={FaInstagram}
                    platform="Instagram"
                  />
                  <SocialMediaLink
                    url={profile.socialMedia.linkedin}
                    icon={FaLinkedin}
                    platform="LinkedIn"
                  />
                </div>
              </div>
            )}

            {/* Additional Details */}
            <div className="border-t border-gray-200 mt-6 pt-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Organizer ID</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profile.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Account Status</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {profile.isVerified ? (
                      <span className="text-green-600">Verified</span>
                    ) : (
                      <span className="text-yellow-600">Unverified</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>

      
      <div className='flex justify-center items-center shadow rounded-lg bg-white mt-4 p-4'>
        {/* Add Subscription Status Section Here */}
        <SubscriptionStatus subscription={profile.subscription} />
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onSubmit={handleProfileUpdate}
        isOrganizer={true}
      />
    </div>
  );
};

export default OrganizerProfile; 