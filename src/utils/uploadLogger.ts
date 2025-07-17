// Sistema de logging para uploads - facilita debugging para admins
import { conditionalLogger } from './conditionalLogger';

export const uploadLogger = {
  start: (fileName: string, bucketName: string, folderPath: string) => {
    conditionalLogger.log('🚀 UPLOAD_START', {
      fileName,
      bucketName, 
      folderPath,
      timestamp: new Date().toISOString()
    });
  },
  
  progress: (fileName: string, progress: number) => {
    conditionalLogger.log('📊 UPLOAD_PROGRESS', {
      fileName,
      progress: `${progress}%`,
      timestamp: new Date().toISOString()
    });
  },
  
  success: (fileName: string, publicUrl: string, bucket: string) => {
    conditionalLogger.log('✅ UPLOAD_SUCCESS', {
      fileName,
      publicUrl,
      bucket,
      timestamp: new Date().toISOString()
    });
  },
  
  error: (fileName: string, error: string, context?: any) => {
    conditionalLogger.log('❌ UPLOAD_ERROR', {
      fileName,
      error,
      context,
      timestamp: new Date().toISOString()
    });
  },
  
  bucketAction: (bucketName: string, action: string, result?: any) => {
    conditionalLogger.log('🗂️ BUCKET_ACTION', {
      bucketName,
      action,
      result,
      timestamp: new Date().toISOString()
    });
  }
};