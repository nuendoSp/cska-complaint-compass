import { Complaint } from '../types';

export const sendTelegramNotification = async (
  _complaint: Complaint,
  _action: 'created' | 'updated' | 'deleted'
) => {
// ... existing code ...
} 