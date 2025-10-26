import { create } from 'zustand'
import { UserPublic } from '@/types'

interface AuthState {
  user: UserPublic | null
  isLoading: boolean
  setUser: (user: UserPublic | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null }),
}))

interface FilterState {
  selectedTags: string[]
  searchQuery: string
  sortBy: 'recent' | 'popular' | 'random'
  setSelectedTags: (tags: string[]) => void
  toggleTag: (tag: string) => void
  setSearchQuery: (query: string) => void
  setSortBy: (sortBy: 'recent' | 'popular' | 'random') => void
  reset: () => void
}

export const useFilterStore = create<FilterState>((set) => ({
  selectedTags: [],
  searchQuery: '',
  sortBy: 'recent',
  setSelectedTags: (selectedTags) => set({ selectedTags }),
  toggleTag: (tag) =>
    set((state) => ({
      selectedTags: state.selectedTags.includes(tag)
        ? state.selectedTags.filter((t) => t !== tag)
        : [...state.selectedTags, tag],
    })),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSortBy: (sortBy) => set({ sortBy }),
  reset: () => set({ selectedTags: [], searchQuery: '', sortBy: 'recent' }),
}))
