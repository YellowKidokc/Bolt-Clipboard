#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials in .env file');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const server = new Server(
  {
    name: 'prophecy-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const tools: Tool[] = [
  {
    name: 'list_feeds',
    description: 'List all RSS feeds in the system',
    inputSchema: {
      type: 'object',
      properties: {
        active_only: {
          type: 'boolean',
          description: 'Filter to show only active feeds',
        },
      },
    },
  },
  {
    name: 'add_feed',
    description: 'Add a new RSS feed to monitor',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Display name for the feed',
        },
        url: {
          type: 'string',
          description: 'RSS feed URL',
        },
        category: {
          type: 'string',
          description: 'Category for the feed (e.g., news, tech, politics)',
        },
      },
      required: ['name', 'url'],
    },
  },
  {
    name: 'update_feed',
    description: 'Update an existing RSS feed',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Feed ID',
        },
        name: {
          type: 'string',
          description: 'New display name',
        },
        url: {
          type: 'string',
          description: 'New RSS feed URL',
        },
        category: {
          type: 'string',
          description: 'New category',
        },
        active: {
          type: 'boolean',
          description: 'Whether the feed is active',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_feed',
    description: 'Delete an RSS feed',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Feed ID to delete',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'list_scoring_keywords',
    description: 'List all scoring keywords and their weights',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Filter by category (LOW, MEDIUM, HIGH, CRITICAL)',
        },
      },
    },
  },
  {
    name: 'add_scoring_keyword',
    description: 'Add a new scoring keyword',
    inputSchema: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          description: 'The keyword to add',
        },
        weight: {
          type: 'number',
          description: 'Weight/score value for this keyword',
        },
        category: {
          type: 'string',
          description: 'Category: LOW, MEDIUM, HIGH, or CRITICAL',
        },
      },
      required: ['keyword', 'weight', 'category'],
    },
  },
  {
    name: 'update_scoring_keyword',
    description: 'Update an existing scoring keyword',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Keyword ID',
        },
        keyword: {
          type: 'string',
          description: 'New keyword text',
        },
        weight: {
          type: 'number',
          description: 'New weight value',
        },
        category: {
          type: 'string',
          description: 'New category',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_scoring_keyword',
    description: 'Delete a scoring keyword',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Keyword ID to delete',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'list_prophecies',
    description: 'List all prophecies being monitored',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'Filter by status (WATCHING, IMMINENT, FULFILLED)',
        },
        category: {
          type: 'string',
          description: 'Filter by category',
        },
      },
    },
  },
  {
    name: 'add_prophecy',
    description: 'Add a new prophecy to monitor',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Prophecy title',
        },
        description: {
          type: 'string',
          description: 'Detailed description',
        },
        reference: {
          type: 'string',
          description: 'Biblical or source reference',
        },
        category: {
          type: 'string',
          description: 'Category',
        },
        keywords: {
          type: 'array',
          items: { type: 'string' },
          description: 'Keywords to monitor',
        },
      },
      required: ['title', 'keywords'],
    },
  },
  {
    name: 'update_prophecy',
    description: 'Update an existing prophecy',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Prophecy ID',
        },
        title: {
          type: 'string',
          description: 'New title',
        },
        description: {
          type: 'string',
          description: 'New description',
        },
        reference: {
          type: 'string',
          description: 'New reference',
        },
        category: {
          type: 'string',
          description: 'New category',
        },
        status: {
          type: 'string',
          description: 'New status (WATCHING, IMMINENT, FULFILLED)',
        },
        keywords: {
          type: 'array',
          items: { type: 'string' },
          description: 'New keywords array',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'list_priority_targets',
    description: 'List all priority targets being tracked',
    inputSchema: {
      type: 'object',
      properties: {
        active_only: {
          type: 'boolean',
          description: 'Filter to show only active targets',
        },
      },
    },
  },
  {
    name: 'update_priority_target',
    description: 'Update a priority target',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Target ID',
        },
        name: {
          type: 'string',
          description: 'New name',
        },
        title: {
          type: 'string',
          description: 'New title',
        },
        description: {
          type: 'string',
          description: 'New description',
        },
        rank: {
          type: 'string',
          description: 'New rank (LOW, MEDIUM, HIGH, CRITICAL)',
        },
        score: {
          type: 'number',
          description: 'New score',
        },
        is_active: {
          type: 'boolean',
          description: 'Active status',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'list_articles',
    description: 'List recent articles with scores',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of articles to return (default 50)',
        },
        min_score: {
          type: 'number',
          description: 'Minimum score filter',
        },
        category: {
          type: 'string',
          description: 'Filter by score category',
        },
      },
    },
  },
  {
    name: 'get_system_stats',
    description: 'Get overall system statistics',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    switch (name) {
      case 'list_feeds': {
        let query = supabase.from('rss_feeds').select('*').order('name');

        if (args?.active_only) {
          query = query.eq('active', true);
        }

        const { data, error } = await query;

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'add_feed': {
        const { data, error } = await supabase
          .from('rss_feeds')
          .insert({
            name: (args as any).name,
            url: (args as any).url,
            category: (args as any).category || 'general',
          })
          .select()
          .single();

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: `Feed added successfully: ${JSON.stringify(data, null, 2)}`,
            },
          ],
        };
      }

      case 'update_feed': {
        const a = args as any;
        const updates: any = {};
        if (a.name !== undefined) updates.name = a.name;
        if (a.url !== undefined) updates.url = a.url;
        if (a.category !== undefined) updates.category = a.category;
        if (a.active !== undefined) updates.active = a.active;
        updates.updated_at = new Date().toISOString();

        const { data, error } = await supabase
          .from('rss_feeds')
          .update(updates)
          .eq('id', a.id)
          .select()
          .single();

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: `Feed updated successfully: ${JSON.stringify(data, null, 2)}`,
            },
          ],
        };
      }

      case 'delete_feed': {
        const { error } = await supabase
          .from('rss_feeds')
          .delete()
          .eq('id', (args as any).id);

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: `Feed deleted successfully (ID: ${(args as any).id})`,
            },
          ],
        };
      }

      case 'list_scoring_keywords': {
        let query = supabase
          .from('scoring_keywords')
          .select('*')
          .order('weight', { ascending: false });

        if (args?.category) {
          query = query.eq('category', args.category);
        }

        const { data, error } = await query;

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'add_scoring_keyword': {
        const a = args as any;
        const { data, error } = await supabase
          .from('scoring_keywords')
          .insert({
            keyword: a.keyword,
            weight: a.weight,
            category: a.category,
          })
          .select()
          .single();

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: `Scoring keyword added: ${JSON.stringify(data, null, 2)}`,
            },
          ],
        };
      }

      case 'update_scoring_keyword': {
        const a = args as any;
        const updates: any = {};
        if (a.keyword !== undefined) updates.keyword = a.keyword;
        if (a.weight !== undefined) updates.weight = a.weight;
        if (a.category !== undefined) updates.category = a.category;

        const { data, error } = await supabase
          .from('scoring_keywords')
          .update(updates)
          .eq('id', a.id)
          .select()
          .single();

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: `Keyword updated: ${JSON.stringify(data, null, 2)}`,
            },
          ],
        };
      }

      case 'delete_scoring_keyword': {
        const { error } = await supabase
          .from('scoring_keywords')
          .delete()
          .eq('id', (args as any).id);

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: `Keyword deleted successfully (ID: ${(args as any).id})`,
            },
          ],
        };
      }

      case 'list_prophecies': {
        let query = supabase
          .from('prophecies')
          .select('*')
          .order('order_index');

        if (args?.status) {
          query = query.eq('status', args.status);
        }
        if (args?.category) {
          query = query.eq('category', args.category);
        }

        const { data, error } = await query;

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'add_prophecy': {
        const a = args as any;
        const { data, error } = await supabase
          .from('prophecies')
          .insert({
            title: a.title,
            description: a.description || '',
            reference: a.reference || '',
            category: a.category || 'general',
            keywords: a.keywords || [],
          })
          .select()
          .single();

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: `Prophecy added: ${JSON.stringify(data, null, 2)}`,
            },
          ],
        };
      }

      case 'update_prophecy': {
        const a = args as any;
        const updates: any = {};
        if (a.title !== undefined) updates.title = a.title;
        if (a.description !== undefined) updates.description = a.description;
        if (a.reference !== undefined) updates.reference = a.reference;
        if (a.category !== undefined) updates.category = a.category;
        if (a.status !== undefined) updates.status = a.status;
        if (a.keywords !== undefined) updates.keywords = a.keywords;

        const { data, error } = await supabase
          .from('prophecies')
          .update(updates)
          .eq('id', a.id)
          .select()
          .single();

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: `Prophecy updated: ${JSON.stringify(data, null, 2)}`,
            },
          ],
        };
      }

      case 'list_priority_targets': {
        let query = supabase
          .from('priority_targets')
          .select('*')
          .order('score', { ascending: false });

        if (args?.active_only) {
          query = query.eq('is_active', true);
        }

        const { data, error } = await query;

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'update_priority_target': {
        const a = args as any;
        const updates: any = {};
        if (a.name !== undefined) updates.name = a.name;
        if (a.title !== undefined) updates.title = a.title;
        if (a.description !== undefined) updates.description = a.description;
        if (a.rank !== undefined) updates.rank = a.rank;
        if (a.score !== undefined) updates.score = a.score;
        if (a.is_active !== undefined) updates.is_active = a.is_active;

        const { data, error } = await supabase
          .from('priority_targets')
          .update(updates)
          .eq('id', a.id)
          .select()
          .single();

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: `Target updated: ${JSON.stringify(data, null, 2)}`,
            },
          ],
        };
      }

      case 'list_articles': {
        const a = args as any;
        const limit = a?.limit || 50;
        let query = supabase
          .from('articles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (a?.min_score !== undefined) {
          query = query.gte('score', a.min_score);
        }
        if (a?.category) {
          query = query.eq('score_category', a.category);
        }

        const { data, error } = await query;

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'get_system_stats': {
        const [feedsRes, propheciesRes, articlesRes, targetsRes] = await Promise.all([
          supabase.from('rss_feeds').select('id', { count: 'exact', head: true }),
          supabase.from('prophecies').select('id', { count: 'exact', head: true }),
          supabase.from('articles').select('id', { count: 'exact', head: true }),
          supabase.from('priority_targets').select('id', { count: 'exact', head: true }),
        ]);

        const stats = {
          total_feeds: feedsRes.count || 0,
          total_prophecies: propheciesRes.count || 0,
          total_articles: articlesRes.count || 0,
          total_targets: targetsRes.count || 0,
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(stats, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Prophecy MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
