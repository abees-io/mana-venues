export type Role = 'customer' | 'vendor' | 'admin'
export type PricingSlotStatus = 'available' | 'booked' | 'blocked'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled'

export type Profile = {
  id: string
  full_name: string
  email: string
  phone: string | null
  role: Role
  avatar_url: string | null
  created_at: string
}

export type City = {
  id: string
  name: string
  slug: string
  state: string
  is_active: boolean
  created_at?: string
}

export type Auditorium = {
  id: string
  owner_id: string | null
  city_id: string | null
  title: string
  name?: string
  slug: string
  district?: string
  city?: string | null
  address: string | null
  phone_number?: string | null
  latitude: number | null
  longitude: number | null
  seating_capacity: number
  capacity?: number
  floating_capacity: number | null
  base_price_per_day: number
  starting_price?: number
  photos: string[]
  description: string | null
  amenities: string[]
  verified: boolean
  is_verified?: boolean
  is_claimed?: boolean
  created_at: string
}

export type PricingSlot = {
  id: string
  auditorium_id: string
  date: string
  custom_price: number | null
  status: PricingSlotStatus
}

export type Booking = {
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

export type NewBooking = {
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

export type UpdateBooking = {
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

export type NewAuditorium = {
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

export type UpdateAuditorium = {
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

export type NewProfile = {
  id: string
  email: string
  full_name?: string
  phone?: string | null
  role?: Role
  avatar_url?: string | null
  created_at?: string
}

export type UpdateProfile = {
  full_name?: string
  phone?: string | null
  role?: Role
  avatar_url?: string | null
}

export type NewCity = {
  id?: string
  name: string
  slug: string
  state?: string
  is_active?: boolean
  created_at?: string
}

export type NewPricingSlot = {
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
