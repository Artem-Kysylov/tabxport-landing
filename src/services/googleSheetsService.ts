import { TableData, ParsedTable } from '@/types/table';
import { GoogleSheetsCreateOptions, GoogleSheetsExportResult } from '@/types/google';

/**
 * Create a new Google Sheet and populate it with table data
 */
export async function createGoogleSheet(
  accessToken: string,
  tableData: TableData,
  options: GoogleSheetsCreateOptions
): Promise<GoogleSheetsExportResult> {
  try {
    // Step 1: Create the spreadsheet
    const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title: options.title,
        },
      }),
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Failed to create Google Sheet');
    }

    const spreadsheet = await createResponse.json();
    const spreadsheetId = spreadsheet.spreadsheetId;

    const firstSheetProps: { title?: unknown; sheetId?: unknown } | undefined =
      Array.isArray(spreadsheet.sheets) && spreadsheet.sheets.length > 0
        ? spreadsheet.sheets[0]?.properties
        : undefined;

    const sheetTitle =
      typeof firstSheetProps?.title === 'string' && firstSheetProps.title
        ? firstSheetProps.title
        : 'Sheet1';

    const sheetId = typeof firstSheetProps?.sheetId === 'number' ? firstSheetProps.sheetId : 0;

    // Step 2: Populate with data
    await populateSheet(accessToken, spreadsheetId, tableData, sheetTitle);

    // Step 3: Format the sheet
    await formatSheet(accessToken, spreadsheetId, sheetId);

    // Step 4: Move to TableXport folder if folderId provided
    if (options.folderId) {
      await moveToFolder(accessToken, spreadsheetId, options.folderId);
    }

    return {
      success: true,
      spreadsheetId,
      spreadsheetUrl: spreadsheet.spreadsheetUrl,
    };
  } catch (error) {
    console.error('Error creating Google Sheet:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create Google Sheet',
    };
  }
}

/**
 * Populate a Google Sheet with table data
 */
export async function populateSheet(
  accessToken: string,
  spreadsheetId: string,
  tableData: TableData,
  sheetTitle: string
): Promise<void> {
  try {
    const values: string[][] = [];
    
    // Add headers if present
    if (tableData.headers && tableData.headers.length > 0) {
      values.push(tableData.headers);
    }
    
    // Add rows
    values.push(...tableData.rows);

    const escapedTitle = sheetTitle.replace(/'/g, "''");
    const range = `'${escapedTitle}'!A1`;

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Failed to populate sheet');
    }
  } catch (error) {
    console.error('Error populating sheet:', error);
    throw error;
  }
}

/**
 * Format a Google Sheet (bold headers, auto-resize columns)
 */
export async function formatSheet(accessToken: string, spreadsheetId: string, sheetId: number): Promise<void> {
  try {
    const requests = [
      // Bold the header row
      {
        repeatCell: {
          range: {
            sheetId,
            startRowIndex: 0,
            endRowIndex: 1,
          },
          cell: {
            userEnteredFormat: {
              textFormat: {
                bold: true,
              },
            },
          },
          fields: 'userEnteredFormat.textFormat.bold',
        },
      },
      // Auto-resize columns
      {
        autoResizeDimensions: {
          dimensions: {
            sheetId,
            dimension: 'COLUMNS',
            startIndex: 0,
            endIndex: 26, // A-Z columns
          },
        },
      },
      // Freeze header row
      {
        updateSheetProperties: {
          properties: {
            sheetId,
            gridProperties: {
              frozenRowCount: 1,
            },
          },
          fields: 'gridProperties.frozenRowCount',
        },
      },
    ];

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Failed to format sheet');
    }
  } catch (error) {
    console.error('Error formatting sheet:', error);
    throw error;
  }
}

/**
 * Move a spreadsheet to a specific folder
 */
