export interface FileAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  file?: File;
}

export interface ComplaintResponse {
  id: string;
  text: string;
  message?: string;
  adminName: string;
  respondedAt: string;
  created_at: string;
  updated_at: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  location: string;
  location_id: string;
  locationname: string;
  user_id: string;
  status: ComplaintStatus;
  created_at: string;
  updated_at: string;
  submittedat?: string;
  contact_phone?: string;
  contact_email?: string;
  rating?: number;
  attachments?: (string | FileAttachment)[];
  response?: ComplaintResponse;
  priority_id?: string;
  assignee_id?: string;
}

export type ComplaintStatus = 'new' | 'processing' | 'resolved' | 'rejected' | 'in_progress' | 'closed';
export type ComplaintCategory =
  | 'facilities'
  | 'staff'
  | 'equipment'
  | 'cleanliness'
  | 'services'
  | 'safety'
  | 'other';

export interface ChangeRequest {
  id: string;
  content_id: string;
  old_value: string;
  new_value: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  content_management: {
    component_name: string;
    content_key: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Statistics {
  totalComplaints: number;
  categoryStats: Record<ComplaintCategory, number>;
  statusStats: Record<ComplaintStatus, number>;
} 