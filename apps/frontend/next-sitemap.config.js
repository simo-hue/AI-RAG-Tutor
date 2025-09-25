/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://ai-speech-evaluator.com',
  generateRobotsTxt: false, // We have a custom robots.txt
  generateIndexSitemap: true,
  outDir: './public',

  // Advanced SEO configuration
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 7000,

  // Custom transformation for better SEO
  transform: async (config, path) => {
    // Customize priority and changefreq based on path
    let priority = 0.7;
    let changefreq = 'weekly';

    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    } else if (path.includes('/docs')) {
      priority = 0.9;
      changefreq = 'monthly';
    } else if (path.includes('/upload')) {
      priority = 0.8;
      changefreq = 'weekly';
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: [
        {
          href: `https://ai-speech-evaluator.com${path}`,
          hreflang: 'it',
        },
        {
          href: `https://ai-speech-evaluator.com/en${path}`,
          hreflang: 'en',
        },
        {
          href: `https://ai-speech-evaluator.com${path}`,
          hreflang: 'x-default',
        },
      ],
    };
  },

  // Additional paths for better indexing
  additionalPaths: async (config) => {
    return [
      {
        loc: '/health-check',
        changefreq: 'daily',
        priority: 0.3,
        lastmod: new Date().toISOString(),
      }
    ];
  },

  // Exclude certain paths
  exclude: [
    '/api/*',
    '/admin/*',
    '/private/*',
    '/_next/*',
    '/404',
    '/500',
  ],

  // Robot configuration for different environments
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/private/', '/_next/'],
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/private/'],
      },
      {
        userAgent: 'Claude-Bot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/private/'],
      },
    ],
    additionalSitemaps: [
      'https://ai-speech-evaluator.com/sitemap.xml',
    ],
  }
};