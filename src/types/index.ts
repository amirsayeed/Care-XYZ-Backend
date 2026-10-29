import { ObjectId } from "mongodb";

export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  contact: string;
  nid: string;
  passwordHash: string;
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  _id?: ObjectId;
  title: "Baby Care" | "Elderly Care" | "Sick People Care";
  description: string;
  hourlyRate: number;
  imageUrl: string;
  features: string[];
  createdAt: Date;
}

export interface Booking {
  _id?: ObjectId;
  userId: ObjectId;
  serviceId: ObjectId;
  duration: number;
  division: string;
  district: string;
  city: string;
  area: string;
  address: string;
  totalCost: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  invoiceSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  _id?: ObjectId;
  divisions: Division[];
}

export interface Division {
  name: string;
  districts: District[];
}

export interface District {
  name: string;
  cities: City[];
}

export interface City {
  name: string;
  areas: string[];
}

export interface Testimonial {
  _id?: ObjectId;
  userName: string;
  userPhoto: string;
  rating: number;
  review: string;
  date: Date;
}

export interface AuthPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}