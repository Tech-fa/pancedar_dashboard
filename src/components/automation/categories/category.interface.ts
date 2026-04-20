export interface WorkflowEmailCategory {
  id: string;
  name: string;
  description: string | null;
  createdAt: number;
  updatedAt: number;
  resources?: {
    id?: string;
    textResource?: string | null;
    links?: string[];
    files?: string[];
  }[];
}
