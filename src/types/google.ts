import { User } from '@supabase/supabase-js';

/** Result of resolving Google access for Drive / Sheets export */
export type GoogleDriveAccessResult =
  | { status: 'ready'; accessToken: string }
  | { status: 'needs_sign_in' }
  | { status: 'needs_google_connect' }
  | { status: 'needs_reauthorization' };

export interface GoogleAuthStatus {
  isAuthenticated: boolean;
  hasRequiredScopes: boolean;
  user: User | null;
  loading: boolean;
}

export interface GoogleDriveUploadOptions {
  folderId?: string;
  filename: string;
  mimeType: string;
}

export interface GoogleSheetsCreateOptions {
  title: string;
  folderId?: string;
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  webViewLink: string;
  mimeType: string;
}

export interface GoogleDriveFolderCache {
  folderId: string;
  timestamp: number;
}

export interface GoogleSheetsExportResult {
  success: boolean;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  error?: string;
}

export interface GoogleDriveExportResult {
  success: boolean;
  fileId?: string;
  fileUrl?: string;
  error?: string;
}
