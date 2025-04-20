import React, { useState } from "react";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import HeaNavLogo from "./HeaNavLogo";
import { ToastContainer, toast } from "react-toastify";

const TrackMerger: React.FC = () => {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleMerge = async () => {
    if (!fileA || !fileB) {
      toast.error("No file selected!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const [dataA, dataB] = await Promise.all([
      readExcel(fileA),
      readExcel(fileB),
    ]);
    const merged: (string | number | null)[][] = [];

    const headers: string[] = [];
    headers.push("TIME");

    const totalCols = dataA[0].length;
    const prismCount = Math.floor((totalCols - 1) / 3);

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
      const row: (string | number | null)[] = [];

      const rawTime = dataA[i][0];
      const time = formatDateTime(rawTime);
      row.push(time);

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

  const parseExcelDate = (serial: number): Date => {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    return new Date(excelEpoch.getTime() + serial * 86400 * 1000);
  };

  const formatDateTime = (rawTime: unknown): string => {
    let dateObj: Date;

    if (typeof rawTime === "number") {
      dateObj = parseExcelDate(rawTime);
    } else if (typeof rawTime === "string") {
      const parsed = new Date(rawTime.replace(/-/g, "/"));
      if (!isNaN(parsed.getTime())) {
        dateObj = parsed;
      } else {
        return rawTime;
      }
    } else if (rawTime instanceof Date) {
      dateObj = rawTime;
    } else {
      return String(rawTime);
    }

    const startDate = new Date("2025-04-04T13:44:53");
    const diffInMinutes = dateObj.getMinutes() - startDate.getMinutes();
    const adjustedTime = new Date(startDate.getTime() + diffInMinutes * 60000);

    return adjustedTime.toLocaleString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const readExcel = (file: File): Promise<(string | number | null)[][]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result;
        if (!result) return reject("File read error: No result");

        const data = new Uint8Array(result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json<(string | number | null)[]>(
          sheet,
          {
            header: 1,
            defval: null,
          }
        );
        resolve(json);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  };

  return (
    <>
      <HeaNavLogo />
      <ToastContainer />
      <div
        style={{
          padding: "2rem",
          maxWidth: "600px",
          margin: "0 auto",
          fontFamily: "Segoe UI, sans-serif",
          backgroundColor: "#f9f9f9",
          borderRadius: "10px",
          boxShadow: "0 0 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h2
          style={{ textAlign: "center", marginBottom: "2rem", color: "#333" }}
        >
          Track Merger
        </h2>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Upload TKA File:
          </label>
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={(e) => setFileA(e.target.files?.[0] || null)}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Upload TKB File :
          </label>
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={(e) => setFileB(e.target.files?.[0] || null)}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <button
          onClick={handleMerge}
          style={{
            width: "100%",
            padding: "0.75rem",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontSize: "1rem",
            cursor: "pointer",
            marginBottom: "1rem",
          }}
        >
          Merge and Download
        </button>

        <button
          onClick={() => navigate("/GapRemoval")}
          style={{
            width: "100%",
            padding: "0.75rem",
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          Proceed to Gap Removal

        </button>
      </div>
    </>
  );
};

export default TrackMerger;
