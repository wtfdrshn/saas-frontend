import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import authService from '../../services/authService';
import AnimatedBackground from '../common/AnimatedBackground';

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
});

const otpSchema = Yup.object().shape({
  otp: Yup.string()
    .required('OTP is required')
    .matches(/^[0-9]{6}$/, 'OTP must be 6 digits')
});

const OrganizerLogin = () => {
  const [error, setError] = useState('');
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otpSentTo, setOtpSentTo] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleInitialSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      const response = await authService.loginOrganizer(values.email, values.password);
      
      if (response.message === 'OTP sent to your email') {
        setOtpSentTo(response.email);
        setShowOtpForm(true);
      } else {
        setError('Unexpected response from server');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      const response = await authService.verifyOTP(values.otp, otpSentTo);
      
      if (response.token && response.organizer) {
        login(response.organizer, response.token);
        navigate('/organizer/dashboard');
      } else {
        setError('Invalid OTP verification response');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err.response?.data?.message || 'OTP verification failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setError('');
      await authService.loginOrganizer(otpSentTo, '');
      setError('New OTP has been sent to your email');
    } catch (err) {
      setError('Failed to resend OTP. Please try logging in again.');
      setShowOtpForm(false);
    }
  };

  return (
    <>
      <AnimatedBackground />
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-md w-full space-y-8 mx-auto bg-white/50 backdrop-blur-md p-8 rounded-lg shadow-md">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {showOtpForm ? 'Enter OTP' : 'Sign in to your organizer account'}
            </h2>
            {showOtpForm && (
              <p className="mt-2 text-center text-sm text-gray-600">
                Please enter the OTP sent to {otpSentTo}
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {!showOtpForm ? (
            <Formik
              initialValues={{ email: '', password: '' }}
              validationSchema={loginSchema}
              onSubmit={handleInitialSubmit}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="mt-8 space-y-6">
                  <div className="rounded-md shadow-sm -space-y-px">
                    <div>
                      <Field
                        name="email"
                        type="email"
                        className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                          errors.email && touched.email ? 'border-red-500' : 'border-gray-300'
                        } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                        placeholder="Email address"
                      />
                      {errors.email && touched.email && (
                        <div className="text-red-500 text-xs mt-1">{errors.email}</div>
                      )}
                    </div>
                    <div>
                      <Field
                        name="password"
                        type="password"
                        className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                          errors.password && touched.password ? 'border-red-500' : 'border-gray-300'
                        } placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                        placeholder="Password"
                      />
                      {errors.password && touched.password && (
                        <div className="text-red-500 text-xs mt-1">{errors.password}</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Signing in...' : 'Sign in'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          ) : (
            <Formik
              initialValues={{ otp: '' }}
              validationSchema={otpSchema}
              onSubmit={handleOtpSubmit}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="mt-8 space-y-6">
                  <div>
                    <Field
                      name="otp"
                      type="text"
                      maxLength="6"
                      className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                        errors.otp && touched.otp ? 'border-red-500' : 'border-gray-300'
                      } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                      placeholder="Enter 6-digit OTP"
                    />
                    {errors.otp && touched.otp && (
                      <div className="text-red-500 text-xs mt-1">{errors.otp}</div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Verifying...' : 'Verify OTP'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      className="text-sm text-indigo-600 hover:text-indigo-500"
                    >
                      Resend OTP
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          )}

          <div className="text-center">
            <Link
              to="/login/user"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign in as a user instead
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrganizerLogin; 