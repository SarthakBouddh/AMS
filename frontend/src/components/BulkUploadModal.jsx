import React, { useState } from 'react';
import { Upload, FileText, Download, CheckCircle2, AlertCircle, X, Layers, Trash2 } from 'lucide-react';
import { api } from '../api';

export default function BulkUploadModal({ isOpen, onClose, type = 'ASSETS', currentUser, companyId, onImportSuccess }) {
  const [rawText, setRawText] = useState('');
  const [parsedData, setParsedData] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const isAssets = type === 'ASSETS';

  // Sample CSV Headers & Example Template Download
  const assetCsvSample = `Name,Category,Value,Location,Condition,SerialNumber,VendorName,WarrantyExpiryDate
MacBook Pro 16-inch,Hardware,2499,Mumbai office,Excellent,SN-MBP994,Apple Enterprise,2027-10-15
Dell UltraSharp Monitor,Hardware,499,Bengaluru office,Good,SN-DELL402,Dell Direct,2026-06-30
Ergonomic Mesh Chair,Furniture,350,Delhi office,Good,SN-[#FURN-102],Herman Miller,2028-12-01`;

  const peopleCsvSample = `Name,Email,Department,Role,Location,Password
Aarav Sharma,aarav@quantwork.com,Engineering,Senior Software Engineer,Mumbai office,aarav123
Priya Patel,priya@quantwork.com,Design,UX Lead Designer,Bengaluru office,priya123
Rohan Gupta,rohan@quantwork.com,Product,Product Manager,Delhi office,rohan123`;

  const sampleContent = isAssets ? assetCsvSample : peopleCsvSample;

  const handleDownloadSample = () => {
    const blob = new Blob([sampleContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = isAssets ? 'asset_import_template.csv' : 'people_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const parseCsv = (text) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      setErrorMessage('CSV must contain a header line and at least 1 data row.');
      setParsedData([]);
      return;
    }

    setErrorMessage('');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const rows = lines.slice(1).map((line, idx) => {
      const values = line.split(',').map(v => v.trim());
      const item = {};
      headers.forEach((h, i) => {
        item[h] = values[i] || '';
      });

      if (isAssets) {
        return {
          name: item.Name || item.name || `Imported Asset #${idx + 1}`,
          assetTag: item.AssetTag || item.assetTag || 'AST-' + Math.floor(1000 + Math.random() * 9000),
          category: item.Category || item.category || 'Hardware',
          status: item.Status || item.status || 'Available',
          location: item.Location || item.location || 'Mumbai office',
          value: parseFloat(item.Value || item.value) || 0,
          condition: item.Condition || item.condition || 'Good',
          serialNumber: item.SerialNumber || item.serialNumber || `SN-${Math.floor(10000 + Math.random() * 90000)}`,
          vendorName: item.VendorName || item.vendorName || '',
          warrantyExpiryDate: item.WarrantyExpiryDate || item.warrantyExpiryDate || '',
          purchaseDate: new Date().toISOString().split('T')[0]
        };
      } else {
        return {
          name: item.Name || item.name || `Employee #${idx + 1}`,
          email: item.Email || item.email || `user${idx + 1}@quantwork.com`,
          department: item.Department || item.department || 'Engineering',
          role: item.Role || item.role || item.RoleTitle || 'Team Member',
          location: item.Location || item.location || 'Mumbai office',
          password: item.Password || item.password || item.DefaultPassword || '',
          avatarBg: '#1c372e'
        };
      }
    });

    setParsedData(rows);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      setRawText(text);
      parseCsv(text);
    };
    reader.readAsText(file);
  };

  const handleTextChange = (e) => {
    const text = e.target.value;
    setRawText(text);
    parseCsv(text);
  };

  const handleImportSubmit = async () => {
    if (parsedData.length === 0) return;
    setIsUploading(true);

    let res;
    if (isAssets) {
      res = await api.bulkCreateAssets(parsedData, currentUser?.name || 'Admin', companyId, currentUser?.id);
    } else {
      res = await api.bulkCreateEmployees(parsedData, currentUser?.name || 'Admin', companyId);
    }

    setIsUploading(false);
    if (onImportSuccess) onImportSuccess(res || parsedData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="bg-[#f9f8f3] rounded-2xl border border-[#eae7de] shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#eae7de] bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#e3efe9] text-[#1c372e] flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-extrabold text-[#1c2826]">
                Bulk Import {isAssets ? 'Assets Inventory' : 'Team Directory'}
              </h3>
              <p className="text-xs text-[#61716c]">
                Upload CSV or paste spreadsheet data to batch create multiple records.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-[#788883] hover:bg-[#f0eee6] rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Download Sample Banner */}
          <div className="bg-white p-4 rounded-xl border border-[#eae7de] flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-[#1c372e]" />
              <span className="text-xs font-semibold text-[#1c2826]">
                Need standard format? Download sample CSV template
              </span>
            </div>
            <button
              onClick={handleDownloadSample}
              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#e3efe9] text-[#1c372e] text-xs font-bold hover:bg-[#d5e7df] transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download Template
            </button>
          </div>

          {/* File Upload Box */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475752]">
              Select CSV File
            </label>
            <input
              type="file"
              accept=".csv, text/csv"
              onChange={handleFileUpload}
              className="block w-full text-xs text-[#61716c] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#1c372e] file:text-white hover:file:bg-[#142a23] cursor-pointer"
            />
          </div>

          {/* Or Paste CSV Data Textarea */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#475752]">
              Or Paste CSV Raw Data Below
            </label>
            <textarea
              rows="4"
              value={rawText}
              onChange={handleTextChange}
              placeholder={sampleContent}
              className="w-full px-3 py-2 bg-white border border-[#d8d4c7] rounded-xl text-xs font-mono text-[#1c2826] focus:outline-none focus:ring-2 focus:ring-[#1c372e]"
            />
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
              {errorMessage}
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedData.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#1c2826] flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Preview Parsed Records ({parsedData.length})</span>
                </span>
                <button
                  onClick={() => { setParsedData([]); setRawText(''); }}
                  className="text-xs text-rose-600 font-bold hover:underline flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>

              <div className="border border-[#eae7de] rounded-xl overflow-hidden bg-white max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#faf9f4] border-b border-[#eae7de] font-mono text-[10px] text-[#788883] uppercase">
                      <th className="p-2">#</th>
                      <th className="p-2">Name</th>
                      {isAssets ? (
                        <>
                          <th className="p-2">Category</th>
                          <th className="p-2">Value</th>
                          <th className="p-2">Location</th>
                        </>
                      ) : (
                        <>
                          <th className="p-2">Email</th>
                          <th className="p-2">Department</th>
                          <th className="p-2">Role</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0eee6]">
                    {parsedData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#fcfbf7]">
                        <td className="p-2 font-mono text-[#889993]">{idx + 1}</td>
                        <td className="p-2 font-bold text-[#1c2826]">{row.name}</td>
                        {isAssets ? (
                          <>
                            <td className="p-2">{row.category}</td>
                            <td className="p-2 font-mono">${row.value}</td>
                            <td className="p-2">{row.location}</td>
                          </>
                        ) : (
                          <>
                            <td className="p-2 font-mono">{row.email}</td>
                            <td className="p-2">{row.department}</td>
                            <td className="p-2">{row.role}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#eae7de] bg-white flex justify-end space-x-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#62736e] bg-[#f0eee6] hover:bg-[#e4e1d3]"
          >
            Cancel
          </button>
          <button
            onClick={handleImportSubmit}
            disabled={parsedData.length === 0 || isUploading}
            className="px-5 py-2 rounded-xl text-xs font-bold text-[#1c372e] bg-[#f4c453] hover:bg-[#e5b642] shadow-sm disabled:opacity-50"
          >
            {isUploading ? 'Importing...' : `Import ${parsedData.length} Records`}
          </button>
        </div>
      </div>
    </div>
  );
}