async function moveToFolder(
  accessToken: string,
  fileId: string,
  folderId: string
): Promise<void> {
  try {
    // Get current parents
    const getResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=parents`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!getResponse.ok) {
      throw new Error('Failed to get file parents');
    }

    const file = await getResponse.json();
    const previousParents = file.parents ? file.parents.join(',') : '';

    // Move to new folder
    const updateResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?addParents=${folderId}&removeParents=${previousParents}&fields=id,parents`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!updateResponse.ok) {
      throw new Error('Failed to move file to folder');
    }
  } catch (error) {
    console.error('Error moving file to folder:', error);
    throw error;
  }
}

/**
 * Export a parsed table to Google Sheets
 */
export async function exportTableToGoogleSheets(
  accessToken: string,
  table: ParsedTable,
  folderId?: string
): Promise<GoogleSheetsExportResult> {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const title = `${table.name}_${timestamp}`;

  return createGoogleSheet(accessToken, table.data, {
    title,
    folderId,
  });
}

/**
 * Create a multi-sheet Google Spreadsheet from multiple tables
 */
export async function createMultiSheetSpreadsheet(
  accessToken: string,
  tables: ParsedTable[],
  title: string,
  folderId?: string
): Promise<GoogleSheetsExportResult> {
  try {
    // Step 1: Create the spreadsheet with multiple sheets
    const sheets = tables.map((table, index) => ({
      properties: {
        title: sanitizeSheetName(table.name, index),
      },
    }));

    const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title,
        },
        sheets,
      }),
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Failed to create multi-sheet spreadsheet');
    }

    const spreadsheet = await createResponse.json();
    const spreadsheetId = spreadsheet.spreadsheetId;

    // Step 2: Populate each sheet
    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      const sheetName = sanitizeSheetName(table.name, i);
      
      const values: string[][] = [];
      if (table.data.headers && table.data.headers.length > 0) {
        values.push(table.data.headers);
      }
      values.push(...table.data.rows);

      const escapedTitle = sheetName.replace(/'/g, "''");
      const range = `'${escapedTitle}'!A1`;

      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ values }),
        }
      );
    }

    // Step 3: Format all sheets
    const formatRequests = spreadsheet.sheets.map((sheet: { properties: { sheetId: number } }) => [
      {
        repeatCell: {
          range: {
            sheetId: sheet.properties.sheetId,
            startRowIndex: 0,
            endRowIndex: 1,
          },
          cell: {
            userEnteredFormat: {
              textFormat: {
                bold: true,
              },
            },
          },
          fields: 'userEnteredFormat.textFormat.bold',
        },
      },
      {
        autoResizeDimensions: {
          dimensions: {
            sheetId: sheet.properties.sheetId,
            dimension: 'COLUMNS',
            startIndex: 0,
            endIndex: 26,
          },
        },
      },
      {
        updateSheetProperties: {
          properties: {
            sheetId: sheet.properties.sheetId,
            gridProperties: {
              frozenRowCount: 1,
            },
          },
          fields: 'gridProperties.frozenRowCount',
        },
      },
    ]).flat();

    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests: formatRequests }),
      }
    );

    // Step 4: Move to folder if provided
    if (folderId) {
      await moveToFolder(accessToken, spreadsheetId, folderId);
    }

    return {
      success: true,
      spreadsheetId,
      spreadsheetUrl: spreadsheet.spreadsheetUrl,
    };
  } catch (error) {
    console.error('Error creating multi-sheet spreadsheet:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create multi-sheet spreadsheet',
    };
  }
}

/**
 * Sanitize sheet name to comply with Google Sheets requirements
 * Max 31 characters, no special characters
 */
function sanitizeSheetName(name: string, index: number): string {
  let sanitized = name
    .replace(/[:\\/\?\*\[\]]/g, '_')
    .trim();

  if (sanitized.length > 31) {
    sanitized = sanitized.slice(0, 28) + `_${index}`;
  }

  return sanitized || `Sheet${index + 1}`;
}
