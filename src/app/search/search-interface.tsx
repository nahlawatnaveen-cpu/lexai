'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Loader2, ExternalLink, Scale, Calendar, Gavel, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  publishedDate: string;
  score: number;
}

export function SearchInterface({ userId }: { userId: string }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const exampleQueries = [
    'Supreme Court Article 21 judgments 2024',
    'Cheating cases under Section 420 IPC',
    'Consumer protection cases 2023',
    'Landmark judgments on RTI Act',
    'Cruelty under Section 498A IPC',
  ];

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchQuery }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Search failed');
        return;
      }

      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div className="container px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-primary/10">
              <Gavel className="h-10 w-10 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Case Law Search</h1>
            <p className="text-muted-foreground mt-2">
              Search Supreme Court and High Court judgments with AI-powered summaries
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for judgments, e.g., 'Section 377 Supreme Court 2023'"
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={isLoading || !query.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Searching...
              </>
            ) : (
              'Search'
            )}
          </Button>
        </form>

        {!hasSearched && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">Try these examples:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {exampleQueries.map((example) => (
                <Button
                  key={example}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setQuery(example);
                    handleSearch(example);
                  }}
                >
                  {example}
                </Button>
              ))}
            </div>
          </div>
        )}

        {hasSearched && !isLoading && results.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No results found</h3>
              <p className="text-muted-foreground mt-2">
                Try different keywords or check back later
              </p>
            </CardContent>
          </Card>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Found {results.length} relevant judgments
            </p>
            <div className="grid gap-4">
              {results.map((result, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg leading-tight">
                          {result.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4">
                          {result.publishedDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {result.publishedDate}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Scale className="h-3 w-3" />
                            Indian Courts
                          </span>
                        </CardDescription>
                      </div>
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0"
                      >
                        <Button variant="ghost" size="icon">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {result.snippet}
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        View Full Judgment <ExternalLink className="h-3 w-3" />
                      </a>
                      <span className="text-muted-foreground">•</span>
                      <a
                        href="https://indiankanoon.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        IndianKanoon
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="flex items-start gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800">Important Note</h4>
              <p className="text-sm text-yellow-700 mt-1">
                This search provides general information about case law. Always verify 
                judgments from official sources and consult a qualified lawyer for legal advice 
                on your specific situation.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
