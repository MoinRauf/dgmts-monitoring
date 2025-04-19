// import React, { useState } from 'react';
// import * as XLSX from 'xlsx';
// import HeaNavLogo from './HeaNavLogo';

// const TrackMerger = () => {
//   const [data1, setData1] = useState([]);
//   const [headers1, setHeaders1] = useState([]);
//   const [data2, setData2] = useState([]);
//   const [headers2, setHeaders2] = useState([]);
//   const [loading, setLoading] = useState({ file1: false, file2: false });
//   const [error, setError] = useState({ file1: null, file2: null });

//   const handleFileUpload = (fileNumber) => (event) => {
//     const key = fileNumber === 1 ? 'file1' : 'file2';
//     setLoading((prev) => ({ ...prev, [key]: true }));
//     setError((prev) => ({ ...prev, [key]: null }));
//     const file = event.target.files[0];
//     if (!file) {
//       setLoading((prev) => ({ ...prev, [key]: false }));
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = (e) => {
//       try {
//         const arrayBuffer = e.target.result;
//         const workbook = XLSX.read(arrayBuffer, { type: 'array' });
//         const sheetName = workbook.SheetNames[0];
//         const worksheet = workbook.Sheets[sheetName];
//         const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null, blankrows: true });
//         if (!jsonData || jsonData.length === 0) {
//           throw new Error('Empty or invalid Excel file');
//         }
//         const processedData = processData(jsonData);
//         const headers = Object.keys(processedData[0]).slice(0, 4); // Only first 4 headers
//         if (fileNumber === 1) {
//           setHeaders1(headers);
//           setData1(processedData);
//         } else {
//           setHeaders2(headers);
//           setData2(processedData);
//         }
//       } catch (err) {
//         setError((prev) => ({ ...prev, [key]: 'Error processing Excel file: ' + err.message }));
//       }
//       setLoading((prev) => ({ ...prev, [key]: false }));
//     };
//     reader.onerror = () => {
//       setError((prev) => ({ ...prev, [key]: 'Error reading Excel file' }));
//       setLoading((prev) => ({ ...prev, [key]: false }));
//     };
//     reader.readAsArrayBuffer(file);
//   };

//   const processData = (inputData) => {
//     if (!inputData || inputData.length === 0) return [];
//     const rowCount = inputData.length;
//     const columns = Object.keys(inputData[0]);

//     const columnValues = {};
//     columns.forEach((col) => {
//       columnValues[col] = inputData
//         .map((row) => row[col])
//         .filter((val) => val != null && val !== '' && !isNaN(val));
//     });

//     const processedData = Array(rowCount)
//       .fill()
//       .map(() => ({}));

//     columns.forEach((col) => {
//       if (col === 'Time') {
//         inputData.forEach((row, index) => {
//           processedData[index][col] = row[col];
//         });
//       } else {
//         const values = columnValues[col];
//         for (let i = 0; i < rowCount; i++) {
//           processedData[i][col] = i < values.length ? values[i] : null;
//         }
//       }
//     });

//     return processedData;
//   };

//   const downloadExcel = () => {
//     const wb = XLSX.utils.book_new();
//     if (data1.length > 0) {
//       const ws1 = XLSX.utils.json_to_sheet(data1);
//       XLSX.utils.book_append_sheet(wb, ws1, 'File 1 Processed');
//     }
//     if (data2.length > 0) {
//       const ws2 = XLSX.utils.json_to_sheet(data2);
//       XLSX.utils.book_append_sheet(wb, ws2, 'File 2 Processed');
//     }
//     XLSX.writeFile(wb, 'cleaned_data_combined.xlsx');
//   };

//   const downloadSingleFile = (data, sheetName, fileName) => {
//     const wb = XLSX.utils.book_new();
//     const ws = XLSX.utils.json_to_sheet(data);
//     XLSX.utils.book_append_sheet(wb, ws, sheetName);
//     XLSX.writeFile(wb, fileName);
//   };

//   const tableStyles = {
//     borderCollapse: 'collapse',
//     width: '100%',
//     fontFamily: 'Arial, sans-serif',
//     borderRadius: '8px',
//     overflow: 'hidden',
//     marginBottom: '20px',
//   };

//   const thStyle = {
//     backgroundColor: '#f8f9fa',
//     color: '#333',
//     padding: '10px',
//     border: '1px solid #ddd',
//     fontWeight: 'bold',
//     textAlign: 'left',
//   };

//   const tdStyle = {
//     padding: '10px',
//     border: '1px solid #ddd',
//     color: '#555',
//   };

//   const alternateRowStyle = (index) => ({
//     backgroundColor: index % 2 === 0 ? '#ffffff' : '#f2f2f2',
//   });

//   const containerStyle = {
//     maxWidth: '1000px',
//     margin: '40px auto',
//     padding: '20px',
//     backgroundColor: '#ffffff',
//     boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
//     borderRadius: '10px',
//   };

//   const buttonStyle = {
//     padding: '10px 20px',
//     margin: '10px 10px 20px 0',
//     backgroundColor: '#4CAF50',
//     color: 'white',
//     border: 'none',
//     borderRadius: '6px',
//     cursor: 'pointer',
//     fontWeight: 'bold',
//   };

//   const headingStyle = {
//     fontSize: '24px',
//     marginBottom: '20px',
//     fontWeight: 'bold',
//     color: '#333',
//   };

//   return (
//     <>
//     <HeaNavLogo/>
    
//     <div style={containerStyle}>
//       <h1 style={headingStyle}>Track Merger (Excel Gap Remover)</h1>

//       <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload(1)} />
//       {error.file1 && <p style={{ color: 'red' }}>{error.file1}</p>}
//       {loading.file1 && <p>Loading file 1...</p>}

//       <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload(2)} style={{ marginTop: '20px' }} />
//       {error.file2 && <p style={{ color: 'red' }}>{error.file2}</p>}
//       {loading.file2 && <p>Loading file 2...</p>}

//       {/* Table 1 */}
//       {data1.length > 0 && (
//         <div>
//           <h2>File 1 Preview</h2>
//           <table style={tableStyles}>
//             <thead>
//               <tr>
//                 {headers1.map((header) => (
//                   <th key={header} style={thStyle}>{header}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {data1.slice(0, 10).map((row, index) => (
//                 <tr key={index} style={alternateRowStyle(index)}>
//                   {headers1.map((header) => (
//                     <td key={header} style={tdStyle}>
//                       {row[header] != null ? row[header] : '-'}
//                     </td>
//                   ))}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//           <button
//             style={{ ...buttonStyle, backgroundColor: '#1e88e5' }}
//             onClick={() => downloadSingleFile(data1, 'File 1 Processed', 'file1_processed.xlsx')}
//           >
//             Download File 1 Only
//           </button>
//         </div>
//       )}

//       {/* Table 2 */}
//       {data2.length > 0 && (
//         <div>
//           <h2>File 2 Preview</h2>
//           <table style={tableStyles}>
//             <thead>
//               <tr>
//                 {headers2.map((header) => (
//                   <th key={header} style={thStyle}>{header}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {data2.slice(0, 10).map((row, index) => (
//                 <tr key={index} style={alternateRowStyle(index)}>
//                   {headers2.map((header) => (
//                     <td key={header} style={tdStyle}>
//                       {row[header] != null ? row[header] : '-'}
//                     </td>
//                   ))}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//           <button
//             style={{ ...buttonStyle, backgroundColor: '#1e88e5' }}
//             onClick={() => downloadSingleFile(data2, 'File 2 Processed', 'file2_processed.xlsx')}
//           >
//             Download File 2 Only
//           </button>
//         </div>
//       )}

//       {(data1.length > 0 || data2.length > 0) && (
//         <button style={buttonStyle} onClick={downloadExcel}>
//           Download Combined Excel File
//         </button>
//       )}
//     </div>
//     </>
//   );
// };

// export default TrackMerger;