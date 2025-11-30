import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';

// Font URL for Vietnamese support (using GitHub Raw for better reliability)
const ROBOTO_FONT_URL = 'https://raw.githubusercontent.com/google/fonts/main/apache/roboto/Roboto-Regular.ttf';

/**
 * Load font from URL and add to jsPDF VFS
 */
const loadFont = async (doc: jsPDF) => {
  try {
    const response = await fetch(ROBOTO_FONT_URL);
    if (!response.ok) throw new Error('Failed to fetch font');
    
    const blob = await response.blob();
    const reader = new FileReader();
    
    return new Promise<void>((resolve, reject) => {
      reader.onloadend = () => {
        const base64data = reader.result as string;
        // Remove data:font/ttf;base64, prefix if present (FileReader readAsDataURL adds it)
        const base64 = base64data.split(',')[1];
        
        if (base64) {
          doc.addFileToVFS('Roboto-Regular.ttf', base64);
          doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
          doc.setFont('Roboto');
          resolve();
        } else {
          reject(new Error('Failed to convert font to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error loading font:', error);
    // We don't throw here to allow export to continue with default font (even if garbled)
    // but ideally we should notify user. For now, console error is enough for debugging.
  }
};

/**
 * Export data to Excel file
 * @param data Array of objects to export
 * @param fileName Name of the file (without extension)
 * @param columns Column definitions for mapping headers
 * @param sheetName Name of the sheet
 */
export const exportToExcel = (
  data: any[], 
  fileName: string, 
  columns: { header: string; dataKey: string }[],
  sheetName: string = 'Sheet1'
) => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Map data to use headers
  const mappedData = data.map(item => {
    const newItem: any = {};
    columns.forEach(col => {
      newItem[col.header] = item[col.dataKey];
    });
    return newItem;
  });

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(mappedData);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Write file
  XLSX.writeFile(wb, `${fileName}_${dayjs().format('YYYY-MM-DD')}.xlsx`);
};

/**
 * Export data to PDF file with table
 * @param data Array of objects to export
 * @param columns Array of column definitions { header: string, dataKey: string }
 * @param fileName Name of the file (without extension)
 * @param title Title of the PDF document
 */
export const exportToPdf = async (
  data: any[],
  columns: { header: string; dataKey: string }[],
  fileName: string,
  title: string
) => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const doc = new jsPDF();

  // Load font for Vietnamese support
  await loadFont(doc);

  // Add title
  doc.setFontSize(18);
  // Use font if loaded, otherwise default
  try {
    doc.setFont('Roboto');
  } catch (e) {
    console.warn('Roboto font not available, using default');
  }
  
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.text(`Ngày xuất: ${dayjs().format('DD/MM/YYYY HH:mm')}`, 14, 30);

  // Add table
  autoTable(doc, {
    startY: 40,
    head: [columns.map(col => col.header)],
    body: data.map(row => columns.map(col => row[col.dataKey])),
    theme: 'grid',
    styles: { 
      font: 'Roboto', // Use the added font
      fontSize: 10 
    },
    headStyles: { fillColor: [24, 144, 255] },
  });

  // Save file
  doc.save(`${fileName}_${dayjs().format('YYYY-MM-DD')}.pdf`);
};

/**
 * Flatten object for export (helper)
 * Handles nested objects like { employee: { name: 'A' } } -> { 'employee.name': 'A' }
 */
export const flattenData = (data: any[]): any[] => {
  return data.map(item => {
    const flatItem: any = {};
    
    const flatten = (obj: any, prefix = '') => {
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          flatten(obj[key], `${prefix}${key}.`);
        } else {
          flatItem[`${prefix}${key}`] = obj[key];
        }
      }
    };

    flatten(item);
    return flatItem;
  });
};
