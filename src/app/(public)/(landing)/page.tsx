import Link from "next/link"
import {
    ArrowRight,
    Clock,
    Github,
    Globe,
    Leaf,
    Mail,
    Sprout,
} from "lucide-react"
import {getTranslations} from "next-intl/server"

import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Separator} from "@/components/ui/separator"
import {
    AUTHOR_EMAIL,
    AUTHOR_NAME,
    AUTHOR_URL,
    WEBSITE_CONTACT_EMAIL,
    WEBSITE_NAME,
} from "@/constants/website"

const REPOSITORY_URL = "https://github.com/BenoitPrmt/terrarium-monitor"

export default async function HomePage() {
    const t = await getTranslations("Landing")

    return (
        <div className="relative left-1/2 right-1/2 -mx-[50vw] min-h-screen w-screen bg-gradient-to-br from-emerald-50 via-background to-lime-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-emerald-950/30">
            <section className="relative px-4 py-20">
                <div className="mx-auto max-w-4xl text-center">
                    <Badge
                        variant="outline"
                        className="mb-4 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300"
                    >
                        {t("badge")}
                    </Badge>
                    <h1 className="mb-6 text-4xl font-bold text-foreground md:text-5xl">
                        {t("hero.title.before")}{" "}
                        <span className="text-emerald-600">{WEBSITE_NAME}</span>
                    </h1>
                    <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
                        {t("hero.description")}
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href={REPOSITORY_URL} target="_blank" rel="noopener noreferrer">
                            <Button size="lg" className="group bg-emerald-600 hover:bg-emerald-700">
                                <Github className="size-4" />
                                {t("hero.primaryCta")}
                                <ArrowRight className="size-4 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
                            </Button>
                        </Link>
                        <Link href={`mailto:${WEBSITE_CONTACT_EMAIL}`}>
                            <Button variant="outline" size="lg">
                                <Mail className="size-4" />
                                {t("hero.secondaryCta")}
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <Separator className="mx-auto max-w-4xl" />

            <section className="px-4 py-16">
                <div className="mx-auto max-w-4xl">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-foreground">
                            {t("project.title")}
                        </h2>
                        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                            {t("project.subtitle")}
                        </p>
                    </div>

                    <div className="mb-12 grid gap-6 md:grid-cols-3">
                        <Card className="border-border/70 bg-background/80 text-center transition-shadow hover:shadow-lg dark:bg-zinc-900/70">
                            <CardHeader>
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/60">
                                    <Leaf className="h-6 w-6 text-emerald-600" />
                                </div>
                                <CardTitle className="text-lg">{t("project.cards.need.title")}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{t("project.cards.need.description")}</p>
                            </CardContent>
                        </Card>

                        <Card className="border-border/70 bg-background/80 text-center transition-shadow hover:shadow-lg dark:bg-zinc-900/70">
                            <CardHeader>
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/60">
                                    <Clock className="h-6 w-6 text-emerald-600" />
                                </div>
                                <CardTitle className="text-lg">{t("project.cards.why.title")}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{t("project.cards.why.description")}</p>
                            </CardContent>
                        </Card>

                        <Card className="border-border/70 bg-background/80 text-center transition-shadow hover:shadow-lg dark:bg-zinc-900/70">
                            <CardHeader>
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/60">
                                    <Sprout className="h-6 w-6 text-emerald-600" />
                                </div>
                                <CardTitle className="text-lg">{t("project.cards.today.title")}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{t("project.cards.today.description")}</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border-border bg-emerald-50/70 dark:bg-emerald-950/20">
                        <CardHeader>
                            <CardTitle className="text-2xl text-foreground">
                                {t("technical.title")}
                            </CardTitle>
                            <CardDescription>{t("technical.description")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 text-muted-foreground">
                                <p>{t("technical.paragraphs.0")}</p>
                                <p>{t("technical.paragraphs.1")}</p>
                                <p>{t("technical.paragraphs.2")}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <Separator className="mx-auto max-w-4xl" />

            <section className="px-4 py-16">
                <div className="mx-auto max-w-4xl">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-foreground">{t("team.title")}</h2>
                    </div>

                    <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
                        <div className="shrink-0">
                            <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                                <AvatarImage src={`${AUTHOR_URL}/me/small-purple.png`} alt={AUTHOR_NAME} />
                                <AvatarFallback className="bg-emerald-600 text-2xl text-white">
                                    {AUTHOR_NAME.split(" ").map((name) => name[0]).join("")}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h3 className="mb-2 text-2xl font-bold text-foreground">{AUTHOR_NAME}</h3>
                            <p className="mb-4 text-muted-foreground">{t("team.paragraphs.0")}</p>
                            <p className="mb-4 text-muted-foreground">{t("team.paragraphs.1")}</p>

                            <div className="mb-6 flex flex-wrap justify-center gap-3 md:justify-start">
                                <Link href={AUTHOR_URL} target="_blank" rel="noopener noreferrer">
                                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                                        <Globe className="size-4" />
                                        {t("team.actions.website")}
                                    </Button>
                                </Link>
                                <Link href={`mailto:${AUTHOR_EMAIL}`}>
                                    <Button variant="outline" size="sm">
                                        <Mail className="size-4" />
                                        {t("team.actions.email")}
                                    </Button>
                                </Link>
                                <Link href={REPOSITORY_URL} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" size="sm">
                                        <Github className="size-4" />
                                        {t("team.actions.github")}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Separator className="mx-auto max-w-4xl" />

            <section className="px-4 py-16">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="mb-4 text-3xl font-bold text-foreground">{t("follow.title")}</h2>
                    <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
                        {t("follow.description")}
                    </p>

                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <Link href={REPOSITORY_URL} target="_blank" rel="noopener noreferrer">
                            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                                <Github className="mr-2 h-4 w-4" />
                                {t("follow.primaryCta")}
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
