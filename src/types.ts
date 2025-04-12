export interface FileAttachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video';
}

export interface ComplaintResponse {
  id: string;
  text: string;
  created_at: string;
  adminName?: string;
}

export interface Complaint {
  id: string;
  title?: string;
  category: ComplaintCategory;
  description: string;
  location: string;
  status: ComplaintStatus;
  created_at: string;
  updated_at: string;
  response?: ComplaintResponse;
  priority_id?: string;
  assignee_id?: string;
  attachments?: FileAttachment[];
  contact_email?: string;
  contact_phone?: string;
}

export type ComplaintCategory = 
  | "Facilities"
  | "Staff"
  | "Equipment"
  | "Cleanliness"
  | "Services"
  | "Safety"
  | "Other";

export type ComplaintStatus = 
  | 'new'
  | 'processing'
  | 'resolved'
  | 'rejected'; 