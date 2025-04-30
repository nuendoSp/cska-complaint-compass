import { Database } from '../lib/database.types'

export type ComplaintCategory = Database['public']['Enums']['complaint_category']
export type ComplaintStatus = Database['public']['Enums']['complaint_status']
export type UserRole = Database['public']['Enums']['user_role']

export type FileAttachment = {
  id: string
  url: string
  name: string
  type: string
  size: number
  file?: File
}

export type Complaint = Database['public']['Tables']['complaints']['Row'] & {
  response?: ComplaintResponse
}

export type ComplaintResponse = Database['public']['Tables']['complaint_responses']['Row']

export type Assignee = Database['public']['Tables']['assignees']['Row']

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
