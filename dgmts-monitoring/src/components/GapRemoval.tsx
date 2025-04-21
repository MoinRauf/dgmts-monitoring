import React, { useState } from "react";
// import * as XLSX from "xlsx-js-style";
import * as XLSX from "xlsx-js-style";

import { saveAs } from "file-saver";
import HeaNavLogo from "./HeaNavLogo";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const GapRemoval: React.FC = () => {
  const [chartData, setChartData] = useState<{ time: string; value: number }[]>([]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "buffer" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as (string | number)[][];

    if (jsonData.length === 0) return;

    const headers = jsonData[0];
    const result: (string | number)[][] = [];
    const chartPoints: { time: string; value: number }[] = [];

    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      const newRow: (string | number)[] = [row[0]];
      let lastDifference = 0;

      for (let j = 1; j < headers.length; j += 2) {
        const val1 = row[j];
        const val2 = row[j + 1];
        newRow.push(val1 ?? "", val2 ?? "");

        if (
          val1 !== undefined &&
          val2 !== undefined &&
          !isNaN(Number(val1)) &&
          !isNaN(Number(val2))
        ) {
          const diff = Number(val1) - Number(val2);
          newRow.push(diff);
          lastDifference = diff;
        } else {
          newRow.push("");
        }
      }

      // Push chart data from final difference value
      chartPoints.push({
        time: String(row[0]),
        value: lastDifference,
      });

      result.push(newRow);
    }

    const newHeader: (string | number)[] = [headers[0]];
    for (let j = 1; j < headers.length; j += 2) {
      const h1 = headers[j] ?? `Col${j}`;
      const h2 = headers[j + 1] ?? `Col${j + 1}`;
      newHeader.push(h1, h2, "Difference");
    }

    result.unshift(newHeader);

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(result);

    const yellowFillStyle: XLSX.CellStyle = {
      fill: {
        fgColor: { rgb: "FFFF00" },
        patternType: "solid",
      },
    };

    for (let c = 3; c < newHeader.length; c += 3) {
      for (let r = 0; r < result.length; r++) {
        const cellAddress = XLSX.utils.encode_cell({ r, c });
        const cell = ws[cellAddress];
        if (cell) {
          if (!cell.s) cell.s = {};
          cell.s = yellowFillStyle;
        }
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Processed");

    const wbout = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
      cellStyles: true,
    });

    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, "difference_output.xlsx");

    setChartData(chartPoints);
  };

  return (
    <>
      <HeaNavLogo />
      <div style={{ padding: "20px", fontFamily: "Arial" }}>
        <h2 style={{ marginBottom: "10px" }}>Upload Excel File</h2>
        <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      </div>

      {chartData.length > 0 && (
        <div style={{ padding: "20px" }}>
          <h3 style={{ marginBottom: "10px" }}>Final Difference Trend</h3>
          <div style={{ width: "100%", height: 300, background: "#f9f9f9", borderRadius: 8, padding: 10 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </>
  );
};

export default GapRemoval;
