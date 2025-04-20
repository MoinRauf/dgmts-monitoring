import React, { useState } from "react";
import * as XLSX from "xlsx";

const TrackMerger: React.FC = () => {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);

  const handleMerge = async () => {
    if (!fileA || !fileB) {
      alert("Please upload both files.");
      return;
    }

    const [dataA, dataB] = await Promise.all([readExcel(fileA), readExcel(fileB)]);

    const merged: any[][] = [];

    // ✅ Construct headers with proper names
    const headers: string[] = [];
    headers.push("TIME OF TKA");

    const totalCols = dataA[0].length;
    const prismCount = Math.floor((totalCols - 1) / 3); // Each prism has 3 columns

    for (let i = 0; i < prismCount; i++) {
      const prismNum = String(i + 1).padStart(2, "0");
      headers.push(`LBN-TP-TK2-${prismNum}A - Easting`);
      headers.push(`LBN-TP-TK2-${prismNum}B - Easting`);
      headers.push(`LBN-TP-TK2-${prismNum}A - Northing`);
      headers.push(`LBN-TP-TK2-${prismNum}B - Northing`);
      headers.push(`LBN-TP-TK2-${prismNum}A - Height`);
      headers.push(`LBN-TP-TK2-${prismNum}B - Height`);
    }

    merged.push(headers);

    const rowCount = Math.min(dataA.length, dataB.length);
    for (let i = 1; i < rowCount; i++) {
      const row: any[] = [];
      row.push(dataA[i][0]); // TIME from file A

      for (let j = 0; j < prismCount; j++) {
        const baseIdx = 1 + j * 3;

        const eastingA = dataA[i][baseIdx];
        const heightA = dataA[i][baseIdx + 1];
        const northingA = dataA[i][baseIdx + 2];

        const eastingB = dataB[i][baseIdx];
        const heightB = dataB[i][baseIdx + 1];
        const northingB = dataB[i][baseIdx + 2];

        row.push(eastingA);
        row.push(eastingB);
        row.push(northingA);
        row.push(northingB);
        row.push(heightA);
        row.push(heightB);
      }

      merged.push(row);
    }

    const ws = XLSX.utils.aoa_to_sheet(merged);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Merged");

    XLSX.writeFile(wb, "TK2_All_Prism_Rearranged_Merged.xlsx");
  };

  const readExcel = (file: File): Promise<any[][]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
        resolve(json);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Track Merger</h2>
      <div style={{ margin: "1rem 0" }}>
        <label>
          Upload TKA File (.xlsx):
          <input type="file" accept=".xlsx, .xls, .csv" onChange={(e) => setFileA(e.target.files?.[0] || null)} />
        </label>
      </div>
      <div style={{ margin: "1rem 0" }}>
        <label>
          Upload TKB File (.xlsx):
          <input type="file" accept=".xlsx, .xls, .csv" onChange={(e) => setFileB(e.target.files?.[0] || null)} />
        </label>
      </div>
      <button onClick={handleMerge} style={{ padding: "0.5rem 1rem", fontWeight: "bold" }}>
        Merge and Download
      </button>
    </div>
  );
};

export default TrackMerger;
