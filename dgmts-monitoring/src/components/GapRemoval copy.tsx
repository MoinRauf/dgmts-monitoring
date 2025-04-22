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

// const GapRemoval: React.FC = () => {
//   const [gColumnData, setGColumnData] = useState<{ index: number; value: number }[]>([]);

//   const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const data = await file.arrayBuffer();
//     const workbook = XLSX.read(data, { type: "buffer" });
//     const worksheet = workbook.Sheets[workbook.SheetNames[0]];

//     const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as (string | number)[][];
//     if (jsonData.length === 0) return;

//     const headers = jsonData[0];
//     const result: (string | number)[][] = [];

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
//           newRow.push(Number(val1) - Number(val2));
//         } else {
//           newRow.push("");
//         }
//       }

//       result.push(newRow);
//     }

//     // Create new header
//     const newHeader: (string | number)[] = [headers[0]];
//     for (let j = 1; j < headers.length; j += 2) {
//       const h1 = headers[j] ?? `Col${j}`;
//       const h2 = headers[j + 1] ?? `Col${j + 1}`;
//       newHeader.push(h1, h2, "Difference");
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
//     saveAs(blob, "difference_output.xlsx");

//     // Extract column G (index 6) values
//     const columnG = jsonData
//       .slice(1)
//       .map((row, idx) => ({
//         index: idx + 1,
//         value: typeof row[6] === "number" ? row[6] : Number(row[6]),
//       }))
//       .filter((item) => !isNaN(item.value));

//     setGColumnData(columnG);
//   };

//   return (
//     <>
//       <HeaNavLogo />
//       <div className="p-4">
//         <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
//       </div>

//       {gColumnData.length > 0 && (
//         <div className="p-4">
//           <h2 className="text-lg font-semibold mb-2">Graph</h2>
//           <LineChart width={600} height={300} data={gColumnData}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="index" />
//             <YAxis />
//             <Tooltip />
//             <Legend />
//             <Line type="monotone" dataKey="value" stroke="#8884d8" />
//           </LineChart>
//         </div>
//       )}
//     </>
//   );
// };

// export default GapRemoval;
