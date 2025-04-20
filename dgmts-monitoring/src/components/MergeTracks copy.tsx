import React, { useState, ChangeEvent } from 'react';
import * as XLSX from 'xlsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HeaNavLogo from './HeaNavLogo';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ExcelRow {
  [key: string]: string | number | null;
}

interface LoadingState {
  file1: boolean;
  file2: boolean;
  diffFileA: boolean;
  diffFileB: boolean;
  finalFile: boolean;
}

interface ErrorState {
  file1: string | null;
  file2: string | null;
  diffFileA: string | null;
  diffFileB: string | null;
  finalFile: string | null;
}

const TrackMerger: React.FC = () => {
  const [data1, setData1] = useState<ExcelRow[]>([]);
  const [headers1, setHeaders1] = useState<string[]>([]);
  const [data2, setData2] = useState<ExcelRow[]>([]);
  const [headers2, setHeaders2] = useState<string[]>([]);
  const [diffDataA, setDiffDataA] = useState<ExcelRow[]>([]);
  const [diffDataB, setDiffDataB] = useState<ExcelRow[]>([]);
  const [finalData, setFinalData] = useState<ExcelRow[]>([]);
  const [loading, setLoading] = useState<LoadingState>({ file1: false, file2: false, diffFileA: false, diffFileB: false, finalFile: false });
  const [error, setError] = useState<ErrorState>({ file1: null, file2: null, diffFileA: null, diffFileB: null, finalFile: null });

  const handleFileUpload = (fileNumber: number) => (event: ChangeEvent<HTMLInputElement>) => {
    const key = fileNumber === 1 ? 'file1' : 'file2';
    setLoading((prev) => ({ ...prev, [key]: true }));
    setError((prev) => ({ ...prev, [key]: null }));

    const file = event.target.files?.[0];
    if (!file) {
      setLoading((prev) => ({ ...prev, [key]: false }));
      toast.error('No file selected!', { position: 'top-right', autoClose: 3000 });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const arrayBuffer = e.target?.result;
        if (!arrayBuffer) throw new Error('File read error');
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet, { defval: null, blankrows: true });

        if (!jsonData || jsonData.length === 0) {
          throw new Error('Empty or invalid Excel file');
        }

        const processedData = processData(jsonData);
        const headers = Object.keys(processedData[0]).slice(0, 4);

        if (fileNumber === 1) {
          setHeaders1(headers);
          setData1(processedData);
        } else {
          setHeaders2(headers);
          setData2(processedData);
        }
      } catch (err: unknown) {
        setError((prev) => ({
          ...prev,
          [key]: 'Error processing Excel file: ' + (err instanceof Error ? err.message : 'Unknown error'),
        }));
        toast.error('Error processing file!', { position: 'top-right', autoClose: 3000 });
      }
      setLoading((prev) => ({ ...prev, [key]: false }));
    };

    reader.onerror = () => {
      setError((prev) => ({ ...prev, [key]: 'Error reading Excel file' }));
      setLoading((prev) => ({ ...prev, [key]: false }));
      toast.error('Error reading file!', { position: 'top-right', autoClose: 3000 });
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDifferenceFileUpload = (fileType: 'A' | 'B') => (event: ChangeEvent<HTMLInputElement>) => {
    const key = fileType === 'A' ? 'diffFileA' : 'diffFileB';
    setLoading((prev) => ({ ...prev, [key]: true }));
    setError((prev) => ({ ...prev, [key]: null }));

    const file = event.target.files?.[0];
    if (!file) {
      setLoading((prev) => ({ ...prev, [key]: false }));
      toast.error('No file selected!', { position: 'top-right', autoClose: 3000 });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const arrayBuffer = e.target?.result;
        if (!arrayBuffer) throw new Error('File read error');
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet, { defval: null, blankrows: true });

        if (!jsonData || jsonData.length === 0) {
          throw new Error('Empty or invalid Excel file');
        }

        const requiredColumn = fileType === 'A' ? 'LBN-TP-TK2-01A - Height' : 'LBN-TP-TK3-15A - Height';
        if (!Object.keys(jsonData[0]).includes(requiredColumn)) {
          throw new Error(`Missing required column: ${requiredColumn}`);
        }

        if (fileType === 'A') {
          setDiffDataA(jsonData);
        } else {
          setDiffDataB(jsonData);
        }
      } catch (err: unknown) {
        setError((prev) => ({
          ...prev,
          [key]: 'Error processing Excel file: ' + (err instanceof Error ? err.message : 'Unknown error'),
        }));
        toast.error('Error processing file!', { position: 'top-right', autoClose: 3000 });
      }
      setLoading((prev) => ({ ...prev, [key]: false }));
    };

    reader.onerror = () => {
      setError((prev) => ({ ...prev, [key]: 'Error reading Excel file' }));
      setLoading((prev) => ({ ...prev, [key]: false }));
      toast.error('Error reading file!', { position: 'top-right', autoClose: 3000 });
    };

    reader.readAsArrayBuffer(file);
  };

  const handleFinalFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    setLoading((prev) => ({ ...prev, finalFile: true }));
    setError((prev) => ({ ...prev, finalFile: null }));

    const file = event.target.files?.[0];
    if (!file) {
      setLoading((prev) => ({ ...prev, finalFile: false }));
      toast.error('No file selected!', { position: 'top-right', autoClose: 3000 });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const arrayBuffer = e.target?.result;
        if (!arrayBuffer) throw new Error('File read error');
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet, { defval: null, blankrows: true });

        if (!jsonData || jsonData.length === 0) {
          throw new Error('Empty or invalid Excel file');
        }

        if (!Object.keys(jsonData[0]).includes('Final Height')) {
          throw new Error('Missing required column: Final Height');
        }

        setFinalData(jsonData);
        toast.success('Line graph generated successfully!', { position: 'top-right', autoClose: 3000 });
      } catch (err: unknown) {
        setError((prev) => ({
          ...prev,
          finalFile: 'Error processing Excel file: ' + (err instanceof Error ? err.message : 'Unknown error'),
        }));
        toast.error('Error processing file!', { position: 'top-right', autoClose: 3000 });
      }
      setLoading((prev) => ({ ...prev, finalFile: false }));
    };

    reader.onerror = () => {
      setError((prev) => ({ ...prev, finalFile: 'Error reading Excel file' }));
      setLoading((prev) => ({ ...prev, finalFile: false }));
      toast.error('Error reading file!', { position: 'top-right', autoClose: 3000 });
    };

    reader.readAsArrayBuffer(file);
  };

  const processData = (inputData: ExcelRow[]): ExcelRow[] => {
    if (!inputData || inputData.length === 0) return [];
    const rowCount = inputData.length;
    const columns = Object.keys(inputData[0]);

    const columnValues: { [key: string]: (string | number | null)[] } = {};
    columns.forEach((col) => {
      columnValues[col] = inputData
        .map((row) => row[col])
        .filter((val) => val != null && val !== '' && (typeof val === 'number' || !isNaN(Number(val))));
    });

    const processedData: ExcelRow[] = Array.from({ length: rowCount }, () => ({}));

    columns.forEach((col) => {
      if (col === 'Time' || col === 'Date') {
        inputData.forEach((row, index) => {
          const originalValue = row[col];
          processedData[index][col] = convertExcelDateTime(originalValue);
        });
      } else {
        const values = columnValues[col];
        for (let i = 0; i < rowCount; i++) {
          processedData[i][col] = i < values.length ? values[i] : null;
        }
      }
    });

    return processedData;
  };

  const convertExcelDateTime = (serial: string | number | null): string | null => {
    if (typeof serial !== 'number') return serial as string | null;
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const milliseconds = serial * 24 * 60 * 60 * 1000;
    const resultDate = new Date(excelEpoch.getTime() + milliseconds);

    const yyyy = resultDate.getUTCFullYear();
    const mm = (resultDate.getUTCMonth() + 1).toString().padStart(2, '0');
    const dd = resultDate.getUTCDate().toString().padStart(2, '0');
    const hh = resultDate.getUTCHours().toString().padStart(2, '0');
    const min = resultDate.getUTCMinutes().toString().padStart(2, '0');
    const sec = resultDate.getUTCSeconds().toString().padStart(2, '0');

    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${sec}`;
  };

  const downloadExcel = () => {
    const wb = XLSX.utils.book_new();
    if (data1.length > 0) {
      const ws1 = XLSX.utils.json_to_sheet(data1);
      XLSX.utils.book_append_sheet(wb, ws1, 'File 1 Processed');
    }
    if (data2.length > 0) {
      const ws2 = XLSX.utils.json_to_sheet(data2);
      XLSX.utils.book_append_sheet(wb, ws2, 'File 2 Processed');
    }
    XLSX.writeFile(wb, 'cleaned_data_combined.xlsx');
    toast.success('Combined file downloaded successfully!', { position: 'top-right', autoClose: 3000 });
  };

  const downloadSingleFile = (data: ExcelRow[], sheetName: string, fileName: string) => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, fileName);
    toast.success(`${fileName} downloaded successfully!`, { position: 'top-right', autoClose: 3000 });
  };

  const calculateAndDownloadDifference = () => {
    if (diffDataA.length === 0 || diffDataB.length === 0) {
      setError((prev) => ({
        ...prev,
        diffFileA: diffDataA.length === 0 ? 'File A is required' : prev.diffFileA,
        diffFileB: diffDataB.length === 0 ? 'File B is required' : prev.diffFileB,
      }));
      toast.error('Both File A and File B are required!', { position: 'top-right', autoClose: 3000 });
      return;
    }

    const columnA = 'LBN-TP-TK2-01A - Height';
    const columnB = 'LBN-TP-TK3-15A - Height';
    const minRows = Math.min(diffDataA.length, diffDataB.length);
    const finalHeights: ExcelRow[] = [];

    for (let i = 0; i < minRows; i++) {
      const heightA = typeof diffDataA[i][columnA] === 'number' ? diffDataA[i][columnA] as number : 0;
      const heightB = typeof diffDataB[i][columnB] === 'number' ? diffDataB[i][columnB] as number : 0;
      finalHeights.push({ 'Final Height': heightA - heightB });
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(finalHeights);
    XLSX.utils.book_append_sheet(wb, ws, 'Height Difference');
    XLSX.writeFile(wb, 'height_difference.xlsx');
    toast.success('Height difference file downloaded successfully!', { position: 'top-right', autoClose: 3000 });
  };

  // Styles
  const containerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '40px auto',
    padding: '30px',
    background: 'linear-gradient(135deg, #ffffff, #f5f7fa)',
    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
    borderRadius: '15px',
    fontFamily: "'Segoe UI', Arial, sans-serif",
  };

  const headingStyle: React.CSSProperties = {
    fontSize: '28px',
    marginBottom: '30px',
    fontWeight: 700,
    color: '#1a3c61',
    textAlign: 'center',
    textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
  };

  const subHeadingStyle: React.CSSProperties = {
    fontSize: '22px',
    margin: '20px 0',
    fontWeight: 600,
    color: '#2c5282',
  };

  const inputStyle: React.CSSProperties = {
    padding: '12px',
    margin: '10px 0',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '16px',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s ease',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '12px 24px',
    margin: '10px 10px 20px 0',
    background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 600,
    transition: 'transform 0.2s, box-shadow 0.2s',
  };

  const tableStyles: React.CSSProperties = {
    borderCollapse: 'collapse',
    width: '100%',
    fontFamily: "'Segoe UI', Arial, sans-serif",
    borderRadius: '10px',
    overflow: 'hidden',
    marginBottom: '20px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
  };

  const thStyle: React.CSSProperties = {
    background: 'linear-gradient(45deg, #edf2f7, #e2e8f0)',
    color: '#2d3748',
    padding: '14px',
    border: '1px solid #e2e8f0',
    fontWeight: 600,
    textAlign: 'left',
    fontSize: '16px',
  };

  const tdStyle: React.CSSProperties = {
    padding: '14px',
    border: '1px solid #e2e8f0',
    color: '#4a5568',
    fontSize: '15px',
  };

  const alternateRowStyle = (index: number): React.CSSProperties => ({
    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f7fafc',
  });

  const sectionStyle: React.CSSProperties = {
    marginTop: '40px',
    padding: '20px',
    background: '#fff',
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
    border: '1px solid black' // Corrected this line
  };
  

  const chartStyle: React.CSSProperties = {
    maxWidth: '100%',
    marginTop: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    padding: '20px',
    background: '#fff',
  };

  return (
    <>
      <HeaNavLogo />
      <div style={containerStyle}>
        <h1 style={headingStyle}>Track Merger & Height Visualizer</h1>
        <ToastContainer />

        <div style={sectionStyle}>
          <h2 style={subHeadingStyle}>Upload Raw Excel Files</h2>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload(1)}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = '#4CAF50')}
            onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
          />
          {error.file1 && <p style={{ color: '#e53e3e', margin: '10px 0' }}>{error.file1}</p>}
          {loading.file1 && <p style={{ color: '#4a5568', margin: '10px 0' }}>Loading file 1...</p>}

          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload(2)}
            style={{ ...inputStyle, marginTop: '20px' }}
            onFocus={(e) => (e.target.style.borderColor = '#4CAF50')}
            onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
          />
          {error.file2 && <p style={{ color: '#e53e3e', margin: '10px 0' }}>{error.file2}</p>}
          {loading.file2 && <p style={{ color: '#4a5568', margin: '10px 0' }}>Loading file 2...</p>}

          {data1.length > 0 && (
            <div>
              <h3 style={{ ...subHeadingStyle, fontSize: '20px' }}>File 1 Preview</h3>
              <table style={tableStyles}>
                <thead>
                  <tr>
                    {headers1.map((header) => (
                      <th key={header} style={thStyle}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data1.slice(0, 10).map((row, index) => (
                    <tr key={index} style={alternateRowStyle(index)}>
                      {headers1.map((header) => (
                        <td key={header} style={tdStyle}>
                          {row[header] != null ? row[header] : '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                style={{ ...buttonStyle, background: 'linear-gradient(45deg, #1e88e5, #4dabf7)' }}
                onClick={() => downloadSingleFile(data1, 'File 1 Processed', 'file1_processed.xlsx')}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Download File 1 Only
              </button>
            </div>
          )}

          {data2.length > 0 && (
            <div>
              <h3 style={{ ...subHeadingStyle, fontSize: '20px' }}>File 2 Preview</h3>
              <table style={tableStyles}>
                <thead>
                  <tr>
                    {headers2.map((header) => (
                      <th key={header} style={thStyle}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data2.slice(0, 10).map((row, index) => (
                    <tr key={index} style={alternateRowStyle(index)}>
                      {headers2.map((header) => (
                        <td key={header} style={tdStyle}>
                          {row[header] != null ? row[header] : '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                style={{ ...buttonStyle, background: 'linear-gradient(45deg, #1e88e5, #4dabf7)' }}
                onClick={() => downloadSingleFile(data2, 'File 2 Processed', 'file2_processed.xlsx')}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Download File 2 Only
              </button>
            </div>
          )}

          {(data1.length > 0 || data2.length > 0) && (
            <button
              style={buttonStyle}
              onClick={downloadExcel}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Download Combined File
            </button>
          )}
        </div>

        <div style={sectionStyle}>
          <h2 style={subHeadingStyle}>Calculate Height Difference</h2>
          <p style={{ color: '#4a5568', marginBottom: '20px' }}>
            Upload gap-removed Excel files to calculate the difference between File A and File B.
          </p>

          <h3 style={{ ...subHeadingStyle, fontSize: '20px' }}>File A</h3>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleDifferenceFileUpload('A')}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = '#4CAF50')}
            onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
          />
          {error.diffFileA && <p style={{ color: '#e53e3e', margin: '10px 0' }}>{error.diffFileA}</p>}
          {loading.diffFileA && <p style={{ color: '#4a5568', margin: '10px 0' }}>Loading File A...</p>}

          <h3 style={{ ...subHeadingStyle, fontSize: '20px' }}>File B</h3>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleDifferenceFileUpload('B')}
            style={{ ...inputStyle, marginTop: '20px' }}
            onFocus={(e) => (e.target.style.borderColor = '#4CAF50')}
            onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
          />
          {error.diffFileB && <p style={{ color: '#e53e3e', margin: '10px 0' }}>{error.diffFileB}</p>}
          {loading.diffFileB && <p style={{ color: '#4a5568', margin: '10px 0' }}>Loading File B...</p>}

          {(diffDataA.length > 0 || diffDataB.length > 0) && (
            <button
              style={{ ...buttonStyle, background: 'linear-gradient(45deg, #ff9800, #ffb74d)' }}
              onClick={calculateAndDownloadDifference}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Calculate and Download Height Difference
            </button>
          )}
        </div>

        <div style={sectionStyle}>
          <h2 style={subHeadingStyle}>Visualize Height Difference</h2>
          <p style={{ color: '#4a5568', marginBottom: '20px' }}>
            Upload the final height difference Excel file to generate a line graph of the Final Height values.
          </p>

          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFinalFileUpload}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = '#4CAF50')}
            onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
          />
          {error.finalFile && <p style={{ color: '#e53e3e', margin: '10px 0' }}>{error.finalFile}</p>}
          {loading.finalFile && <p style={{ color: '#4a5568', margin: '10px 0' }}>Loading final file...</p>}

          {finalData.length > 0 && (
            <div style={chartStyle}>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={finalData.map((row, index) => ({
                    index: index + 1,
                    finalHeight: typeof row['Final Height'] === 'number' ? row['Final Height'] : 0,
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid stroke="#e0e0e0" />
                  <XAxis
                    dataKey="index"
                    label={{ value: 'Row Index', position: 'bottom', offset: 0, fill: '#333', fontSize: 14 }}
                    stroke="#333"
                  />
                  <YAxis
                    label={{ value: 'Final Height', angle: -90, position: 'insideLeft', fill: '#333', fontSize: 14 }}
                    stroke="#333"
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#333', color: '#fff' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Line
                    type="monotone"
                    dataKey="finalHeight"
                    name="Final Height Difference"
                    stroke="#2196f3"
                    strokeWidth={2}
                    dot={{ stroke: '#fff', strokeWidth: 2, fill: '#2196f3' }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TrackMerger;