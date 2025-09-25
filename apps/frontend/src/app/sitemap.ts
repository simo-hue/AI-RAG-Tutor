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
      url: `${baseUrl}/api/health`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.3,
    },
  ]
}