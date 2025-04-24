export type ComplaintCategory = 'Facilities' | 'Staff' | 'Equipment' | 'Cleanliness' | 'Services' | 'Safety' | 'Other';
export type ComplaintStatus = 'new' | 'processing' | 'resolved' | 'rejected';

export interface FileAttachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video';
}

export interface ComplaintResponse {
  id: string;
  text: string;
  adminName: string;
  respondedAt: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  location: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  submittedAt: string;
  updatedAt: string;
  response?: ComplaintResponse;
  attachments?: FileAttachment[];
  contact_email?: string;
  contact_phone?: string;
}

export interface ContentManagement {
  component_name: string;
  content_key: string;
}

export interface ChangeRequest {
  id: string;
  content_management: ContentManagement;
  old_value: string;
  new_value: string;
  created_at: string;
  updated_at: string;
}

export interface ComplaintContextType {
  complaints: Complaint[];
  addComplaint: (complaint: Omit<Complaint, 'id' | 'submittedAt' | 'updatedAt'>) => Promise<void>;
  updateComplaint: (id: string, updates: Partial<Complaint>) => Promise<void>;
  getComplaintById: (id: string) => Promise<Complaint | null>;
  getComplaintsByLocation: (location: string) => Promise<Complaint[]>;
  respondToComplaint: (complaintId: string, response: Omit<ComplaintResponse, 'id' | 'respondedAt'>) => Promise<void>;
}
