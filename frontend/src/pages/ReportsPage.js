import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
const jsPDF = require('jspdf').jsPDF;
require('jspdf-autotable');

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from '../images/logo.png'; // Update with your logo path
import watermark from '../images/watermark.png'; // Update if needed


const ReportsPage = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState([]);
  const [reportType, setReportType] = useState('daily');
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState('csv');
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [error, setError] = useState(null);



  const fetchReportData = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
        toast.error('End date cannot be earlier than start date');
        return;
      }

    setLoading(true);
    try {
        const params = new URLSearchParams({
            type: reportType,
            start: new Date(startDate).toISOString(),
            end: new Date(endDate).toISOString()
        });

        const res = await fetch(`/api/reports?${params}`, {
            headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to generate report');
        }

        const data = await res.json();
        setReportData(data);
        setShowDownload(true);
        toast.success('Report generated successfully!');
    } catch (error) {
        setError(error.message);
        toast.error(error.message);
        console.error('Report error:', error);
    } finally {
        setLoading(false);
    }
  };

  const tableHeaders = useMemo(() => {
    return reportData.length > 0 
      ? Object.keys(reportData[0]).map(header => 
          header.replace(/([A-Z])/g, ' $1').toUpperCase()
        )
      : [];
  }, [reportData]);

  const tableData = useMemo(() => {
    return reportData.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' ? value : JSON.stringify(value)
      )
    );
  }, [reportData]);

  const convertToCSV = (objArray) => {
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = '';

    // CSV header
    const headers = Object.keys(array[0]);
    str += headers.join(',') + '\r\n';

    // CSV rows
    array.forEach(item => {
      let line = '';
      headers.forEach(header => {
        if (line !== '') line += ',';
        line += JSON.stringify(item[header], (key, value) => {
          return value === null ? '' : value;
        });
      });
      str += line + '\r\n';
    });

    return str;
  };

  const downloadCSV = () => {
    if (reportData.length === 0) return;

    const csvContent = convertToCSV(reportData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportType}_report_${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePDF = useCallback(async (preview = false) => {
    if (reportData.length === 0) return;

    setIsGeneratingPDF(true);
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  
      // Convert imported images to data URLs
      const logoData = await fetch(logo).then(r => r.blob());
      const watermarkData = await fetch(watermark).then(r => r.blob());
      
      const [logoURL, watermarkURL] = await Promise.all([
        new Promise(resolve => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(logoData);
        }),
        new Promise(resolve => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(watermarkData);
        })
      ]);
      // // Load images (make sure these paths are correct)
      // const logo = '../images/logo.png'; // Update with your logo path
      // const watermark = '../images/watermark.png'; // Update if needed

      // const doc = new jsPDF({
      //   orientation: 'landscape',
      //   unit: 'mm',
      //   format: 'a4'
      // });

      // Load images and create PDF
      // Promise.all([
      //   fetch(logo).then(res => res.blob()),
      //   fetch(watermark).then(res => res.blob())
      // ]).then(blobs => {
      //   const [logoBlob, watermarkBlob] = blobs;
      //   const logoURL = URL.createObjectURL(logoBlob);
      //   const watermarkURL = URL.createObjectURL(watermarkBlob);

      // Add header
      doc.addImage(logoURL, 'PNG', 10, 10, 30, 15);
      doc.setFontSize(18);
      doc.text('Key Management System Report', 50, 20);
      doc.setFontSize(12);
      doc.text(`Report Type: ${reportType.toUpperCase()}`, 50, 27);
      doc.text(`Date Range: ${startDate} to ${endDate}`, 50, 32);

      // Add watermark
      doc.addImage(watermarkURL, 'PNG', 50, 50, 100, 100);

      // Prepare table data
      const headers = Object.keys(reportData[0]).map(header => 
        header.replace(/([A-Z])/g, ' $1').toUpperCase()
      );
      
      const data = reportData.map(row => 
        Object.values(row).map(value => 
          typeof value === 'string' ? value : JSON.stringify(value)
        )
      );
      
      console.log('autoTable exists?', typeof doc.autoTable);
      // Generate table
      doc.autoTable({
        head: [headers],
        body: data,
        startY: 40,
        styles: {
          fontSize: 10,
          cellPadding: 1.5,
          halign: 'center'
        },
        headerStyles: {
          fillColor: [41, 128, 185],
          textColor: 255
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        }
      });

      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(
          `Page ${i} of ${pageCount} - Generated ${new Date().toLocaleString()}`,
          10,
          doc.internal.pageSize.height - 10
        );
      }

      // Save PDF
      doc.save(`${reportType}_report_${new Date().toISOString()}.pdf`);

      if (preview) {
        const pdfBlob = doc.output('blob');
        setPdfPreviewUrl(URL.createObjectURL(pdfBlob));
      } else {
        doc.save(`${reportType}_report_${new Date().toISOString()}.pdf`);
      }

      // Cleanup
      URL.revokeObjectURL(logoURL);
      URL.revokeObjectURL(watermarkURL);
    } catch(error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF: Images not loaded');
    } finally {
      setIsGeneratingPDF(false);    
    }
  },[reportData, reportType, startDate, endDate]);

  const handleGeneratePreview = () => {
    if (previewMode === 'pdf') {
      generatePDF(true);
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h1 className="text-2xl font-bold mb-6">Generate Reports</h1>
        
        {/* Date Pickers and Type Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Report Type</label>
            <select
              className="w-full p-2 border rounded"
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value);
                setShowDownload(false);
                setReportData([]);
              }}
            >
              <option value="daily">Daily Transactions</option>
              <option value="weekly">Weekly Summary</option>
              <option value="audit">Audit Logs</option>
              <option value="keys">Key Inventory</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border rounded"
              max={endDate || new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border rounded"
              min={startDate}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {loading && (
            <div className="inline-block ml-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            </div>
            )}
        {/* Generate Button */}
        <button
          onClick={fetchReportData}
          disabled={loading}
          className={`px-4 py-2 text-white rounded ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Generating Report...' : 'Generate Report'}
        </button>

        {/* Download Link */}
        {showDownload && reportData.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Report Preview</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setPreviewMode('csv')}
                className={`px-4 py-2 rounded ${
                  previewMode === 'csv' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200'
                }`}
              >
                CSV Preview
              </button>
              <button
                onClick={() => {
                  setPreviewMode('pdf');
                  handleGeneratePreview();
                }}
                className={`px-4 py-2 rounded ${
                  previewMode === 'pdf' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200'
                }`}
              >
                PDF Preview
              </button>
            </div>
          </div>

          {previewMode === 'csv' ? (
            <div className="bg-white p-4 rounded shadow-md" style={{ height: '400px' }}>
              <AutoSizer>
                {({ height, width }) => (
                  <List
                    height={height}
                    width={width}
                    itemSize={35}
                    itemCount={tableData.length}
                    overscanCount={5}
                  >
                    {({ index, style }) => (
                      <div 
                        style={style}
                        className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                      >
                        <div className="flex">
                          {tableData[index].map((cell, j) => (
                            <div 
                              key={j}
                              className="px-4 py-2 text-sm border-t flex-1"
                              style={{ width: `${100/tableHeaders.length}%` }}
                            >
                              {cell}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </List>
                )}
              </AutoSizer>
            </div>
          ) : (
            <div className="bg-white p-4 rounded shadow-md">
              {previewMode === 'pdf' && (
                <div className="bg-white p-4 rounded shadow-md">
                  {isGeneratingPDF ? (
                    <div className="text-center p-4 text-gray-500">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="mt-2">Generating PDF preview...</p>
                    </div>
                  ) : pdfPreviewUrl ? (
                    <iframe
                      src={pdfPreviewUrl}
                      className="w-full h-96 border rounded"
                      title="PDF Preview"
                    />
                  ) : (
                    <div className="text-center p-4 text-gray-500">
                      Click "PDF Preview" to generate
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="mt-4 space-x-4">
            <button
              onClick={downloadCSV}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Download CSV
            </button>
            <button
              onClick={() => generatePDF(false)}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Download PDF
            </button>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;