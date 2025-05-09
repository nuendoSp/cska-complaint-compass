import { Database } from './database.types';

export type Tables = Database['public']['Tables'];
export type Enums = Database['public']['Enums'];

export type Complaints = Tables['complaints']['Row'];
export type ComplaintsInsert = Tables['complaints']['Insert'];
export type ComplaintsUpdate = Tables['complaints']['Update'];

export type Responses = Tables['responses']['Row'];
export type ResponsesInsert = Tables['responses']['Insert'];
export type ResponsesUpdate = Tables['responses']['Update'];

export type Locations = Tables['locations']['Row'];
export type LocationsInsert = Tables['locations']['Insert'];
export type LocationsUpdate = Tables['locations']['Update'];

export type Content = Tables['content']['Row'];
export type ContentInsert = Tables['content']['Insert'];
export type ContentUpdate = Tables['content']['Update']; 