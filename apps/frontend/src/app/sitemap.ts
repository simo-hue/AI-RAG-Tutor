import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ai-speech-evaluator.com'
  const currentDate = new Date().toISOString()

  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
      alternates: {
        languages: {
          it: `${baseUrl}/it`,
          en: `${baseUrl}/en`,
        },
      },
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
      alternates: {
        languages: {
          it: `${baseUrl}/it/pricing`,
          en: `${baseUrl}/en/pricing`,
        },
      },
    },
    {
      url: `${baseUrl}/api-docs`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
      alternates: {
        languages: {
          it: `${baseUrl}/it/api-docs`,
          en: `${baseUrl}/en/api-docs`,
        },
      },
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
      alternates: {
        languages: {
          it: `${baseUrl}/it/docs`,
          en: `${baseUrl}/en/docs`,
        },
      },
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: {
          it: `${baseUrl}/it/about`,
          en: `${baseUrl}/en/about`,
        },
      },
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: {
          it: `${baseUrl}/it/contact`,
          en: `${baseUrl}/en/contact`,
        },
      },
    },
    {
      url: `${baseUrl}/upload`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {
        languages: {
          it: `${baseUrl}/it/upload`,
          en: `${baseUrl}/en/upload`,
        },
      },
    },
    {
      url: `${baseUrl}/microphone-test`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
      alternates: {
        languages: {
          it: `${baseUrl}/it/microphone-test`,
          en: `${baseUrl}/en/microphone-test`,
        },
      },
    },
    {
      url: `${baseUrl}/api/health`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.3,
    },
    // AI-specific discovery files (high priority for LLM crawlers)
    {
      url: `${baseUrl}/ai.txt`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/llms.txt`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/robots.txt`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    // Feature pages for better indexing
    {
      url: `${baseUrl}/features`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: {
        languages: {
          it: `${baseUrl}/it/features`,
          en: `${baseUrl}/en/features`,
        },
      },
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: {
        languages: {
          it: `${baseUrl}/it/privacy`,
          en: `${baseUrl}/en/privacy`,
        },
      },
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: {
        languages: {
          it: `${baseUrl}/it/terms`,
          en: `${baseUrl}/en/terms`,
        },
      },
    },
  ]
}