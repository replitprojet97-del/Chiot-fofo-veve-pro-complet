const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

async function apiFetchForm<T>(path: string, formData: FormData): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export const puppiesApi = {
  list: () => apiFetch<Puppy[]>("/api/puppies"),
  get: (id: number) => apiFetch<Puppy>(`/api/puppies/${id}`),
};

export const reviewsApi = {
  listApproved: () => apiFetch<ReviewFromDB[]>("/api/reviews"),
  submit: (data: ReviewSubmitPayload) =>
    apiFetch<{ success: boolean; id: number }>("/api/reviews", { method: "POST", body: JSON.stringify(data) }),
};

export const contactApi = {
  sendContact: (data: ContactPayload) =>
    apiFetch<{ success: boolean }>("/api/contact", { method: "POST", body: JSON.stringify(data) }),
  sendReservation: (data: ReservationPayload) =>
    apiFetch<{ success: boolean }>("/api/reserve", { method: "POST", body: JSON.stringify(data) }),
};

export const adminApi = {
  login: (email: string, password: string) =>
    apiFetch<{ success: boolean; admin: { id: number; email: string } }>("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: () => apiFetch<{ success: boolean }>("/api/admin/logout", { method: "POST" }),
  me: () => apiFetch<{ admin: { adminId: number; email: string } }>("/api/admin/me"),
  listPuppies: () => apiFetch<Puppy[]>("/api/admin/puppies"),
  createPuppy: (data: PuppyPayload) =>
    apiFetch<Puppy>("/api/admin/puppies", { method: "POST", body: JSON.stringify(data) }),
  updatePuppy: (id: number, data: Partial<PuppyPayload>) =>
    apiFetch<Puppy>(`/api/admin/puppies/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  setStatus: (id: number, status: PuppyStatus) =>
    apiFetch<Puppy>(`/api/admin/puppies/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  setPremium: (id: number, isPremium: boolean) =>
    apiFetch<Puppy>(`/api/admin/puppies/${id}/premium`, { method: "PATCH", body: JSON.stringify({ isPremium }) }),
  deletePuppy: (id: number) =>
    apiFetch<{ success: boolean }>(`/api/admin/puppies/${id}`, { method: "DELETE" }),
  uploadImage: (file: File) => {
    const fd = new FormData();
    fd.append("image", file);
    return apiFetchForm<{ url: string; publicId: string }>("/api/admin/upload", fd);
  },
  listReviews: () => apiFetch<ReviewFromDB[]>("/api/admin/reviews"),
  createReview: (data: ReviewSubmitPayload) =>
    apiFetch<ReviewFromDB>("/api/admin/reviews", { method: "POST", body: JSON.stringify(data) }),
  approveReview: (id: number) =>
    apiFetch<ReviewFromDB>(`/api/admin/reviews/${id}/approve`, { method: "PATCH" }),
  deleteReview: (id: number) =>
    apiFetch<{ success: boolean }>(`/api/admin/reviews/${id}`, { method: "DELETE" }),
};

export type PuppyStatus = "available" | "reserved" | "sold";
export type PuppyColor = "bleu merle" | "rouge merle" | "noir tricolore" | "rouge tricolore";
export type PuppySex = "Mâle" | "Femelle";
export type ReviewStatus = "pending" | "approved";

export interface Puppy {
  id: number;
  name: string;
  ageWeeks: number;
  color: PuppyColor;
  sex: PuppySex;
  price: number;
  description: string;
  traits: string[];
  parents: string;
  images: string[];
  status: PuppyStatus;
  isPremium: boolean;
  createdAt: string;
}

export interface PuppyPayload {
  name: string;
  ageWeeks: number;
  color: PuppyColor;
  sex: PuppySex;
  price: number;
  description: string;
  traits: string[];
  parents: string;
  images: string[];
  status: PuppyStatus;
  isPremium: boolean;
}

export interface ReviewFromDB {
  id: number;
  name: string;
  location: string;
  puppyName: string;
  rating: number;
  text: string;
  status: ReviewStatus;
  createdAt: string;
}

export interface ReviewSubmitPayload {
  name: string;
  location: string;
  puppyName: string;
  rating: number;
  text: string;
}

export interface ContactPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message: string;
}

export interface ReservationPayload extends ContactPayload {
  puppyId: number;
  puppyName: string;
  puppyColor: string;
  puppySex: string;
  puppyPrice: number;
}
