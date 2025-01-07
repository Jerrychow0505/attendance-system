import { useState } from 'react'
import AttendanceSystem from './components/AttendanceSystem'
import QRGenerator from './components/admin/QRGenerator'
import './globals.css'

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <div className="App">
      {isAdmin ? (
        <QRGenerator />
      ) : (
        <AttendanceSystem />
      )}
      {/* Simple toggle for demo purposes */}
      <button 
        onClick={() => setIsAdmin(!isAdmin)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-md"
      >
        {isAdmin ? 'View Attendance Form' : 'View QR Code'}
      </button>
    </div>
  )
}

export default App