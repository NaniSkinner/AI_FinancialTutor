"use client";

import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Clock, BookOpen, Share2 } from "lucide-react";
import { getArticle } from "@/lib/articleContent";
import { Button } from "@/components/Common/Button";

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  // Get article content
  const article = getArticle(slug);

  // Handle article not found
  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-card rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="text-gray-400 dark:text-gray-600 mb-4">
            <BookOpen className="h-16 w-16 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Article Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The article you're looking for doesn't exist or has been moved.
          </p>
          <Button onClick={() => router.push("/dashboard")} className="w-full">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Split content into paragraphs
  const paragraphs = article.content.split("\n\n");

  return (
    <div className="min-h-screen bg-background">
      {/* Header Bar */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-card/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="font-medium">Back</span>
            </button>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: article.title,
                    text: article.subtitle,
                    url: window.location.href,
                  });
                }
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full">
              <BookOpen className="h-3.5 w-3.5" />
              <span className="font-medium">Article</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>{article.readTime} min read</span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">
            {article.title}
          </h1>

          {article.subtitle && (
            <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
              {article.subtitle}
            </p>
          )}
        </header>

        {/* Article Body */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {paragraphs.map((paragraph, index) => {
            // Handle headers
            if (paragraph.startsWith("## ")) {
              return (
                <h2
                  key={index}
                  className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-12 mb-4 first:mt-0"
                >
                  {paragraph.replace("## ", "")}
                </h2>
              );
            }
            if (paragraph.startsWith("### ")) {
              return (
                <h3
                  key={index}
                  className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-3"
                >
                  {paragraph.replace("### ", "")}
                </h3>
              );
            }
            if (paragraph.startsWith("#### ")) {
              return (
                <h4
                  key={index}
                  className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-2"
                >
                  {paragraph.replace("#### ", "")}
                </h4>
              );
            }

            // Handle bullet lists
            if (paragraph.includes("\n- ") || paragraph.startsWith("- ")) {
              const items = paragraph.split("\n").filter((item) => item.trim());
              return (
                <ul key={index} className="my-6 space-y-2">
                  {items.map((item, itemIndex) => (
                    <li
                      key={itemIndex}
                      className="text-gray-700 dark:text-gray-300 leading-relaxed"
                    >
                      {item.replace(/^- /, "").replace(/^• /, "")}
                    </li>
                  ))}
                </ul>
              );
            }

            // Handle special markers
            if (
              paragraph.includes("✅") ||
              paragraph.includes("❌") ||
              paragraph.includes("🚩")
            ) {
              return (
                <div
                  key={index}
                  className="my-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl"
                >
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {paragraph}
                  </p>
                </div>
              );
            }

            // Handle bold text blocks (example formatting)
            if (paragraph.includes("**") && paragraph.split("**").length > 3) {
              const parts = paragraph.split("**");
              return (
                <p
                  key={index}
                  className="text-gray-700 dark:text-gray-300 leading-relaxed my-4"
                >
                  {parts.map((part, partIndex) =>
                    partIndex % 2 === 1 ? (
                      <strong
                        key={partIndex}
                        className="font-semibold text-gray-900 dark:text-gray-100"
                      >
                        {part}
                      </strong>
                    ) : (
                      part
                    )
                  )}
                </p>
              );
            }

            // Regular paragraphs
            return (
              <p
                key={index}
                className="text-gray-700 dark:text-gray-300 leading-relaxed my-4"
              >
                {paragraph}
              </p>
            );
          })}
        </div>

        {/* Related Topics */}
        {article.relatedTopics && article.relatedTopics.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
              Related Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {article.relatedTopics.map((topic, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <p className="text-sm text-blue-900 dark:text-blue-300 leading-relaxed">
            <strong>Disclaimer:</strong> This is educational information to help
            you understand personal finance concepts. This content is not
            financial advice. For personalized guidance, please consult with a
            licensed financial advisor.
          </p>
        </div>

        {/* Back to Dashboard Button */}
        <div className="mt-8 flex justify-center">
          <Button
            onClick={() => router.push("/dashboard")}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </article>
    </div>
  );
}
