import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Ghost } from "lucide-react"

export default function NotFoundPage() {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-background text-center px-6">

            <div className="z-10 flex flex-col items-center gap-6">
                <Ghost className="h-12 w-12 text-muted-foreground" />
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Page introuvable</h1>
                <p className="text-muted-foreground text-lg max-w-md">
                    Oups ! On dirait que cette page n’existe pas ou a été déplacée.
                </p>
                <Link href="/">
                    <Button variant="default">Retour à l’accueil</Button>
                </Link>
            </div>
        </div>
    )
}
