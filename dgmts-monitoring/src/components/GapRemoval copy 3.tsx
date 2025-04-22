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
//   const [selectedColumn, setSelectedColumn] = useState<string>("Height Difference");
//   const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
//   const [showGraph, setShowGraph] = useState(false);
//   const [graphData, setGraphData] = useState<{ index: number; value: number }[]>([]);

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
//     const graphColumnData: Record<string, { index: number; value: number }[]> = {
//       "Height Difference": [],
//       "Northing Difference": [],
//       "Easting Difference": [],
//     };

//     for (let i = 1; i < jsonData.length; i++) {
//       const row = jsonData[i];
//       const newRow: (string | number)[] = [row[0]];

//       for (let j = 1; j < headers.length; j += 2) {
//         const val1 = row[j];
//         const val2 = row[j + 1];
//         newRow.push(val1 ?? "", val2 ?? "");

//         if (
//           val1 !== undefined &&
//           val2 !== undefined &&
//           !isNaN(Number(val1)) &&
//           !isNaN(Number(val2))
//         ) {
//           const diff = Number(val1) - Number(val2);
//           newRow.push(diff);

//           // Store for graph data
//           if (typeof headers[j] === "string" && typeof headers[j + 1] === "string") {
//             const label = headers[j].toLowerCase().includes("height")
//               ? "Height Difference"
//               : headers[j].toLowerCase().includes("northing")
//               ? "Northing Difference"
//               : headers[j].toLowerCase().includes("easting")
//               ? "Easting Difference"
//               : "Other Difference";

//             if (label in graphColumnData) {
//               graphColumnData[label].push({ index: i, value: diff });
//             }
//           }
//         } else {
//           newRow.push("");
//         }
//       }

//       result.push(newRow);
//     }

//     const newHeader: (string | number)[] = [headers[0]];
//     for (let j = 1; j < headers.length; j += 2) {
//       const h1 = headers[j] ?? `Col${j}`;
//       const h2 = headers[j + 1] ?? `Col${j + 1}`;

//       let label = "Difference";
//       if (
//         typeof h1 === "string" &&
//         typeof h2 === "string"
//       ) {
//         if (h1.toLowerCase().includes("easting") || h2.toLowerCase().includes("easting")) {
//           label = "Easting Difference";
//         } else if (h1.toLowerCase().includes("northing") || h2.toLowerCase().includes("northing")) {
//           label = "Northing Difference";
//         } else if (h1.toLowerCase().includes("height") || h2.toLowerCase().includes("height")) {
//           label = "Height Difference";
//         }
//       }

//       newHeader.push(h1, h2, label);
//     }

//     result.unshift(newHeader);

//     const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(result);

//     for (let c = 3; c < newHeader.length; c += 3) {
//       for (let r = 0; r < result.length; r++) {
//         const cellAddress = XLSX.utils.encode_cell({ r, c });
//         const cell = ws[cellAddress];
//         if (cell) {
//           if (!cell.s) cell.s = {};
//         }
//       }
//     }

//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Processed");

//     const wbout = XLSX.write(wb, {
//       bookType: "xlsx",
//       type: "array",
//       cellStyles: true,
//     });

//     const blob = new Blob([wbout], { type: "application/octet-stream" });
//     setProcessedBlob(blob);

//     setGColumnData(graphColumnData);
//     setGraphData(graphColumnData[selectedColumn] || []);
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
//         link.download = `${selectedColumn}.png`;
//         link.href = dataUrl;
//         link.click();
//       });
//     }
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
//             <label className="mr-2 font-medium">Select Difference Type:</label>
//             <select
//               value={selectedColumn}
//               onChange={(e) => {
//                 setSelectedColumn(e.target.value);
//                 setGraphData(gColumnData[e.target.value] || []);
//               }}
//               className="border rounded p-2"
//             >
//               <option value="Height Difference">Height Difference</option>
//               <option value="Northing Difference">Northing Difference</option>
//               <option value="Easting Difference">Easting Difference</option>
//             </select>

//             <div id="chartContainer">
//               <h2 className="text-lg font-semibold mb-2">{selectedColumn} Chart</h2>
//               <TransformWrapper
//                 initialScale={1}
//                 initialPositionX={0}
//                 initialPositionY={0}
//               >
//                 <TransformComponent>
//                   <LineChart width={600} height={300} data={graphData}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="index" />
//                     <YAxis domain={['auto', 'auto']} />
//                     <Tooltip />
//                     <Legend />
//                     <Line type="monotone" dataKey="value" stroke="#8884d8" dot={false} />
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
