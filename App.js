/*import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
*/

import React, { useState, useEffect } from 'react';
import './index.css';

const DataProcessingApp = () => {
  const [csvFile, setCsvFile] = useState(null);
  const [processingFunction, setProcessingFunction] = useState('');
  const [selectedVariable, setSelectedVariable] = useState('');
  const [variableOptions, setVariableOptions] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [ongoingTasks, setOngoingTasks] = useState([]);
  const [formError, setFormError] = useState('');
  const [uploadedCsv, setUploadedCsv] = useState('');
  const [csvData, setCsvData] = useState([]); // New state for CSV data
  const [csvRows] = useState([]);


  const fetchUploadedFiles = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/get-uploaded-files/');
      if (response.ok) {
        const files = await response.json();
        setUploadedFiles(files);
      } else {
        console.error('Failed to fetch uploaded files');
      }
    } catch (error) {
      console.error('Error during file fetch:', error);
    }
  };

  const submitUpload = async () => {
    if (!csvFile) {
      setFormError('Please select a CSV file.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('csvFile', csvFile);

      const uploadUrl = 'http://localhost:8000/api/upload-csv/';
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        console.log('CSV file uploaded successfully');
        fetchUploadedFiles();
        handleVariableOptions(csvFile);
        handleCsvData(csvFile); // New function to handle CSV data
        setFormError('');
      } else {
        console.error('Failed to upload CSV file');
        setFormError('Failed to upload CSV file.');
      }
    } catch (error) {
      console.error('Error during CSV file upload:', error);
      setFormError('Error during CSV file upload.');
    }
  };

  const fetchOngoingTasks = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/get-ongoing-tasks/');
      if (response.ok) {
        const tasks = await response.json();
        setOngoingTasks(tasks);
      } else {
        console.error('Failed to fetch ongoing tasks');
      }
    } catch (error) {
      console.error('Error during task fetch:', error);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setCsvFile(file);
    setUploadedCsv('');
    setVariableOptions([]);

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedCsv(e.target.result);
        const csvContent = e.target.result;
        const lines = csvContent.split('\n');
        if (lines.length > 0) {
          const headings = lines[0].split(',').map((heading) => heading.trim());
          setSelectedVariable(headings[0]);
          setVariableOptions(headings);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleVariableOptions = async (file) => {
    try {
      const csvContent = await file.text();
      const lines = csvContent.split('\n');
      if (lines.length > 0) {
        const headings = lines[0].split(',').map((heading) => heading.trim());
        setSelectedVariable(headings[0]);
        setVariableOptions(headings);
      }
    } catch (error) {
      console.error('Error getting variable options:', error);
    }
  };

  const handleCsvData = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvContent = e.target.result;
      const lines = csvContent.split('\n');
      const data = [];
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map((item) => item.trim());
        data.push(row);
      }
      setCsvData(data);
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    fetchUploadedFiles();
    fetchOngoingTasks();
  }, []);

  const submitData = async () => {
    if (!csvFile || !processingFunction || !selectedVariable) {
      setFormError('Please fill in all fields.');
      return;
    }

    setFormError('');

    const url = 'http://localhost:8000/api/process-data/';
    const payload = {
      processingFunction: processingFunction,
      selectedVariable: selectedVariable,
      csvFileContent: await csvFile.text(),
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Data Processing Result:', result);
        fetchOngoingTasks();
      } else {
        console.error('Failed to process data');
      }
    } catch (error) {
      console.error('Error during data processing:', error);
    }
  };

  const resetForm = () => {
    setCsvFile(null);
    setProcessingFunction('');
    setSelectedVariable('');
    setVariableOptions([]);
    setFormError('');
  };

  const viewResult = async (taskId) => {
    try {
      const viewResultUrl = `http://localhost:8000/api/view-result/${taskId}/`;
      const response = await fetch(viewResultUrl);

      if (response.ok) {
        const result = await response.json();
        console.log('View Result:', result);
      } else {
        console.error('Failed to view result');
      }
    } catch (error) {
      console.error('Error during result view:', error);
    }
  };

  return (
    <div className="data-processing-app">
      <h1>Basic Data Processing</h1>

      <label htmlFor="csvFile">Import CSV file:</label>
      <div className="file-upload-container">
        <input type="file" id="csvFile" accept=".csv" onChange={(e) => handleFileSelect(e)} />
        <button onClick={submitUpload} disabled={!csvFile}>
          Upload
        </button>
      </div>

      {uploadedCsv && (
        <div>
          <h3>Uploaded CSV:</h3>
          <pre>{uploadedCsv}</pre>
        </div>
      )}

      {csvFile && (
        <div>
          <h3>Variables in the CSV:</h3>
          <ul>
            {variableOptions.map((variable, index) => (
              <li key={index}>{variable}</li>
            ))}
          </ul>
        </div>
      )}

      {csvData.length > 0 && (
        <div>
          <h3>CSV Data:</h3>
          <table>
            <thead>
              <tr>
                {variableOptions.map((variable, index) => (
                  <th key={index}>{variable}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {csvRows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <label htmlFor="processingFunction">Select Function:</label>
      <select
        id="processingFunction"
        value={processingFunction}
        onChange={(e) => setProcessingFunction(e.target.value)}
      >
        {/* ... (options) ... */}
      </select>

      <label htmlFor="selectedVariable">Select Variable:</label>
      <select
        id="selectedVariable"
        value={selectedVariable}
        onChange={(e) => setSelectedVariable(e.target.value)}
      >
        {/* ... (options) ... */}
      </select>

      <div className="button-container">
        <button onClick={submitData}>Submit</button>
        <button onClick={resetForm}>Reset</button>
      </div>

      {formError && <p style={{ color: 'red' }}>{formError}</p>}

      <div className="section-container">
        <div className="section-header">
          <h2>Uploaded Files:</h2>
        </div>
        <div className="section-content">
          <ul>
            {uploadedFiles.map((file, index) => (
              <li key={index}>{file}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="section-container">
        <div className="section-header">
          <h2>Ongoing Tasks:</h2>
        </div>
        <div className="section-content">
          <ul>
            {ongoingTasks.map((task, index) => (
              <li key={index}>
                <span style={{ color: task.status === 'running' ? 'yellow' : 'green' }}>●</span>
                {` Task ID: ${task.id} - ${task.status}`}
                {task.status === 'completed' && (
                  <button onClick={() => viewResult(task.id)}>View Result</button>
                )}
              </li>
            ))}
          </ul>
          <button onClick={() => fetchOngoingTasks()}>Refresh</button>
        </div>
      </div>
    </div>
  );
};

export default DataProcessingApp;