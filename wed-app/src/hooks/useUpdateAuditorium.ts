import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Auditorium, UpdateAuditorium } from '../lib/types'

export function useUpdateAuditorium(auditoriumId: string, slug?: string) {
  const queryClient = useQueryClient()

  const invalidateQueries = () => {
    if (slug) {
      queryClient.invalidateQueries({ queryKey: ['auditorium', slug] })
    }
    queryClient.invalidateQueries({ queryKey: ['auditorium', 'id', auditoriumId] })
    queryClient.invalidateQueries({ queryKey: ['auditoriums'] })
    queryClient.invalidateQueries({ queryKey: ['vendor_stats'] })
  }

  const updateSpecsMutation = useMutation({
    mutationFn: async (data: UpdateAuditorium) => {
      const { data: updated, error } = await supabase
        .from('auditoriums')
        .update(data)
        .eq('id', auditoriumId)
        .select()
        .single()

      if (error) throw error
      return updated as Auditorium
    },
    onSuccess: () => {
      invalidateQueries()
    },
  })

  const updatePhotosMutation = useMutation({
    mutationFn: async (photos: string[]) => {
      const { data: updated, error } = await supabase
        .from('auditoriums')
        .update({ photos })
        .eq('id', auditoriumId)
        .select()
        .single()

      if (error) throw error
      return updated as Auditorium
    },
    onSuccess: () => {
      invalidateQueries()
    },
  })

  const addPhotoMutation = useMutation({
    mutationFn: async ({ url, existingPhotos }: { url: string; existingPhotos: string[] }) => {
      const updatedPhotos = [...existingPhotos, url]
      const { data: updated, error } = await supabase
        .from('auditoriums')
        .update({ photos: updatedPhotos })
        .eq('id', auditoriumId)
        .select()
        .single()

      if (error) throw error
      return updated as Auditorium
    },
    onSuccess: () => {
      invalidateQueries()
    },
  })

  const removePhotoMutation = useMutation({
    mutationFn: async ({ url, existingPhotos }: { url: string; existingPhotos: string[] }) => {
      const updatedPhotos = existingPhotos.filter((p) => p !== url)
      const { data: updated, error } = await supabase
        .from('auditoriums')
        .update({ photos: updatedPhotos })
        .eq('id', auditoriumId)
        .select()
        .single()

      if (error) throw error
      return updated as Auditorium
    },
    onSuccess: () => {
      invalidateQueries()
    },
  })

  return {
    updateSpecs: updateSpecsMutation.mutateAsync,
    updateSpecsMutation,
    updatePhotos: updatePhotosMutation.mutateAsync,
    updatePhotosMutation,
    addPhoto: addPhotoMutation.mutateAsync,
    addPhotoMutation,
    removePhoto: removePhotoMutation.mutateAsync,
    removePhotoMutation,
    isUpdating:
      updateSpecsMutation.isPending ||
      updatePhotosMutation.isPending ||
      addPhotoMutation.isPending ||
      removePhotoMutation.isPending,
  }
}
