export interface Role {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  parent?: string;
  users?: any[];
  policies?: any[];
}
