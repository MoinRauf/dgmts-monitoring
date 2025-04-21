import React, { useState, ChangeEvent } from "react";
import * as XLSX from "xlsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HeaNavLogo from "./HeaNavLogo";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Brush } from "recharts";

interface ExcelRow {
  [key: string]: string | number | null;
}

interface LoadingState {
  file1: boolean;
  diffFile: boolean;
  graphFile: boolean;
}

interface ErrorState {
  file1: string | null;
  diffFile: string | null;
  graphFile: string | null;
}

// Define interface for diffPairs elements
interface DiffPair {
  easting: {
    colA: string;
    colB: string;
    name: string;
  };
  northing: {
    colA: string;
    colB: string;
    name: string;
  };
  height: {
    colA: string;
    colB: string;
    name: string;
  };
}

const GapRemoval: React.FC = () => {
  const [data1, setData1] = useState<ExcelRow[]>([]);
  const [headers1, setHeaders1] = useState<string[]>([]);
  const [diffData, setDiffData] = useState<ExcelRow[]>([]);
  const [diffHeaders, setDiffHeaders] = useState<string[]>([]);
  const [graphData, setGraphData] = useState<ExcelRow[]>([]);
  const [brushDomain] = useState<[string, string] | null>(null);  
  const [loading, setLoading] = useState<LoadingState>({
    file1: false,
    diffFile: false,
    graphFile: false,
  });
  const [error, setError] = useState<ErrorState>({
    file1: null,
    diffFile: null,
    graphFile: null,
  });

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    setLoading((prev) => ({ ...prev, file1: true }));
    setError((prev) => ({ ...prev, file1: null }));

    const file = event.target.files?.[0];
    if (!file) {
      setLoading((prev) => ({ ...prev, file1: false }));
      toast.error("No file selected!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const arrayBuffer = e.target?.result;
        if (!arrayBuffer) throw new Error("File read error");
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet, {
          defval: null,
          blankrows: true,
        });

        if (!jsonData || jsonData.length === 0) {
          throw new Error("Empty or invalid Excel file");
        }

        const processedData = processData(jsonData);
        const headers = Object.keys(processedData[0]);

        setHeaders1(headers);
        setData1(processedData);
      } catch (err: unknown) {
        setError((prev) => ({
          ...prev,
          file1:
            "Error processing Excel file: " +
            (err instanceof Error ? err.message : "Unknown error"),
        }));
        toast.error("Error processing file!", {
          position: "top-right",
          autoClose: 3000,
        });
      }
      setLoading((prev) => ({ ...prev, file1: false }));
    };

    reader.onerror = () => {
      setError((prev) => ({ ...prev, file1: "Error reading Excel file" }));
      setLoading((prev) => ({ ...prev, file1: false }));
      toast.error("Error reading file!", {
        position: "top-right",
        autoClose: 3000,
      });
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
        .filter(
          (val) =>
            val != null &&
            val !== "" &&
            (typeof val === "number" || !isNaN(Number(val)))
        );
    });

    const processedData: ExcelRow[] = Array.from(
      { length: rowCount },
      () => ({})
    );

    columns.forEach((col) => {
      if (col === "TIME" || col === "Date") {
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

  const convertExcelDateTime = (
    value: string | number | null
  ): string | null => {
    if (value == null || value === "") return null;

    if (typeof value === "string") {
      const trimmedValue = value.trim();
      const formats = [
        trimmedValue,
        trimmedValue.replace(/(\d{2})-(\d{2})-(\d{4})/, "$3-$2-$1"),
        trimmedValue.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1"),
        trimmedValue.replace(/(\d{4})\/(\d{2})\/(\d{2})/, "$1-$2-$3"),
        trimmedValue.replace(/(\d{2})\.(\d{2})\.(\d{4})/, "$3-$2-$1"),
      ];

      for (const format of formats) {
        const date = new Date(format);
        if (!isNaN(date.getTime())) {
          const yyyy = date.getUTCFullYear();
          const mm = (date.getUTCMonth() + 1).toString().padStart(2, "0");
          const dd = date.getUTCDate().toString().padStart(2, "0");
          const hh = date.getUTCHours().toString().padStart(2, "0");
          const min = date.getUTCMinutes().toString().padStart(2, "0");
          const sec = date.getUTCSeconds().toString().padStart(2, "0");
          return `${yyyy}-${mm}-${dd} ${hh}:${min}:${sec}`;
        }
      }
      return trimmedValue;
    }

    if (typeof value === "number") {
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      const milliseconds = value * 24 * 60 * 60 * 1000;
      const resultDate = new Date(excelEpoch.getTime() + milliseconds);

      const yyyy = resultDate.getUTCFullYear();
      const mm = (resultDate.getUTCMonth() + 1).toString().padStart(2, "0");
      const dd = resultDate.getUTCDate().toString().padStart(2, "0");
      const hh = resultDate.getUTCHours().toString().padStart(2, "0");
      const min = resultDate.getUTCMinutes().toString().padStart(2, "0");
      const sec = resultDate.getUTCSeconds().toString().padStart(2, "0");

      return `${yyyy}-${mm}-${dd} ${hh}:${min}:${sec}`;
    }

    return value as string | null;
  };

  const calculateDifferences = () => {
    if (data1.length === 0) {
      toast.error("Please upload a file first!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
  
    setLoading((prev) => ({ ...prev, diffFile: true }));
    setError((prev) => ({ ...prev, diffFile: null }));
  
    try {
      const differences: ExcelRow[] = [];
      const headers: string[] = ["TIME"];
      const columns = headers1;
  
      // Define difference calculations based on provided sequence with proper typing
      const diffPairs: DiffPair[] = [];
      let pairIndex = 1;
      for (let i = 1; i < columns.length; i += 6) {
        if (i + 5 < columns.length) {
          diffPairs.push({
            easting: {
              colA: columns[i],
              colB: columns[i + 1],
              name: `Final Easting-${pairIndex.toString().padStart(2, "0")}`,
            },
            northing: {
              colA: columns[i + 2],
              colB: columns[i + 3],
              name: `Final Northing-${pairIndex.toString().padStart(2, "0")}`,
            },
            height: {
              colA: columns[i + 4],
              colB: columns[i + 5],
              name: `Final Height-${pairIndex.toString().padStart(2, "0")}`,
            },
          });
          // Add headers: actual values for colA, colB and the computed difference for each measurement
          headers.push(
            `Easting A (${columns[i]})`,
            `Easting B (${columns[i + 1]})`,
            `Final Easting-${pairIndex.toString().padStart(2, "0")}`,
            `Northing A (${columns[i + 2]})`,
            `Northing B (${columns[i + 3]})`,
            `Final Northing-${pairIndex.toString().padStart(2, "0")}`,
            `Height A (${columns[i + 4]})`,
            `Height B (${columns[i + 5]})`,
            `Final Height-${pairIndex.toString().padStart(2, "0")}`
          );
          pairIndex++;
        }
      }
  
      // Calculate values and differences
      data1.forEach((row) => {
        const diffRow: ExcelRow = { TIME: row.TIME };
        diffPairs.forEach((pair) => {
          const eastingA = Number(row[pair.easting.colA]) || 0;
          const eastingB = Number(row[pair.easting.colB]) || 0;
          const northingA = Number(row[pair.northing.colA]) || 0;
          const northingB = Number(row[pair.northing.colB]) || 0;
          const heightA = Number(row[pair.height.colA]) || 0;
          const heightB = Number(row[pair.height.colB]) || 0;
  
          diffRow[`Easting A (${pair.easting.colA})`] = eastingA;
          diffRow[`Easting B (${pair.easting.colB})`] = eastingB;
          diffRow[pair.easting.name] = eastingA - eastingB;
  
          diffRow[`Northing A (${pair.northing.colA})`] = northingA;
          diffRow[`Northing B (${pair.northing.colB})`] = northingB;
          diffRow[pair.northing.name] = northingA - northingB;
  
          diffRow[`Height A (${pair.height.colA})`] = heightA;
          diffRow[`Height B (${pair.height.colB})`] = heightB;
          diffRow[pair.height.name] = heightA - heightB;
        });
        differences.push(diffRow);
      });
  
      setDiffHeaders(headers);
      setDiffData(differences);
      downloadSingleFile(differences, "Differences", "differences.xlsx");
    } catch (err: unknown) {
      setError((prev) => ({
        ...prev,
        diffFile:
          "Error calculating differences: " +
          (err instanceof Error ? err.message : "Unknown error"),
      }));
      toast.error("Error calculating differences!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
    setLoading((prev) => ({ ...prev, diffFile: false }));
  };

  const handleGraphFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    setLoading((prev) => ({ ...prev, graphFile: true }));
    setError((prev) => ({ ...prev, graphFile: null }));

    const file = event.target.files?.[0];
    if (!file) {
      setLoading((prev) => ({ ...prev, graphFile: false }));
      toast.error("No file selected for graph!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const arrayBuffer = e.target?.result;
        if (!arrayBuffer) throw new Error("File read error");
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet, {
          defval: null,
          blankrows: true,
        });

        if (!jsonData || jsonData.length === 0) {
          throw new Error("Empty or invalid Excel file");
        }

        setGraphData(jsonData);
      } catch (err: unknown) {
        setError((prev) => ({
          ...prev,
          graphFile:
            "Error processing graph file: " +
            (err instanceof Error ? err.message : "Unknown error"),
        }));
        toast.error("Error processing graph file!", {
          position: "top-right",
          autoClose: 3000,
        });
      }
      setLoading((prev) => ({ ...prev, graphFile: false }));
    };

    reader.onerror = () => {
      setError((prev) => ({ ...prev, graphFile: "Error reading graph file" }));
      setLoading((prev) => ({ ...prev, graphFile: false }));
      toast.error("Error reading graph file!", {
        position: "top-right",
        autoClose: 3000,
      });
    };

    reader.readAsArrayBuffer(file);
  };

  const downloadSingleFile = (
    data: ExcelRow[],
    sheetName: string,
    fileName: string
  ) => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, fileName);
    toast.success(`${fileName} downloaded successfully!`, {
      position: "top-right",
      autoClose: 3000,
    });
  };

  // Styles
  const containerStyle: React.CSSProperties = {
    maxWidth: "1200px",
    margin: "40px auto",
    padding: "30px",
    background: "linear-gradient(135deg, #ffffff, #f5f7fa)",
    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
    borderRadius: "15px",
    fontFamily: "'Segoe UI', Arial, sans-serif",
  };

  const headingStyle: React.CSSProperties = {
    fontSize: "28px",
    marginBottom: "30px",
    fontWeight: 700,
    color: "#1a3c61",
    textAlign: "center",
    textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
  };

  const subHeadingStyle: React.CSSProperties = {
    fontSize: "22px",
    margin: "20px 0",
    fontWeight: 600,
    color: "#2c5282",
  };

  const inputStyle: React.CSSProperties = {
    padding: "12px",
    margin: "10px 0",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "16px",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color 0.3s ease",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "12px 24px",
    margin: "10px 10px 20px 0",
    background: "linear-gradient(45deg, #4CAF50, #66BB6A)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: 600,
    transition: "transform 0.2s, box-shadow 0.2s",
  };

  const tableStyles: React.CSSProperties = {
    borderCollapse: "collapse",
    width: "100%",
    fontFamily: "'Segoe UI', Arial, sans-serif",
    borderRadius: "10px",
    overflow: "hidden",
    marginBottom: "20px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  };

  const thStyle: React.CSSProperties = {
    background: "linear-gradient(45deg, #edf2f7, #e2e8f0)",
    color: "#2d3748",
    padding: "14px",
    border: "1px solid #e2e8f0",
    fontWeight: 600,
    textAlign: "left",
    fontSize: "16px",
  };

  const tdStyle: React.CSSProperties = {
    padding: "14px",
    border: "1px solid #e2e8f0",
    color: "#4a5568",
    fontSize: "15px",
  };

  const alternateRowStyle = (index: number): React.CSSProperties => ({
    backgroundColor: index % 2 === 0 ? "#ffffff" : "#f7fafc",
  });

  const sectionStyle: React.CSSProperties = {
    marginTop: "40px",
    padding: "20px",
    background: "#fff",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
    border: "1px solid black",
  };

  // Limit table columns to 4
  const displayedHeaders1 = headers1.slice(0, 4);
  const displayedDiffHeaders = diffHeaders.slice(0, 4);

  return (
    <>
      <HeaNavLogo />
      <div style={containerStyle}>
        <h1 style={headingStyle}>
          Upload merged file to remove gaps, calculate differences, and visualize data
        </h1>
        <ToastContainer />

        <div style={sectionStyle}>
          <h2 style={subHeadingStyle}>Upload the Merged Excel File</h2>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#4CAF50")}
            onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
          />
          {error.file1 && (
            <p style={{ color: "#e53e3e", margin: "10px 0" }}>
              {error.file1}
            </p>
          )}
          {loading.file1 && (
            <p style={{ color: "#4a5568", margin: "10px 0" }}>
              Loading file...
            </p>
          )}

          {data1.length > 0 && (
            <div>
              <h3 style={{ ...subHeadingStyle, fontSize: "20px" }}>
                File Preview
              </h3>
              <table style={tableStyles}>
                <thead>
                  <tr>
                    {displayedHeaders1.map((header) => (
                      <th key={header} style={thStyle}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data1.slice(0, 10).map((row, index) => (
                    <tr key={index} style={alternateRowStyle(index)}>
                      {displayedHeaders1.map((header) => (
                        <td key={header} style={tdStyle}>
                          {row[header] != null ? row[header] : "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                style={{
                  ...buttonStyle,
                  background: "linear-gradient(45deg, #1e88e5, #4dabf7)",
                }}
                onClick={() =>
                  downloadSingleFile(
                    data1,
                    "File Processed",
                    "file_processed.xlsx"
                  )
                }
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 10px rgba(0,0,0,0.2)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Download Cleaned File
              </button>
              <button
                style={{
                  ...buttonStyle,
                  background: "linear-gradient(45deg, #ff9800, #ffb300)",
                }}
                onClick={calculateDifferences}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 10px rgba(0,0,0,0.2)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Calculate Differences
              </button>
            </div>
          )}

          {diffData.length > 0 && (
            <div>
              <h3 style={{ ...subHeadingStyle, fontSize: "20px" }}>
                Differences Preview
              </h3>
              <table style={tableStyles}>
                <thead>
                  <tr>
                    {displayedDiffHeaders.map((header) => (
                      <th key={header} style={thStyle}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {diffData.slice(0, 10).map((row, index) => (
                    <tr key={index} style={alternateRowStyle(index)}>
                      {displayedDiffHeaders.map((header) => (
                        <td key={header} style={tdStyle}>
                          {row[header] != null ? row[header] : "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={sectionStyle}>
  <h2 style={subHeadingStyle}>Upload Differences File for Visualization</h2>
  <input
    type="file"
    accept=".xlsx,.xls"
    onChange={handleGraphFileUpload}
    style={inputStyle}
    onFocus={(e) => (e.target.style.borderColor = "#4CAF50")}
    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
  />
  {error.graphFile && (
    <p style={{ color: "#e53e3e", margin: "10px 0" }}>
      {error.graphFile}
    </p>
  )}
  {loading.graphFile && (
    <p style={{ color: "#4a5568", margin: "10px 0" }}>
      Loading graph file...
    </p>
  )}

  {graphData.length > 0 && (
    <div>
      <h3 style={{ ...subHeadingStyle, fontSize: "20px" }}>
        TK2-08 - Height (in)
      </h3>

      {/* Chart 1: TK2-08B Height */}
      <ResponsiveContainer width="100%" height={200}>
        <LineChart
          data={graphData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="Date"
            domain={brushDomain ? [brushDomain[0], brushDomain[1]] : ['auto', 'auto']}
          />
          <YAxis domain={[-1, 1]} label={{ value: "TK2-08B - Height", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="Height B (LBN-TP-TK2-08B - Height)"
            stroke="#ffc107"
            name="LBN-TP-TK2-08B - Height"
          />
          <Brush
            dataKey="Date"
            height={30}
            stroke="#8884d8"
            />
        </LineChart>
      </ResponsiveContainer>

      {/* Chart 2: TK2-08A Height */}
      <ResponsiveContainer width="100%" height={200}>
        <LineChart
          data={graphData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="Date"
            domain={brushDomain ? [brushDomain[0], brushDomain[1]] : ['auto', 'auto']}
            label={{ value: "2025", position: "insideBottom", offset: -5 }}
          />
          <YAxis domain={[-1, 1]} label={{ value: "TK2-08A - Height", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="Height A (LBN-TP-TK2-08A - Height)"
            stroke="#8884d8"
            name="LBN-TP-TK2-08A - Height"
          />
          <Brush
            dataKey="Date"
            height={30}
            stroke="#8884d8"
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

export default GapRemoval;