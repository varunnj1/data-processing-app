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


import React, { useState } from 'react';
import './index.css';  // Correctly reference your CSS file

const DataProcessingApp = () => {
  const [csvFile, setCsvFile] = useState(null);
  const [processingFunction, setProcessingFunction] = useState('');
  const [selectedVariable, setSelectedVariable] = useState('');
  const [variableOptions, setVariableOptions] = useState([]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];

    if (file) {
      setCsvFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const lines = content.split('\n');
        if (lines.length > 0) {
          const headings = lines[0].split(',').map((heading) => heading.trim());
          setSelectedVariable(headings[0]);
          setVariableOptions(headings);
        }
      };

      reader.readAsText(file);
    }
  };

  const submitData = () => {
    console.log(`Function: ${processingFunction}, Variable: ${selectedVariable}`);
    // Add your data processing logic here
  };

  const resetForm = () => {
    setCsvFile(null);
    setProcessingFunction('');
    setSelectedVariable('');
    setVariableOptions([]);
  };

  return (
    <div className="data-processing-app">
      <h1>Basic Data Processing</h1>

      <label htmlFor="csvFile">Import CSV file:</label>
      <input type="file" id="csvFile" accept=".csv" onChange={handleFileSelect} />

      <label htmlFor="processingFunction">Select Function:</label>
      <select
        id="processingFunction"
        value={processingFunction}
        onChange={(e) => setProcessingFunction(e.target.value)}
      >
        <option value="" disabled hidden>
          Select a function
        </option>
        <option value="standardization">Standardization</option>
        <option value="minMaxScaling">Min-Max Scaling</option>
      </select>

      <label htmlFor="selectedVariable">Select Variable:</label>
      <select
        id="selectedVariable"
        value={selectedVariable}
        onChange={(e) => setSelectedVariable(e.target.value)}
      >
        <option value="" disabled hidden>
          Select a variable
        </option>
        {variableOptions.map((variable, index) => (
          <option key={index} value={variable}>
            {variable}
          </option>
        ))}
      </select>

      <div className="button-container">
        <button onClick={submitData}>Submit</button>
        <button onClick={resetForm}>Reset</button>
      </div>
    </div>
  );
};

export default DataProcessingApp;

