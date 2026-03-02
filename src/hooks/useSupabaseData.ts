'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Asset, Reservation } from '@/types/database'

export function useAssets() {
    const [assets, setAssets] = useState<Asset[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchAssets = async () => {
        const supabase = createClient()
        if (!supabase) {
            console.warn('[useAssets] Supabase client not initialized')
            setLoading(false)
            return
        }

        console.log('[useAssets] Fetching assets...')
        const { data, error: fetchError } = await supabase
            .from('assets')
            .select('*')
            .order('type', { ascending: true })
            .order('name', { ascending: true })

        console.log('[useAssets] Result:', { data, error: fetchError })

        if (fetchError) {
            console.error('[useAssets] Error:', fetchError.message)
            setError(fetchError.message)
        }
        if (data) setAssets(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchAssets()
    }, [])

    return { assets, loading, error, refetch: fetchAssets }
}

export function useActiveAssets() {
    const [assets, setAssets] = useState<Asset[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchAssets = async () => {
            const supabase = createClient()
            if (!supabase) {
                console.warn('[useActiveAssets] Supabase client not initialized')
                setLoading(false)
                return
            }

            console.log('[useActiveAssets] Fetching active assets...')
            const { data, error: fetchError } = await supabase
                .from('assets')
                .select('*')
                .eq('is_active', true)
                .order('type', { ascending: true })
                .order('name', { ascending: true })

            console.log('[useActiveAssets] Result:', { count: data?.length, error: fetchError })

            if (fetchError) {
                console.error('[useActiveAssets] Error:', fetchError.message)
                setError(fetchError.message)
            }
            if (data) setAssets(data)
            setLoading(false)
        }

        fetchAssets()
    }, [])

    return { assets, loading, error }
}

export function useAsset(id: string) {
    const [asset, setAsset] = useState<Asset | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAsset = async () => {
            const supabase = createClient()
            if (!supabase) {
                setLoading(false)
                return
            }

            const { data, error } = await supabase
                .from('assets')
                .select('*')
                .eq('id', id)
                .single()

            if (error) console.error('[useAsset] Error:', error.message)
            if (data) setAsset(data)
            setLoading(false)
        }

        fetchAsset()
    }, [id])

    return { asset, loading }
}

export function useReservations() {
    const [reservations, setReservations] = useState<Reservation[]>([])
    const [loading, setLoading] = useState(true)

    const fetchReservations = async () => {
        const supabase = createClient()
        if (!supabase) {
            setLoading(false)
            return
        }

        const { data, error } = await supabase
            .from('reservations')
            .select('*')
            .order('check_in', { ascending: true })

        if (error) console.error('[useReservations] Error:', error.message)
        if (data) setReservations(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchReservations()
    }, [])

    return { reservations, loading, refetch: fetchReservations }
}

export function useAssetReservations(assetId: string) {
    const [reservations, setReservations] = useState<Reservation[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchReservations = async () => {
            const supabase = createClient()
            if (!supabase) {
                setLoading(false)
                return
            }

            const { data, error } = await supabase
                .from('reservations')
                .select('*')
                .eq('asset_id', assetId)
                .neq('status', 'cancelled')
                .order('check_in', { ascending: true })

            if (error) console.error('[useAssetReservations] Error:', error.message)
            if (data) setReservations(data)
            setLoading(false)
        }

        fetchReservations()
    }, [assetId])

    return { reservations, loading }
}

export function useMyReservations(userId: string | undefined) {
    const [reservations, setReservations] = useState<(Reservation & { asset?: Asset })[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchReservations = async () => {
            if (!userId) {
                setLoading(false)
                return
            }

            const supabase = createClient()
            if (!supabase) {
                setLoading(false)
                return
            }

            const { data: resData, error } = await supabase
                .from('reservations')
                .select('*')
                .eq('client_id', userId)
                .order('check_in', { ascending: false })

            if (error) console.error('[useMyReservations] Error:', error.message)

            if (resData && resData.length > 0) {
                const assetIds = [...new Set(resData.map(r => r.asset_id))]
                const { data: assetsData } = await supabase
                    .from('assets')
                    .select('*')
                    .in('id', assetIds)

                const assetsMap: Record<string, Asset> = {}
                assetsData?.forEach(a => { assetsMap[a.id] = a })

                setReservations(resData.map(r => ({
                    ...r,
                    asset: assetsMap[r.asset_id] || undefined,
                })))
            }
            setLoading(false)
        }

        fetchReservations()
    }, [userId])

    return { reservations, loading }
}
