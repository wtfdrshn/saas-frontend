import { Formik, Field } from 'formik';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { organizerRegistrationSchema } from '../../utils/validationSchemas';
import authService from '../../services/api.js';
import Input from '../common/Input';
import { useAuth } from '../../context/AuthContext.jsx';
import AnimatedBackground from '../common/AnimatedBackground';

const OrganizerRegistration = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  // const { login } = useAuth();
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const { confirmPassword, ...data } = values;
      await authService.registerOrganizer(data);
      // login(data, response.data.token);
      navigate('/login/organizer', { 
        state: { message: 'Registration successful. Please login to continue.' }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AnimatedBackground />
      <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative z-10">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Register as an Organizer
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white/50 backdrop-blur-md p-8 rounded-lg shadow-md">
            {error && (
              <div className="mb-4 text-red-500 text-center">{error}</div>
            )}

            <Formik
              initialValues={{
                name: '',
                email: '',
                password: '',
                confirmPassword: '',
                organizationName: '',
              }}
              validationSchema={organizerRegistrationSchema}
              onSubmit={handleSubmit}
            >
              {({ handleSubmit, isSubmitting }) => (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Field
                    name="name"
                    label="Full Name"
                    component={Input}
                  />
                  <Field
                    name="email"
                    label="Email"
                    type="email"
                    component={Input}
                  />
                  <Field
                    name="organizationName"
                    label="Organization Name"
                    component={Input}
                  />
                  <Field
                    name="password"
                    label="Password"
                    type="password"
                    component={Input}
                  />
                  <Field
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    component={Input}
                  />

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Registering...' : 'Register'}
                  </button>
                </form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrganizerRegistration; 