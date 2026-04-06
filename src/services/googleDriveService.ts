import { GoogleDriveUploadOptions, GoogleDriveExportResult, GoogleDriveFolderCache } from '@/types/google';

const FOLDER_CACHE_KEY = 'tx_google_drive_folder_id';
const FOLDER_CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Get or create the main TableXport folder in Google Drive
 * Uses localStorage caching to avoid repeated API calls
 */
export async function getOrCreateTableXportFolder(accessToken: string): Promise<string> {
  try {
    // Check cache first
    const cached = localStorage.getItem(FOLDER_CACHE_KEY);
    if (cached) {
      const cache: GoogleDriveFolderCache = JSON.parse(cached);
      const isExpired = Date.now() - cache.timestamp > FOLDER_CACHE_EXPIRY;
      
      if (!isExpired) {
        // Verify folder still exists
        const verifyResponse = await fetch(
          `https://www.googleapis.com/drive/v3/files/${cache.folderId}?fields=id,name,trashed`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (verifyResponse.ok) {
          const folder = await verifyResponse.json();
          if (!folder.trashed) {
            return cache.folderId;
          }
        }
      } else {
        try {
          localStorage.removeItem(FOLDER_CACHE_KEY);
        } catch {
          // ignore
        }
      }
    }

    // Search for existing TableXport folder
    const searchUrl = new URL('https://www.googleapis.com/drive/v3/files');
    searchUrl.searchParams.set(
      'q',
      "name='TableXport' and mimeType='application/vnd.google-apps.folder' and trashed=false"
    );
    searchUrl.searchParams.set('fields', 'files(id,name)');

    const searchResponse = await fetch(searchUrl.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!searchResponse.ok) {
      throw new Error('Failed to search for TableXport folder');
    }

    const searchData = await searchResponse.json();
    
    if (searchData.files && searchData.files.length > 0) {
      const folderId = searchData.files[0].id;
      
      // Cache the folder ID
      const cache: GoogleDriveFolderCache = {
        folderId,
        timestamp: Date.now(),
      };
      localStorage.setItem(FOLDER_CACHE_KEY, JSON.stringify(cache));
      
      return folderId;
    }

    // Create new TableXport folder
    const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'TableXport',
        mimeType: 'application/vnd.google-apps.folder',
      }),
    });

    if (!createResponse.ok) {
      throw new Error('Failed to create TableXport folder');
    }

    const newFolder = await createResponse.json();
    
    // Cache the new folder ID
    const cache: GoogleDriveFolderCache = {
      folderId: newFolder.id,
      timestamp: Date.now(),
    };
    localStorage.setItem(FOLDER_CACHE_KEY, JSON.stringify(cache));
    
    return newFolder.id;
  } catch (error) {
    console.error('Error getting/creating TableXport folder:', error);
    throw error;
  }
}

/**
 * Create a subfolder for batch exports
 */
export async function createBatchFolder(
  accessToken: string,
  parentFolderId: string,
  timestamp: string
): Promise<string> {
  try {
    const folderName = `Batch_Export_${timestamp}`;
    
    const response = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentFolderId],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create batch folder');
    }

    const folder = await response.json();
    return folder.id;
  } catch (error) {
    console.error('Error creating batch folder:', error);
    throw error;
  }
}

/**
 * Upload a file to Google Drive
 */
export async function uploadFileToDrive(
  accessToken: string,
  blob: Blob,
  options: GoogleDriveUploadOptions
): Promise<GoogleDriveExportResult> {
  try {
    const metadata = {
      name: options.filename,
      mimeType: options.mimeType,
      ...(options.folderId && { parents: [options.folderId] }),
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: form,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Failed to upload file to Google Drive');
    }

    const file = await response.json();

    return {
      success: true,
      fileId: file.id,
      fileUrl: file.webViewLink,
    };
  } catch (error) {
    console.error('Error uploading file to Drive:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload file',
    };
  }
}

/**
 * Get the web view link for a folder
 */
export async function getFolderLink(accessToken: string, folderId: string): Promise<string> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${folderId}?fields=webViewLink`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get folder link');
    }

    const folder = await response.json();
    return folder.webViewLink;
  } catch (error) {
    console.error('Error getting folder link:', error);
    throw error;
  }
}

/**
 * Clear the cached folder ID (useful for debugging or if folder is deleted)
 */
export function clearFolderCache(): void {
  try {
    localStorage.removeItem(FOLDER_CACHE_KEY);
  } catch {
    // ignore
  }
}
