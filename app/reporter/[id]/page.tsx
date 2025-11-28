"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getArticleById, updateArticle } from "@/lib/api";
import type { Article } from "@/types/article";

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Partial<Article>>({
    title: "",
    content: "",
    tags: [],
    author: "",
    published_at: "",
  });

  useEffect(() => {
    if (articleId) {
      loadArticle();
    }
  }, [articleId]);

  const loadArticle = async () => {
    setIsLoading(true);
    try {
      const article = await getArticleById(parseInt(articleId));
      setFormData({
        ...article,
        tags: Array.isArray(article.tags) ? article.tags : article.tags ? [article.tags] : [],
      });
    } catch (error: any) {
      console.error("Error loading article:", error);
      setErrors({ load: error.message || "Failed to load article. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title || formData.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    if (!formData.content || formData.content.trim().length < 50) {
      newErrors.content = "Content must be at least 50 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setErrors({});
    
    try {
      await updateArticle(parseInt(articleId), formData);
      router.push("/reporter");
    } catch (error: any) {
      console.error("Error updating article:", error);
      setErrors({ submit: error.message || "Failed to update article. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTagsChange = (value: string) => {
    const tags = value.split(",").map((tag) => tag.trim()).filter(Boolean);
    setFormData({ ...formData, tags });
  };

  if (isLoading) {
    return (
      <main className="min-h-screen p-4 sm:p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[#3B82F6] border-t-transparent"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading article...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 sm:p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6 sm:mb-8">
          <Link href="/reporter" className="text-[#3B82F6] hover:text-[#2563EB] hover:underline flex items-center gap-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Reporter Console
          </Link>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8">Edit Article</h1>

        {(errors.load || errors.submit) && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 shadow-sm">
            <p className="font-medium">{errors.load || errors.submit}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 sm:p-8" style={{ boxShadow: "0px 2px 10px rgba(0,0,0,0.1)" }}>
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title || ""}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (errors.title) setErrors({ ...errors, title: "" });
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent ${
                  errors.title ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content (Markdown) <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                required
                rows={12}
                value={formData.content || ""}
                onChange={(e) => {
                  setFormData({ ...formData, content: e.target.value });
                  if (errors.content) setErrors({ ...errors, content: "" });
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent font-mono text-sm ${
                  errors.content ? "border-red-300" : "border-gray-300"
                }`}
              />
              <div className="mt-1 flex justify-between items-center">
                {errors.content ? (
                  <p className="text-sm text-red-600">{errors.content}</p>
                ) : (
                  <p className="text-xs text-gray-500">Minimum 50 characters required</p>
                )}
                <p className="text-xs text-gray-500">{(formData.content || "").length} characters</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                  Author
                </label>
                <input
                  type="text"
                  id="author"
                  value={formData.author || ""}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="published_at" className="block text-sm font-medium text-gray-700 mb-2">
                  Published Date
                </label>
                <input
                  type="date"
                  id="published_at"
                  value={formData.published_at ? formData.published_at.split("T")[0] : ""}
                  onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                id="tags"
                value={Array.isArray(formData.tags) ? formData.tags.join(", ") : ""}
                onChange={(e) => handleTagsChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                placeholder="tech, ai, news"
              />
              <p className="mt-1 text-xs text-gray-500">Separate multiple tags with commas</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 px-6 py-3 bg-[#FBBF24] text-white rounded-lg font-medium hover:bg-[#F59E0B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Update Article"
                )}
              </button>
              <Link
                href="/reporter"
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors text-center shadow-sm hover:shadow-md"
              >
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
