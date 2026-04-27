// Shape returned by GET /api/services and used throughout the app.
// Field names match the backend (snake_case → camelCase via Dapper mapping).
export type ServiceData = {
  id: string;
  organizationId?: string;
  name: string;
  description?: string | null;
  durationMin: number;
  bufferBeforeMin?: number;
  bufferAfterMin?: number;
  priceMin?: number | null;
  priceMax?: number | null;
  color: string;
  isActive?: boolean;
  workerIds?: string[];
};
