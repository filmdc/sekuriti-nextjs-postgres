// Mock toast implementation - replace with sonner
export const toast = {
  success: (message: string) => {
    console.log('✅', message);
  },
  error: (message: string) => {
    console.error('❌', message);
  },
  info: (message: string) => {
    console.info('ℹ️', message);
  },
  warning: (message: string) => {
    console.warn('⚠️', message);
  },
};