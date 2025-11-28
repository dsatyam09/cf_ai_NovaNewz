// Main router for Cloudflare Workers
// Routes requests to appropriate API endpoints

import articlesHandler from './articles.js';
import articleByIdHandler from './articles-[id].js';
import embedHandler from './embed.js';
import searchHandler from './search.js';
import historyHandler from './history.js';
import vectorizeHandler from './vectorize.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers for all responses
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Route to appropriate handler
      // Articles list/create
      if (path === '/articles' || path === '/api/articles') {
        return articlesHandler.fetch(request, env, ctx);
      }
      
      // Article by ID
      if (path.match(/^\/(?:api\/)?articles\/\d+$/)) {
        return articleByIdHandler.fetch(request, env, ctx);
      }
      
      // Embedding generation
      if (path === '/embed' || path === '/api/embed') {
        return embedHandler.fetch(request, env, ctx);
      }
      
      // Search
      if (path === '/search' || path === '/api/search') {
        return searchHandler.fetch(request, env, ctx);
      }
      
      // History generation
      if (path === '/history' || path === '/api/history') {
        return historyHandler.fetch(request, env, ctx);
      }
      
      // Vectorize operations
      if (path === '/vectorize' || path === '/api/vectorize') {
        return vectorizeHandler.fetch(request, env, ctx);
      }

      // Health check / root
      if (path === '/' || path === '/api') {
        return new Response(JSON.stringify({
          status: 'ok',
          message: 'NovaNewz API',
          version: '1.0.0',
          endpoints: {
            articles: '/articles',
            article: '/articles/:id',
            embed: '/embed',
            search: '/search',
            history: '/history',
            vectorize: '/vectorize'
          }
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Not found
      return new Response(JSON.stringify({
        error: 'Not found',
        path: path
      }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } catch (error) {
      console.error('Router error:', error);
      return new Response(JSON.stringify({
        error: error.message || 'Internal server error',
        stack: error.stack
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};
