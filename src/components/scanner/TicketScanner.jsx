import React, { useState, useCallback, useRef } from 'react';
import { QrReader } from 'react-qr-reader';
import attendanceService from '../../services/attendanceService';
import toast from 'react-hot-toast';

const TicketScanner = ({ eventId, onScanComplete }) => {
  const [scanning, setScanning] = useState(true);
  const [scannedTicket, setScannedTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const scanTimeoutRef = useRef(null);
  const lastScannedRef = useRef(null);

  const resetScanner = useCallback(() => {
    setScannedTicket(null);
    setScanning(true);
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }
  }, []);

  const handleCheckIn = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      const result = await attendanceService.checkInAttendee(scannedTicket.ticket._id);
      if (result.success) {
        toast.success('Check-in successful');
        if (onScanComplete) {
          onScanComplete(result);
        }
        resetScanner();
      }
    } catch (error) {
      console.error('Check-in error:', error);
      toast.error(error.response?.data?.message || 'Failed to check in attendee');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      const result = await attendanceService.checkOutAttendee(scannedTicket.ticket._id);
      if (result.success) {
        toast.success('Check-out successful');
        if (onScanComplete) {
          onScanComplete(result);
        }
        resetScanner();
      }
    } catch (error) {
      console.error('Check-out error:', error);
      toast.error(error.response?.data?.message || 'Failed to check out attendee');
    } finally {
      setLoading(false);
    }
  };

  const handleScan = useCallback(async (result) => {
    if (!result?.text || !scanning || loading) return;

    // Prevent multiple scans of the same QR code within 3 seconds
    const currentTime = Date.now();
    if (
      lastScannedRef.current?.code === result.text && 
      currentTime - lastScannedRef.current?.time < 3000
    ) {
      return;
    }

    try {
      setScanning(false);
      lastScannedRef.current = { code: result.text, time: currentTime };

      let ticketData;
      try {
        ticketData = JSON.parse(result.text);
      } catch (error) {
        toast.error('Invalid QR code format');
        resetScanner();
        return;
      }

      const scanResult = await attendanceService.scanTicket(ticketData);
      if (scanResult.success) {
        setScannedTicket(scanResult);
      } else {
        // Only show error if not already showing invalid ticket message
        if (!scanResult.ticket?.isValid) {
          toast.error(scanResult.message || 'Invalid ticket');
        }
        resetScanner();
      }
    } catch (error) {
      console.error('Scan error:', error);
      toast.error(error.response?.data?.message || 'Failed to scan ticket');
      resetScanner();
    }
  }, [scanning, loading, resetScanner]);

  return (
    <div className="max-w-md mx-auto space-y-4">
      {!scannedTicket ? (
        <>
          <div className="relative">
            <QrReader
              constraints={{ facingMode: 'environment' }}
              onResult={handleScan}
              className="w-full"
              videoStyle={{ objectFit: 'cover' }}
              videoContainerStyle={{ borderRadius: '0.5rem', overflow: 'hidden' }}
            />
            <div className="absolute inset-0 border-2 border-indigo-500 rounded-lg pointer-events-none" />
          </div>
          <p className="text-sm text-gray-600 text-center">
            Position the QR code within the frame to scan
          </p>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">Ticket Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Ticket Number</p>
                <p className="font-medium">{scannedTicket.ticket.ticketNumber}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <p className="font-medium">
                  {scannedTicket.status.status}
                  {!scannedTicket.ticket.isValid && (
                    <span className="ml-2 text-xs text-red-600">(Invalid)</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Attendee Name</p>
                <p className="font-medium">{scannedTicket.ticket.user?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Check-in Count</p>
                <p className="font-medium">{scannedTicket.status.checkInCount || 0}</p>
              </div>
            </div>
            
            {!scannedTicket.ticket.isValid && (
              <div className="mt-2 p-2 bg-red-50 text-red-700 text-sm rounded">
                This ticket has been invalidated and cannot be used again.
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleCheckIn}
              disabled={loading || scannedTicket.status.status === 'checked-in' || !scannedTicket.ticket.isValid}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md ${
                loading || scannedTicket.status.status === 'checked-in' || !scannedTicket.ticket.isValid
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {loading ? 'Processing...' : 'Check In'}
            </button>
            <button
              onClick={handleCheckOut}
              disabled={loading || scannedTicket.status.status !== 'checked-in'}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md ${
                loading || scannedTicket.status.status !== 'checked-in'
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {loading ? 'Processing...' : 'Check Out'}
            </button>
          </div>

          <button
            onClick={resetScanner}
            disabled={loading}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Scan Another Ticket
          </button>
        </div>
      )}
    </div>
  );
};

export default TicketScanner; 