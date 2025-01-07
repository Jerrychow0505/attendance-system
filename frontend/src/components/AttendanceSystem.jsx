// frontend/src/components/AttendanceSystem.js
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";

const AttendanceSystem = () => {
  const [studentId, setStudentId] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [error, setError] = useState('');
  const [studentData, setStudentData] = useState(null);

  const validateInput = () => {
    if (!studentId) {
      setError('Please enter your CUNY ID');
      return false;
    }
    if (!/^\d{8}$/.test(studentId)) {
      setError('CUNY ID must be 8 digits');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmissionStatus(null);
    
    if (!validateInput()) return;

    try {
      // First verify the student
      const verifyResponse = await fetch(`http://localhost:3001/api/verify/${studentId}`);
      const verifyData = await verifyResponse.json();
      
      if (!verifyData.verified) {
        setError('Student not found in class roster. Please verify your CUNY ID.');
        return;
      }

      setStudentData(verifyData.student);

      // Submit attendance
      const attendanceResponse = await fetch('http://localhost:3001/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId })
      });

      const attendanceData = await attendanceResponse.json();

      if (!attendanceResponse.ok) {
        throw new Error(attendanceData.error || 'Failed to record attendance');
      }
      
      setSubmissionStatus('success');
      
      // Reset form after successful submission
      setTimeout(() => {
        setStudentId('');
        setStudentData(null);
        setSubmissionStatus(null);
      }, 3000);
    } catch (err) {
      setSubmissionStatus('error');
      setError(err.message || 'Failed to submit attendance. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            CSCI 111 Attendance
          </CardTitle>
          <p className="text-center text-gray-600">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="CUNY ID (8 digits)"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full p-2 border rounded"
                maxLength={8}
              />
            </div>
            
            {studentData && (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="flex items-center">
                  <UserCheck className="mr-2 h-4 w-4 text-blue-500" />
                  Welcome, {studentData.firstName} {studentData.lastName}
                </AlertDescription>
              </Alert>
            )}
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription className="flex items-center">
                  <XCircle className="mr-2 h-4 w-4" />
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            {submissionStatus === 'success' && (
              <Alert className="bg-green-50 text-green-700 border-green-200">
                <AlertDescription className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Attendance recorded successfully!
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={submissionStatus === 'success'}
            >
              Submit Attendance
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceSystem;