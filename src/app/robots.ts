import {MetadataRoute} from 'next';
import {WEBSITE_URL} from "@/constants/website";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/api/',
                '/dashboard/'
            ],
        },
        sitemap: WEBSITE_URL + '/sitemap.xml',
    };
}