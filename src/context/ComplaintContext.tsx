
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Complaint, ComplaintCategory, FileAttachment, ComplaintResponse } from '@/types';
import { useToast } from '@/components/ui/use-toast';

interface ComplaintContextType {
  complaints: Complaint[];
  addComplaint: (complaint: Omit<Complaint, 'id' | 'submittedAt' | 'status'>) => void;
  updateComplaint: (id: string, updates: Partial<Complaint>) => void;
  getComplaintById: (id: string) => Complaint | undefined;
  getComplaintsByLocation: (locationId: string) => Complaint[];
  getComplaintsByCategory: (category: ComplaintCategory) => Complaint[];
  respondToComplaint: (complaintId: string, response: Omit<ComplaintResponse, 'id' | 'respondedAt'>) => void;
}

const ComplaintContext = createContext<ComplaintContextType | undefined>(undefined);

// This would normally connect to an API or database
export const ComplaintProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const { toast } = useToast();

  // Load complaints from localStorage on initial load
  useEffect(() => {
    const savedComplaints = localStorage.getItem('complaints');
    if (savedComplaints) {
      try {
        const parsed = JSON.parse(savedComplaints);
        // Convert string dates back to Date objects
        const withDates = parsed.map((c: any) => ({
          ...c,
          submittedAt: new Date(c.submittedAt),
          updatedAt: c.updatedAt ? new Date(c.updatedAt) : undefined,
          response: c.response 
            ? { ...c.response, respondedAt: new Date(c.response.respondedAt) }
            : undefined
        }));
        setComplaints(withDates);
      } catch (e) {
        console.error('Failed to parse complaints from localStorage', e);
      }
    }
  }, []);

  // Save complaints to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('complaints', JSON.stringify(complaints));
  }, [complaints]);

  const addComplaint = (newComplaint: Omit<Complaint, 'id' | 'submittedAt' | 'status'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const complaint: Complaint = {
      ...newComplaint,
      id,
      status: "new",
      submittedAt: new Date(),
    };
    
    setComplaints(prev => [...prev, complaint]);
    
    toast({
      title: "Complaint submitted",
      description: "Your complaint has been successfully submitted.",
    });
    
    return complaint;
  };

  const updateComplaint = (id: string, updates: Partial<Complaint>) => {
    setComplaints(prev => 
      prev.map(complaint => 
        complaint.id === id 
          ? { ...complaint, ...updates, updatedAt: new Date() } 
          : complaint
      )
    );
  };

  const respondToComplaint = (complaintId: string, response: Omit<ComplaintResponse, 'id' | 'respondedAt'>) => {
    const responseId = Math.random().toString(36).substring(2, 9);
    const complaintResponse: ComplaintResponse = {
      ...response,
      id: responseId,
      respondedAt: new Date(),
    };

    setComplaints(prev => 
      prev.map(complaint => 
        complaint.id === complaintId 
          ? { 
              ...complaint, 
              response: complaintResponse, 
              status: "resolved", 
              updatedAt: new Date() 
            } 
          : complaint
      )
    );

    toast({
      title: "Response submitted",
      description: "Your response has been successfully submitted.",
    });
  };

  const getComplaintById = (id: string) => {
    return complaints.find(complaint => complaint.id === id);
  };

  const getComplaintsByLocation = (locationId: string) => {
    return complaints.filter(complaint => complaint.locationId === locationId);
  };

  const getComplaintsByCategory = (category: ComplaintCategory) => {
    return complaints.filter(complaint => complaint.category === category);
  };

  return (
    <ComplaintContext.Provider
      value={{
        complaints,
        addComplaint,
        updateComplaint,
        getComplaintById,
        getComplaintsByLocation,
        getComplaintsByCategory,
        respondToComplaint,
      }}
    >
      {children}
    </ComplaintContext.Provider>
  );
};

export const useComplaints = () => {
  const context = useContext(ComplaintContext);
  if (context === undefined) {
    throw new Error('useComplaints must be used within a ComplaintProvider');
  }
  return context;
};
