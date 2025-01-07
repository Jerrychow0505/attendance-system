import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Download } from 'lucide-react';
import QRCode from 'qrcode';

const QRGenerator = () => {
  const [qrUrl, setQrUrl] = useState('');
  const [error, setError] = useState('');
  
  // Replace this URL with your actual Vercel deployment URL
  const attendanceUrl = 'https://attendance-system-delta-eight.vercel.app/';

  useEffect(() => {
    generateQR();
  }, []);
 
  const generateQR = async () => {
    try {
      const url = await QRCode.toDataURL(attendanceUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
      setQrUrl(url);
    } catch (err) {
      setError('Failed to generate QR code');
      console.error(err);
    }
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.download = 'attendance-qr.png';
    link.href = qrUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Attendance QR Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {qrUrl && (
            <div className="flex flex-col items-center space-y-4">
              <img 
                src={qrUrl} 
                alt="Attendance QR Code"
                className="w-64 h-64"
              />
              <Button
                onClick={downloadQR}
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download QR Code</span>
              </Button>
            </div>
          )}
          
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>Scan this QR code to access the attendance form</p>
            <p className="mt-2">URL: {attendanceUrl}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRGenerator;