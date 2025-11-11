import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {signIn} from "next-auth/react";
import {FormEvent, useState} from "react";
import {toast} from "sonner";
import {z} from "zod";

const loginFormSchema = z.object({
    email: z.string().email("Veuillez entrer une adresse email valide"),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export function LoginForm({className, ...props}: React.ComponentProps<"div">) {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [errors, setErrors] = useState<{
        email?: string;
        password?: string;
    }>({});

    const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setErrors({});

        try {
            loginFormSchema.parse({email, password});
        } catch (error) {
            if (error instanceof z.ZodError) {
                const formattedErrors: { [key: string]: string } = {};
                error.issues.forEach((err) => {
                    formattedErrors[err.path[0] as string] = err.message;
                });
                setErrors(formattedErrors);
                return;
            }
        }

        await signIn("credentials", {
            email,
            password,
            callbackUrl: "/dashboard",
            redirect: false,
        })
            .then((result) => {
                if (result?.error) {
                    setErrors({password: "Email ou mot de passe incorrect"});
                    return;
                }
                toast.success("Vous êtes connecté !");
                window.location.href = "/dashboard";
            })
            .catch((error) => {
                console.error("Sign in error", error);
                toast.error("Erreur lors de la connexion");
            });
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="overflow-hidden py-0">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form className="p-6 md:p-8" onSubmit={handleLogin}>
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col items-center text-center">
                                <h1 className="text-2xl font-bold">
                                    Bon retour parmi nous !
                                </h1>
                                <p className="text-balance text-muted-foreground">
                                    Connectez-vous à votre compte pour continuer
                                </p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={errors.email ? "border-red-500" : ""}
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500">{errors.email}</p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Mot de passe</Label>
                                    <a
                                        href="#"
                                        className="ml-auto text-sm underline-offset-2 hover:underline"
                                    >
                                        Mot de passe oublié ?
                                    </a>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={errors.password ? "border-red-500" : ""}
                                />
                                {errors.password && (
                                    <p className="text-sm text-red-500">{errors.password}</p>
                                )}
                            </div>
                            <Button type="submit" className="w-full">
                                Me connecter
                            </Button>
                            <div
                                className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                                Ou continuer avec
                                </span>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <Button variant="outline" className="w-full" disabled>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                        <path
                                            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                    <span>Connexion avec Google</span>
                                </Button>
                            </div>
                            <div className="text-center text-sm">
                                Vous n&#39;avez pas de compte ?{" "}
                                <a href="/register" className="underline underline-offset-4">
                                    Créer mon compte gratuitement
                                </a>
                            </div>
                        </div>
                    </form>
                    <div className="relative hidden bg-muted md:block">
                        <img
                            src="/assets/auth/terrarium.jpeg"
                            alt="Image"
                            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                        />
                    </div>
                </CardContent>
            </Card>
            <div
                className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
                En continuant, vous acceptez nos <a href="/terms" className="underline">Conditions
                d&#39;utilisation</a>{" "}
                et notre <a href="/privacy" className="underline">Politique de confidentialité</a>.
            </div>
        </div>
    )
}
