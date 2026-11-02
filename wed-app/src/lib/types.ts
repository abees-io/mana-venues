export type Role = 'customer' | 'vendor' | 'admin'
export type PricingSlotStatus = 'available' | 'booked' | 'blocked'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled'

export interface Profile {
  id: string
  full_name: string
  email: string
  phone: string | null
  role: Role
  avatar_url: string | null
  created_at: string
}

export interface City {
  id: string
  name: string
  slug: string
  state: string
  is_active: boolean
  created_at: string
}

export interface Auditorium {
  id: string
  owner_id: string | null
  city_id: string | null
  title: string
  slug: string
  address: string | null
  latitude: number | null
  longitude: number | null
  seating_capacity: number
  floating_capacity: number | null
  base_price_per_day: number
  photos: string[]
  description: string | null
  amenities: string[]
  verified: boolean
  created_at: string
}

export interface PricingSlot {
  id: string
  auditorium_id: string
  date: string
  custom_price: number | null
  status: PricingSlotStatus
}

export interface Booking {
  id: string
  customer_id: string | null
  auditorium_id: string | null
  date: string
  total_amount: number
  advance_paid: number
  booking_status: BookingStatus
  payment_id: string | null
  notes: string | null
  created_at: string
}

export interface NewBooking {
  id?: string
  customer_id?: string | null
  auditorium_id?: string | null
  date: string
  total_amount: number
  advance_paid?: number
  booking_status?: BookingStatus
  payment_id?: string | null
  notes?: string | null
  created_at?: string
}

export interface UpdateBooking {
  id?: string
  customer_id?: string | null
  auditorium_id?: string | null
  date?: string
  total_amount?: number
  advance_paid?: number
  booking_status?: BookingStatus
  payment_id?: string | null
  notes?: string | null
  created_at?: string
}

export interface NewAuditorium {
  id?: string
  owner_id?: string | null
  city_id?: string | null
  title: string
  slug: string
  address?: string | null
  latitude?: number | null
  longitude?: number | null
  seating_capacity?: number
  floating_capacity?: number | null
  base_price_per_day?: number
  photos?: string[]
  description?: string | null
  amenities?: string[]
  verified?: boolean
  created_at?: string
}

export interface UpdateAuditorium {
  id?: string
  owner_id?: string | null
  city_id?: string | null
  title?: string
  slug?: string
  address?: string | null
  latitude?: number | null
  longitude?: number | null
  seating_capacity?: number
  floating_capacity?: number | null
  base_price_per_day?: number
  photos?: string[]
  description?: string | null
  amenities?: string[]
  verified?: boolean
  created_at?: string
}

export interface NewProfile {
  id: string
  email: string
  full_name?: string
  phone?: string | null
  role?: Role
  avatar_url?: string | null
  created_at?: string
}

export interface UpdateProfile {
  full_name?: string
  phone?: string | null
  role?: Role
  avatar_url?: string | null
}

export interface NewCity {
  id?: string
  name: string
  slug: string
  state?: string
  is_active?: boolean
  created_at?: string
}

export interface NewPricingSlot {
  id?: string
  auditorium_id: string
  date: string
  custom_price?: number | null
  status?: PricingSlotStatus
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: NewProfile
        Update: UpdateProfile
        Relationships: []
      }
      cities: {
        Row: City
        Insert: NewCity
        Update: Partial<City>
        Relationships: []
      }
      auditoriums: {
        Row: Auditorium
        Insert: NewAuditorium
        Update: UpdateAuditorium
        Relationships: []
      }
      pricing_slots: {
        Row: PricingSlot
        Insert: NewPricingSlot
        Update: Partial<PricingSlot>
        Relationships: []
      }
      bookings: {
        Row: Booking
        Insert: NewBooking
        Update: UpdateBooking
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
