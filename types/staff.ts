export type StaffMember = {
  id: string;
  firstName: string;
  lastName: string;
  name: string; // computed: firstName + lastName
  email: string;
  phone?: string | null;
  role: string;
  isActive: boolean;
};
