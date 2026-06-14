'use client';

import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/dashboard/dashboard-components';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { checkIn, checkOut, useAttendance, useEmployees } from '@/hooks/useFirestoreData';
import { useAuth } from '@/contexts/providers';
import { auth } from '@/lib/firebase';
import { API_URL } from '@/lib/api';
import { authenticatedFetch } from '@/lib/auth-fetch';
import { Camera, RefreshCcw, X } from 'lucide-react';
import { useState, useEffect, useMemo, useRef } from 'react';

export default function Attendance() {
  const { profile } = useAuth();
  const { data: employees } = useEmployees();
  const { data: attendance, loading, error } = useAttendance();
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveError, setLeaveError] = useState('');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'checkin' | 'checkout'>('checkin');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [photoPreview, setPhotoPreview] = useState<{ src: string; title: string; subtitle: string } | null>(null);
  const [leaveType, setLeaveType] = useState('Paid Leave');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveFrom, setLeaveFrom] = useState(new Date().toISOString().split('T')[0]);
  const [leaveTo, setLeaveTo] = useState(new Date().toISOString().split('T')[0]);
  const [leaveMsg, setLeaveMsg] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    }, 1000);
    setCurrentTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    return () => clearInterval(timer);
  }, []);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  useEffect(() => {
    if (!showModal) {
      stopCamera();
      setCapturedPhoto('');
      setCameraError('');
      return;
    }

    let active = true;
    setCapturedPhoto('');
    setCameraError('');
    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Camera is not available in this browser.');
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false
        });
        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
      } catch (error: any) {
        setCameraError(error?.message || 'Unable to start camera. Please allow camera permission.');
      }
    };

    void startCamera();

    return () => {
      active = false;
      stopCamera();
    };
  }, [showModal, modalType]);

  const today = new Date().toISOString().slice(0, 10);
  const todayAttendance = useMemo(
    () => attendance.filter((a: any) => a.date === today),
    [attendance, today]
  );
  const todayRecordsByUser = useMemo(
    () => new Map(todayAttendance.map((a: any) => [a.userId, a])),
    [todayAttendance]
  );
  const todayRecord = profile ? todayRecordsByUser.get(profile.uid) : undefined;
  const myLeaveRequests = useMemo(
    () => (leaveRequests || []).filter((req: any) => req.userId === profile?.uid),
    [leaveRequests, profile?.uid]
  );

  const fetchLeaveRequests = async () => {
    if (!auth.currentUser) return;
    setLeaveLoading(true);
    setLeaveError('');
    try {
      const response = await authenticatedFetch(`${API_URL}/attendance/leave-requests`);
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to load leave requests');
      }
      setLeaveRequests(await response.json());
    } catch (e: any) {
      setLeaveError(e.message);
    } finally {
      setLeaveLoading(false);
    }
  };

  useEffect(() => {
    if (auth.currentUser) {
      fetchLeaveRequests();
    }
  }, [profile?.uid]);

  const handleCheckIn = async () => {
    if (!profile) return;
    if (!capturedPhoto) {
      setMessage('Error: Please capture your photo first.');
      return;
    }
    setIsProcessing(true);
    setMessage('');
    try {
      await checkIn(profile.uid, {
        photo: capturedPhoto,
        employeeId: profile.employeeId,
        employeeName: profile.name
      });
      setMessage('✓ Checked in successfully!');
      stopCamera();
      setTimeout(() => {
        setShowModal(false);
        setMessage('');
      }, 2000);
    } catch (e: any) {
      setMessage(`Error: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckOut = async () => {
    if (!profile) return;
    if (!capturedPhoto) {
      setMessage('Error: Please capture your photo first.');
      return;
    }
    setIsProcessing(true);
    setMessage('');
    try {
      await checkOut(profile.uid, {
        photo: capturedPhoto,
        employeeId: profile.employeeId,
        employeeName: profile.name
      });
      setMessage('✓ Checked out successfully!');
      stopCamera();
      setTimeout(() => {
        setShowModal(false);
        setMessage('');
      }, 2000);
    } catch (e: any) {
      setMessage(`Error: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLeaveRequest = async () => {
    if (!profile) return;
    setLeaveMsg('');
    try {
      const response = await authenticatedFetch(`${API_URL}/attendance/leave-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fromDate: leaveFrom,
          toDate: leaveTo,
          type: leaveType,
          reason: leaveReason
        })
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || 'Leave request failed');
      }
      setLeaveMsg('Leave request submitted successfully.');
      setLeaveReason('');
      setLeaveType('Paid Leave');
      setLeaveFrom(new Date().toISOString().split('T')[0]);
      setLeaveTo(new Date().toISOString().split('T')[0]);
      await fetchLeaveRequests();
      setTimeout(() => setLeaveMsg(''), 3000);
    } catch (e: any) {
      setLeaveMsg(`Error submitting request: ${e.message}`);
    }
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  };

  const calculateDuration = (checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) return '—';
    const start = new Date(checkIn).getTime();
    const end = new Date(checkOut).getTime();
    const diff = end - start;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setMessage('Error: Camera preview is not ready yet.');
      return;
    }
    const canvas = document.createElement('canvas');
    const maxWidth = 640;
    const scale = Math.min(1, maxWidth / video.videoWidth);
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    setCapturedPhoto(canvas.toDataURL('image/jpeg', 0.72));
    setMessage('');
  };

  const retakePhoto = () => {
    setCapturedPhoto('');
    window.setTimeout(() => {
      if (videoRef.current && streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        void videoRef.current.play().catch(() => undefined);
      }
    }, 0);
  };

  return (
    <AppShell>
      <PageHeader
        title="Attendance"
        subtitle="Real-time attendance tracking with check-in and check-out"
        actions={
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                setModalType('checkin');
                setShowModal(true);
              }}
              disabled={!!todayRecord?.checkIn}
              className={todayRecord?.checkIn ? 'opacity-50 cursor-not-allowed' : ''}
            >
              ✓ Check In
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setModalType('checkout');
                setShowModal(true);
              }}
              disabled={!todayRecord?.checkIn || !!todayRecord?.checkOut}
              className={(!todayRecord?.checkIn || todayRecord?.checkOut) ? 'opacity-50 cursor-not-allowed' : ''}
            >
              ✗ Check Out
            </Button>
          </div>
        }
      />

      {/* Modal Popup */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-2xl">
            <div className="text-center">
              <p className="text-slate-600 text-sm uppercase tracking-wide">
                {modalType === 'checkin' ? 'Check In Time' : 'Check Out Time'}
              </p>
              <div className="mt-6 mb-8">
                <div className="text-6xl font-bold text-gold-600 font-mono tracking-wide">
                  {currentTime}
                </div>
                <p className="text-slate-500 mt-2">
                  {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
                {capturedPhoto ? (
                  <button
                    type="button"
                    className="block w-full"
                    onClick={() => setPhotoPreview({
                      src: capturedPhoto,
                      title: modalType === 'checkin' ? 'Check-in photo preview' : 'Check-out photo preview',
                      subtitle: `${profile?.name || 'Employee'} • ${new Date().toLocaleString('en-IN')}`
                    })}
                  >
                    <img src={capturedPhoto} alt="Captured attendance proof" className="h-64 w-full object-cover" />
                  </button>
                ) : (
                  <video ref={videoRef} playsInline muted className="h-64 w-full object-cover" />
                )}
              </div>
              {cameraError && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">{cameraError}</p>}
              <Button
                type="button"
                variant="outline"
                onClick={capturedPhoto ? retakePhoto : capturePhoto}
                className="mb-5 w-full"
              >
                {capturedPhoto ? <RefreshCcw size={17} /> : <Camera size={17} />}
                {capturedPhoto ? 'Retake Photo' : 'Capture Photo'}
              </Button>

              {modalType === 'checkout' && todayRecord?.checkIn && (
                <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-slate-600">Check-in Time</p>
                  <p className="text-lg font-semibold text-blue-700">{formatTime(todayRecord.checkIn)}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Duration: {calculateDuration(todayRecord.checkIn, new Date().toISOString())} (so far)
                  </p>
                </div>
              )}

              {message && (
                <p className={`mb-4 text-sm font-semibold ${message.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>
                  {message}
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowModal(false);
                    setMessage('');
                    stopCamera();
                  }}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={modalType === 'checkin' ? handleCheckIn : handleCheckOut}
                  disabled={isProcessing || !capturedPhoto}
                  className="flex-1"
                >
                  {isProcessing ? 'Processing...' : modalType === 'checkin' ? 'Confirm Check-In' : 'Confirm Check-Out'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {loading && <p className="mb-3 text-sm text-slate-500">Loading Firebase attendance...</p>}
      {error && <p className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      {/* My Attendance Card */}
      {profile && (
        <Card className="mb-6 bg-gradient-to-r from-gold-50 to-orange-50 border-gold-200">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-600 uppercase">Your Status</p>
              <p className="text-2xl font-bold mt-1">
                {todayRecord?.checkOut ? '✓ Checked Out' : todayRecord?.checkIn ? '✓ Checked In' : '○ Not Started'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 uppercase">Check-in Time</p>
              <p className="text-lg font-semibold text-blue-600 mt-1">{formatTime(todayRecord?.checkIn)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 uppercase">Check-out Time</p>
              <p className="text-lg font-semibold text-red-600 mt-1">{formatTime(todayRecord?.checkOut)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 uppercase">Duration</p>
              <p className="text-lg font-semibold text-green-600 mt-1">
                {todayRecord?.checkIn && todayRecord?.checkOut 
                  ? calculateDuration(todayRecord.checkIn, todayRecord.checkOut)
                  : '—'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Leave Request Form */}
      <Card className="mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg">Request Leave</h3>
              <p className="text-sm text-slate-500">Submit a leave request without leaving the attendance page.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {todayRecord?.status || 'No attendance record yet'}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm text-slate-500">Leave Type</p>
              <Input value={leaveType} onChange={(e) => setLeaveType(e.target.value)} />
            </div>
            <div>
              <p className="text-sm text-slate-500">From</p>
              <Input type="date" value={leaveFrom} onChange={(e) => setLeaveFrom(e.target.value)} />
            </div>
            <div>
              <p className="text-sm text-slate-500">To</p>
              <Input type="date" value={leaveTo} onChange={(e) => setLeaveTo(e.target.value)} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Reason</p>
              <Textarea value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} placeholder="Reason for leave" />
            </div>
          </div>

          {leaveMsg && <p className="text-sm text-slate-600">{leaveMsg}</p>}
          {leaveError && <p className="text-sm text-red-600">{leaveError}</p>}
          {leaveLoading && <p className="text-sm text-slate-500">Loading leave requests...</p>}

          <Button
            onClick={handleLeaveRequest}
            disabled={!leaveReason.trim() || !leaveFrom || !leaveTo}
          >
            Submit Leave Request
          </Button>
        </div>
      </Card>

      {profile && (
        <Card className="mb-6">
          <h3 className="font-bold text-lg mb-4">My Leave Requests</h3>
          {myLeaveRequests.length > 0 ? (
            <div className="space-y-3">
              {myLeaveRequests.map((request: any) => (
                <div key={request.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-500">{request.type}</p>
                      <h4 className="font-semibold">{request.fromDate} → {request.toDate}</h4>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      request.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {request.status || 'Pending'}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-700">{request.reason}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">You have no leave requests yet.</p>
          )}
        </Card>
      )}

      {/* Attendance Records Table */}
      <Card>
        <h3 className="font-bold text-lg mb-4">Team Attendance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3 font-semibold">Employee</th>
                <th className="p-3 font-semibold">Date</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold">Check-in</th>
                <th className="p-3 font-semibold">Check-out</th>
                <th className="p-3 font-semibold">Photo Proof</th>
                <th className="p-3 font-semibold">Duration</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => {
                const a: any = todayRecordsByUser.get(e.uid);
                const statusColor = a?.checkOut ? 'bg-green-50' : a?.checkIn ? 'bg-blue-50' : 'bg-gray-50';
                return (
                  <tr className={`border-t ${statusColor} hover:bg-opacity-75`} key={e.uid}>
                    <td className="p-3 font-semibold">{e.name}</td>
                    <td className="p-3">{a?.date ? new Date(a.date).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        a?.checkOut ? 'bg-green-200 text-green-800' :
                        a?.checkIn ? 'bg-blue-200 text-blue-800' :
                        'bg-gray-200 text-gray-800'
                      }`}>
                        {a?.status || 'Absent'}
                      </span>
                    </td>
                    <td className="p-3 font-mono">{formatTime(a?.checkIn)}</td>
                    <td className="p-3 font-mono">{formatTime(a?.checkOut)}</td>
                    <td
                      className={`p-3 ${a?.checkInPhoto || a?.checkOutPhoto ? 'cursor-pointer' : ''}`}
                      title={a?.checkInPhoto || a?.checkOutPhoto ? 'Click to preview photo proof' : undefined}
                      onClick={() => {
                        if (a?.checkInPhoto) {
                          setPhotoPreview({
                            src: a.checkInPhoto,
                            title: `${e.name} check-in photo`,
                            subtitle: `${a?.date ? new Date(a.date).toLocaleDateString('en-IN') : 'Today'} • ${formatTime(a?.checkIn)}`
                          });
                        } else if (a?.checkOutPhoto) {
                          setPhotoPreview({
                            src: a.checkOutPhoto,
                            title: `${e.name} check-out photo`,
                            subtitle: `${a?.date ? new Date(a.date).toLocaleDateString('en-IN') : 'Today'} • ${formatTime(a?.checkOut)}`
                          });
                        }
                      }}
                    >
                      <div className="flex flex-wrap gap-2">
                        {a?.checkInPhoto && (
                          <button
                            type="button"
                            title="Preview check-in photo"
                            onClick={(event) => {
                              event.stopPropagation();
                              setPhotoPreview({
                                src: a.checkInPhoto,
                                title: `${e.name} check-in photo`,
                                subtitle: `${a?.date ? new Date(a.date).toLocaleDateString('en-IN') : 'Today'} • ${formatTime(a?.checkIn)}`
                              });
                            }}
                            className="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700 transition hover:scale-105 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          >
                            <img src={a.checkInPhoto} alt={`${e.name} check-in proof`} className="h-9 w-9 rounded-lg object-cover ring-2 ring-blue-100" />
                            View In
                          </button>
                        )}
                        {a?.checkOutPhoto && (
                          <button
                            type="button"
                            title="Preview check-out photo"
                            onClick={(event) => {
                              event.stopPropagation();
                              setPhotoPreview({
                                src: a.checkOutPhoto,
                                title: `${e.name} check-out photo`,
                                subtitle: `${a?.date ? new Date(a.date).toLocaleDateString('en-IN') : 'Today'} • ${formatTime(a?.checkOut)}`
                              });
                            }}
                            className="inline-flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 transition hover:scale-105 hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                          >
                            <img src={a.checkOutPhoto} alt={`${e.name} check-out proof`} className="h-9 w-9 rounded-lg object-cover ring-2 ring-emerald-100" />
                            View Out
                          </button>
                        )}
                        {!a?.checkInPhoto && !a?.checkOutPhoto && <span className="text-slate-400">—</span>}
                      </div>
                    </td>
                    <td className="p-3 font-mono font-semibold text-green-600">
                      {a?.checkIn && a?.checkOut ? calculateDuration(a.checkIn, a.checkOut) : '—'}
                    </td>
                  </tr>
                );
              })}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500">
                    No employees found in Firebase.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      {photoPreview && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-navy-900/80 p-4 backdrop-blur-md" onClick={() => setPhotoPreview(null)}>
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-4">
              <div>
                <h3 className="text-lg font-black text-navy-900">{photoPreview.title}</h3>
                <p className="text-sm text-slate-500">{photoPreview.subtitle}</p>
              </div>
              <Button variant="ghost" className="h-10 w-10 px-0" onClick={() => setPhotoPreview(null)} aria-label="Close photo preview">
                <X size={18} />
              </Button>
            </div>
            <div className="bg-slate-950 p-3">
              <img src={photoPreview.src} alt={photoPreview.title} className="mx-auto max-h-[72vh] w-full rounded-xl object-contain" />
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
