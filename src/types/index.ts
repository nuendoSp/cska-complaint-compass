
export type ComplaintCategory = 
  | "Facilities" 
  | "Staff" 
  | "Equipment" 
  | "Cleanliness" 
  | "Services" 
  | "Safety" 
  | "Other";

export interface FileAttachment {
  id: string;
  type: "image" | "video";
  url: string;
  name: string;
}

export interface ComplaintResponse {
  id: string;
  text: string;
  respondedAt: Date;
  adminName: string;
}

export interface Complaint {
  id: string;
  locationName: string;
  locationId: string;
  category: ComplaintCategory;
  description: string;
  attachments: FileAttachment[];
  status: "new" | "processing" | "resolved" | "rejected";
  submittedAt: Date;
  updatedAt?: Date;
  response?: ComplaintResponse;
}
