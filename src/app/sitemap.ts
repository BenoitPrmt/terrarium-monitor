import {MetadataRoute} from 'next';
import {WEBSITE_URL} from "@/constants/website";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = WEBSITE_URL;

    return [
        '',
        '/about',
    ].map(route => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: route === '' ? 1.0 : 0.8,
    }));
}