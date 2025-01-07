// backend/server.js

const express = require('express');
const cors = require('cors');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3001;

// Update CORS configuration
app.use(cors({
  origin: ['https://attendance-system-delta-eight.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// Constants
const EXCEL_FILE_PATH = path.join(__dirname, 'data', 'CSCI 111 Attendance Data.xlsx');

// Helper function to get today's column name (e.g., "7-Jan")
const getTodayColumn = () => {
  const date = new Date();
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' });
  return `${day}-${month}`;
};

// Helper function to read Excel file
async function readExcelFile() {
  const buffer = await fs.readFile(EXCEL_FILE_PATH);
  const workbook = XLSX.read(buffer, {
    cellDates: true,
    cellNF: true,
    cellStyles: true
  });
  return workbook;
}

// Helper function to write Excel file
async function writeExcelFile(workbook) {
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  await fs.writeFile(EXCEL_FILE_PATH, buffer);
}

// Verify student exists in roster
app.get('/api/verify/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const workbook = await readExcelFile();
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    const student = data.find(row => row['CUNY ID'].toString() === studentId);
    
    if (student) {
      res.json({
        verified: true,
        student: {
          firstName: student['First Name'],
          lastName: student['Last Name'],
          email: student['Email']
        }
      });
    } else {
      res.json({ verified: false });
    }
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Failed to verify student' });
  }
});

// Record attendance
app.post('/api/attendance', async (req, res) => {
  try {
    const { studentId } = req.body;
    const todayColumn = getTodayColumn();
    
    // Read the Excel file
    const workbook = await readExcelFile();
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    // Find student's row
    const studentIndex = data.findIndex(row => row['CUNY ID'].toString() === studentId);
    
    if (studentIndex === -1) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Check if attendance was already recorded
    if (data[studentIndex][todayColumn]) {
      return res.status(400).json({ error: 'Attendance already recorded for today' });
    }
    
    // Update attendance
    data[studentIndex][todayColumn] = 'Present';
    
    // Convert back to worksheet
    const newWorksheet = XLSX.utils.json_to_sheet(data);
    workbook.Sheets[workbook.SheetNames[0]] = newWorksheet;
    
    // Save the file
    await writeExcelFile(workbook);
    
    res.json({ 
      success: true, 
      message: 'Attendance recorded successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Attendance recording error:', error);
    res.status(500).json({ error: 'Failed to record attendance' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});