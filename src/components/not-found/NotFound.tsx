"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Search,
  Home,
  MessageSquare,
  Users,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { SearchResult, useSearch } from "@/hooks/useSearch";
import { Category, useCategories } from "@/hooks/useCategories";

export default function NotFound() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: searchResults, isLoading: searchLoading } = useSearch(
    searchQuery,
    searchQuery.length > 2 ? "all" : undefined
  );
  const { data: categories } = useCategories();

  useEffect(() => {
    console.error("404 Error: User attempted to access:", pathname);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const popularCategories = categories?.slice(0, 6) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-full mb-6">
              <MessageSquare className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
            <h2 className="text-3xl font-semibold mb-4">Page Not Found</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              We&apos;ve recently updated our website to a new forum platform.
              The page you&apos;re looking for may have moved or no longer
              exists.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/" passHref legacyBehavior>
                <Button size="lg">
                  <Home className="w-4 h-4 mr-2" />
                  Go to Home
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>

          {/* Search Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Search Our Community
              </CardTitle>
              <CardDescription>
                Looking for specific content? Try searching our discussions and
                topics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  placeholder="Search topics, discussions, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={searchLoading}>
                  <Search className="w-4 h-4" />
                </Button>
              </form>

              {searchQuery.length > 2 &&
                searchResults &&
                searchResults.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">
                      Search Results:
                    </h4>
                    {searchResults.slice(0, 5).map((result: SearchResult) => (
                      <Link
                        key={result.id}
                        href={`/${result.category_slug}/${result.slug}`}
                        className="block p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="font-medium">{result.title}</div>
                        <div className="text-sm text-muted-foreground">
                          in {result.category_name}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Popular Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Popular Categories
                </CardTitle>
                <CardDescription>
                  Browse our most active discussion areas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {popularCategories.map((category: Category) => (
                  <Link
                    key={category.id}
                    href={`/${category.slug}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                  >
                    <div>
                      <div className="font-medium group-hover:text-primary transition-colors">
                        {category.name}
                      </div>
                      {category.description && (
                        <div className="text-sm text-muted-foreground">
                          {category.description}
                        </div>
                      )}
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                ))}
                {popularCategories.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Categories are being loaded...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Get Started
                </CardTitle>
                <CardDescription>
                  Join our community and start participating
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/register" passHref legacyBehavior>
                  <Button className="w-full" variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Join the Community
                  </Button>
                </Link>
                <Link href="/topics" passHref legacyBehavior>
                  <Button className="w-full" variant="outline">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Browse All Topics
                  </Button>
                </Link>
                <Link href="/search" passHref legacyBehavior>
                  <Button className="w-full" variant="outline">
                    <Search className="w-4 h-4 mr-2" />
                    Advanced Search
                  </Button>
                </Link>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Need Help?</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    If you were looking for specific content from our old site,
                    our community can help you find it.
                  </p>
                  <Link href="/create" passHref legacyBehavior>
                    <Button variant="secondary" size="sm" className="w-full">
                      Start a Discussion
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer Message */}
          <div className="text-center mt-12 p-6 bg-muted/30 rounded-lg">
            <h3 className="font-semibold mb-2">Website Migration Notice</h3>
            <p className="text-sm text-muted-foreground">
              We&apos;ve recently migrated to a new forum platform to better
              serve our hockey community. If you can&apos;t find what
              you&apos;re looking for, please use the search above or
              <Link href="/create" className="underline ml-1">
                ask our community for help
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
