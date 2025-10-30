"use client"

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface UploadResult {
  success: boolean;
  message: string;
  recordsProcessed?: number;
}

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [entityId, setEntityId] = useState('');
  const [reportType, setReportType] = useState('monthly');
  const [reportingPeriod, setReportingPeriod] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (isValidFileType(droppedFile)) {
        setFile(droppedFile);
        setResult(null);
      } else {
        setResult({
          success: false,
          message: 'Invalid file type. Please upload CSV or Excel files only.'
        });
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (isValidFileType(selectedFile)) {
        setFile(selectedFile);
        setResult(null);
      } else {
        setResult({
          success: false,
          message: 'Invalid file type. Please upload CSV or Excel files only.'
        });
      }
    }
  };

  const isValidFileType = (file: File): boolean => {
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    return validTypes.includes(file.type) || file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
  };

  const parseFile = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      if (file.name.endsWith('.csv')) {
        Papa.parse(file, {
          header: true,
          complete: (results) => resolve(results.data),
          error: (error) => reject(error)
        });
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);
            resolve(jsonData);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsArrayBuffer(file);
      }
    });
  };

  const handleUpload = async () => {
    if (!file || !entityId || !reportingPeriod) {
      setResult({
        success: false,
        message: 'Please fill in all required fields and select a file.'
      });
      return;
    }

    setIsUploading(true);
    setResult(null);

    try {
      // Parse the file
      const parsedData = await parseFile(file);
      
      // Calculate totals from parsed data
      let totalDebits = 0;
      let totalCredits = 0;
      
      parsedData.forEach((row: any) => {
        const debit = parseFloat(row.Debit || row.debit || row.DEBIT || 0);
        const credit = parseFloat(row.Credit || row.credit || row.CREDIT || 0);
        if (!isNaN(debit)) totalDebits += debit;
        if (!isNaN(credit)) totalCredits += credit;
      });

      // Create trial report
      const response = await fetch('/api/trial-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityId: parseInt(entityId),
          reportingPeriod,
          reportType,
          totalDebits,
          totalCredits,
          uploadedBy: 1, // In real app, use authenticated user ID
          fileUrl: `/uploads/${file.name}`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create trial report');
      }

      const report = await response.json();

      // Validate trial balance
      const validateResponse = await fetch(`/api/trial-reports/validate?id=${report.id}`);
      const validation = await validateResponse.json();

      setResult({
        success: validation.isValid,
        message: validation.isValid 
          ? `✓ Trial report uploaded successfully! ${parsedData.length} records processed. Trial balance is valid.`
          : `⚠ Trial report uploaded with balance difference of $${Math.abs(validation.balanceDifference).toFixed(2)}. ${validation.message}`,
        recordsProcessed: parsedData.length
      });

      // Reset form on success
      if (validation.isValid) {
        setFile(null);
        setEntityId('');
        setReportingPeriod('');
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Upload Trial Balance</h2>
          <p className="text-sm text-muted-foreground">
            Upload Excel or CSV files containing trial balance data. Supports SAP, Oracle, and custom formats.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="entityId">Entity *</Label>
            <Input
              id="entityId"
              type="number"
              placeholder="Entity ID"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reportType">Report Type *</Label>
            <select
              id="reportType"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reportingPeriod">Reporting Period *</Label>
            <Input
              id="reportingPeriod"
              type="date"
              value={reportingPeriod}
              onChange={(e) => setReportingPeriod(e.target.value)}
            />
          </div>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {file ? (
            <div className="space-y-2">
              <FileSpreadsheet className="h-12 w-12 mx-auto text-primary" />
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024).toFixed(2)} KB
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFile(null)}
              >
                Remove
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="font-medium">Drag and drop your file here</p>
              <p className="text-sm text-muted-foreground">or click to browse</p>
              <Input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <Label htmlFor="file-upload">
                <Button variant="outline" asChild>
                  <span>Select File</span>
                </Button>
              </Label>
            </div>
          )}
        </div>

        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            {result.success ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleUpload}
          disabled={isUploading || !file || !entityId || !reportingPeriod}
          className="w-full"
          size="lg"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload & Validate
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Supported formats: CSV, XLS, XLSX</p>
          <p>• Expected columns: Account Number, Account Name, Debit, Credit</p>
          <p>• Maximum file size: 10MB</p>
          <p>• Automatic validation against trial balance rules</p>
        </div>
      </div>
    </Card>
  );
}
