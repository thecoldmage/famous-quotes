import SearchFilters from '@/components/quotes/SearchFilters'
import QuoteFeed from '@/components/quotes/QuoteFeed'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <SearchFilters />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <QuoteFeed />
        </div>
      </main>
    </div>
  )
}
