import {getTranslations} from "next-intl/server";

export default async function HomePage() {
    const t = await getTranslations('Landing');
    return (
        <div className="min-h-screen">
            <h1>{t('title')}</h1>
        </div>
    )
}
