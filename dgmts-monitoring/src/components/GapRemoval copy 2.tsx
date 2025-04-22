// import React, { useState } from "react";
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";
// import HeaNavLogo from "./HeaNavLogo";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
// } from "recharts";
// import * as htmlToImage from "html-to-image";
// import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

// const GapRemoval: React.FC = () => {
//   const [gColumnData, setGColumnData] = useState<Record<string, { index: number; value: number }[]>>({
//     "Height Difference": [],
//     "Northing Difference": [],
//     "Easting Difference": [],
//   });
//   const [selectedColumn, setSelectedColumn] = useState<string>("");  // Set default to empty string
//   const [secondSelectedColumn, setSecondSelectedColumn] = useState<string>("");
//   const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
//   const [showGraph, setShowGraph] = useState(false);
//   const [graphData, setGraphData] = useState<{ index: number; value: number }[]>([]);
//   const [columnNames, setColumnNames] = useState<string[]>([]); // To store all column names

//   const handleProcess = () => {
//     const fileData = localStorage.getItem("mergedExcelFile");
//     if (!fileData) return;

//     const byteCharacters = atob(fileData);
//     const byteNumbers = new Array(byteCharacters.length)
//       .fill(null)
//       .map((_, i) => byteCharacters.charCodeAt(i));
//     const byteArray = new Uint8Array(byteNumbers);

//     const workbook = XLSX.read(byteArray, { type: "array" });
//     const worksheet = workbook.Sheets[workbook.SheetNames[0]];
//     const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as (string | number)[][];

//     if (jsonData.length === 0) return;

//     const headers = jsonData[0];
//     const result: (string | number)[][] = [];
//     const graphColumnData: Record<string, { index: number; value: number }[]> = {};

//     // Populate graph column data based on header columns
//     for (let i = 1; i < headers.length; i++) {
//       graphColumnData[headers[i] as string] = [];
//     }

//     for (let i = 1; i < jsonData.length; i++) {
//       const row = jsonData[i];
//       const newRow: (string | number)[] = [row[0]];

//       for (let j = 1; j < headers.length; j++) {
//         const val1 = row[j];
//         newRow.push(val1 ?? "");
//         if (val1 !== undefined && !isNaN(Number(val1))) {
//           graphColumnData[headers[j] as string].push({ index: i, value: Number(val1) });
//         }
//       }

//       result.push(newRow);
//     }

//     setColumnNames(headers.slice(1)); // Populate column names for the dropdown
//     setGColumnData(graphColumnData);

//     const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(result);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Processed");
//     const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array", cellStyles: true });
//     const blob = new Blob([wbout], { type: "application/octet-stream" });
//     setProcessedBlob(blob);

//     setShowGraph(true);
//   };

//   const handleDownload = () => {
//     if (processedBlob) {
//       saveAs(processedBlob, "difference_output.xlsx");
//     }
//   };

//   const handleDownloadGraph = () => {
//     const node = document.getElementById("chartContainer");
//     if (node) {
//       htmlToImage.toPng(node).then((dataUrl) => {
//         const link = document.createElement("a");
//         link.download = `${selectedColumn}_${secondSelectedColumn}.png`;
//         link.href = dataUrl;
//         link.click();
//       });
//     }
//   };

//   const handleGraphSelection = () => {
//     const selectedData1 = gColumnData[selectedColumn] || [];
//     const selectedData2 = secondSelectedColumn ? gColumnData[secondSelectedColumn] || [] : [];

//     let combinedData: { index: number; value1: number; value2?: number }[] = [];

//     // If second column is selected, combine both columns
//     if (secondSelectedColumn) {
//       combinedData = selectedData1.map((data, index) => ({
//         index: data.index,
//         value1: data.value,
//         value2: selectedData2[index] ? selectedData2[index].value : 0,
//       }));
//     } else {
//       // If only one column is selected, just display that column
//       combinedData = selectedData1.map((data) => ({
//         index: data.index,
//         value1: data.value,
//       }));
//     }

//     setGraphData(combinedData);
//   };

//   return (
//     <>
//       <HeaNavLogo />
//       <div className="p-4 flex flex-col gap-4">
//         <button
//           onClick={handleProcess}
//           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//         >
//           Process & Show Graph
//         </button>

//         {processedBlob && (
//           <button
//             onClick={handleDownload}
//             className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
//           >
//             Download Final File
//           </button>
//         )}

//         {showGraph && (
//           <div className="p-4">
//             <label className="mr-2 font-medium">Select First Column:</label>
//             <select
//               value={selectedColumn}
//               onChange={(e) => setSelectedColumn(e.target.value)}
//               className="border rounded p-2"
//             >
//               <option value="">-- Select Column --</option>
//               {columnNames.map((colName, idx) => (
//                 <option key={idx} value={colName}>
//                   {colName}
//                 </option>
//               ))}
//             </select>

//             <label className="mr-2 font-medium mt-2">Select Second Column (Optional):</label>
//             <select
//               value={secondSelectedColumn}
//               onChange={(e) => setSecondSelectedColumn(e.target.value)}
//               className="border rounded p-2"
//             >
//               <option value="">None</option>
//               {columnNames.map((colName, idx) => (
//                 <option key={idx} value={colName}>
//                   {colName}
//                 </option>
//               ))}
//             </select>

//             <button
//               onClick={handleGraphSelection}
//               className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//             >
//               Generate Graph
//             </button>

//             <div id="chartContainer" className="mt-4">
//               <h2 className="text-lg font-semibold mb-2">
//                 {selectedColumn && secondSelectedColumn
//                   ? `${selectedColumn} vs ${secondSelectedColumn} Chart`
//                   : "Custom Graph"}
//               </h2>
//               <TransformWrapper initialScale={1} initialPositionX={0} initialPositionY={0}>
//                 <TransformComponent>
//                   <LineChart width={600} height={300} data={graphData}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="index" />
//                     <YAxis domain={['auto', 'auto']} />
//                     <Tooltip />
//                     <Legend />
//                     <Line type="monotone" dataKey="value1" stroke="#8884d8" dot={false} />
//                     {secondSelectedColumn && (
//                       <Line type="monotone" dataKey="value2" stroke="#82ca9d" dot={false} />
//                     )}
//                   </LineChart>
//                 </TransformComponent>
//               </TransformWrapper>
//             </div>

//             <button
//               className="mt-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
//               onClick={handleDownloadGraph}
//             >
//               Download Chart Image
//             </button>
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// export default GapRemoval;
