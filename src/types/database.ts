export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    full_name: string | null
                    phone: string | null
                    role: 'admin' | 'client'
                    avatar_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    full_name?: string | null
                    phone?: string | null
                    role?: 'admin' | 'client'
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string | null
                    phone?: string | null
                    role?: 'admin' | 'client'
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            assets: {
                Row: {
                    id: string
                    name: string
                    type: 'apartment' | 'yacht'
                    description: string | null
                    location: string | null
                    capacity: number
                    price_per_night: number
                    bedrooms: number | null
                    bathrooms: number | null
                    amenities: Json | null
                    images: string[]
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    type: 'apartment' | 'yacht'
                    description?: string | null
                    location?: string | null
                    capacity?: number
                    price_per_night?: number
                    bedrooms?: number | null
                    bathrooms?: number | null
                    amenities?: Json | null
                    images?: string[]
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    type?: 'apartment' | 'yacht'
                    description?: string | null
                    location?: string | null
                    capacity?: number
                    price_per_night?: number
                    bedrooms?: number | null
                    bathrooms?: number | null
                    amenities?: Json | null
                    images?: string[]
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            reservations: {
                Row: {
                    id: string
                    asset_id: string
                    client_id: string
                    check_in: string
                    check_out: string
                    status: 'confirmed' | 'pending' | 'cancelled'
                    total_price: number
                    guest_name: string | null
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    asset_id: string
                    client_id: string
                    check_in: string
                    check_out: string
                    status?: 'confirmed' | 'pending' | 'cancelled'
                    total_price?: number
                    guest_name?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    asset_id?: string
                    client_id?: string
                    check_in?: string
                    check_out?: string
                    status?: 'confirmed' | 'pending' | 'cancelled'
                    total_price?: number
                    guest_name?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            user_role: 'admin' | 'client'
            asset_type: 'apartment' | 'yacht'
            reservation_status: 'confirmed' | 'pending' | 'cancelled'
        }
    }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Asset = Database['public']['Tables']['assets']['Row']
export type Reservation = Database['public']['Tables']['reservations']['Row']
