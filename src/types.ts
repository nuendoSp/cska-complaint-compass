export interface FileAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface ComplaintResponse {
  id: string;
  message: string;
  adminName: string;
  respondedAt: string;
  created_at: string;
  updated_at: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  status: ComplaintStatus;
  category: ComplaintCategory;
  location: string;
  locationId: string;
  locationName: string;
  submittedAt?: string;
  attachments?: FileAttachment[];
  response?: ComplaintResponse;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export type ComplaintStatus = 'new' | 'processing' | 'resolved' | 'rejected' | 'in_progress' | 'closed';
export type ComplaintCategory = 'team' | 'tickets' | 'merchandise' | 'facilities' | 'staff' | 'equipment' | 'cleanliness' | 'services' | 'safety' | 'other';

export interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  content_management: boolean;
  created_at: string;
  updated_at: string;
} 