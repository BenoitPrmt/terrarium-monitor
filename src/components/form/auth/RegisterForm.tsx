import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {FormEvent, useState} from "react"
import {toast} from "sonner"
import {z} from "zod"
import {Separator} from "@/components/ui/separator";
import {PasswordInput} from "@/components/form/PasswordInput";

const registerFormSchema = z.object({
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("Veuillez entrer une adresse email valide"),
    password: z.string()
        .min(8, "Le mot de passe doit contenir au moins 8 caractères")
        .regex(/[A-Z]?|[0-9]?/, "Le mot de passe doit contenir au moins une majuscule ou un chiffre"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
});


export function RegisterForm({className, ...props}: React.ComponentProps<"div">) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<{
        name?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
    }>({});

    const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrors({});

        try {
            registerFormSchema.parse({
                name,
                email,
                password,
                confirmPassword
            });

            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                if (data.error === 'email_exists') {
                    setErrors({email: "Cette adresse email est déjà utilisée"});
                    return;
                }
                throw new Error();
            }

            toast.success("Compte créé avec succès !");
            window.location.href = "/login";
        } catch (error) {
            if (error instanceof z.ZodError) {
                const formattedErrors: { [key: string]: string } = {};
                error.issues.forEach((issue) => {
                    if (issue.path.length) {
                        formattedErrors[issue.path[0] as string] = issue.message;
                    }
                });
                setErrors(formattedErrors);
            }
            toast.error("Erreur lors de la création du compte");
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="overflow-hidden py-0">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <div className="p-6 md:p-8">
                        <div className="flex flex-col items-center text-center">
                            <h1 className="text-2xl font-bold">
                                Créer votre compte
                            </h1>
                            <p className="text-balance text-muted-foreground">
                                Créez un compte pour configurer vos capteurs et dashboards.
                            </p>
                        </div>

                        <Separator className="my-5"/>

                        <form onSubmit={handleRegister}>
                            <div className="flex flex-col gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nom</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="John Doe"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className={errors.name ? "border-red-500" : ""}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500">{errors.name}</p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="prenom.nom@ecole.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={errors.email ? "border-red-500" : ""}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-500">{errors.email}</p>
                                    )}
                                </div>

                                <PasswordInput
                                    length={8}
                                    strength
                                    confirm
                                    error={errors.password}
                                    confirmError={errors.confirmPassword}
                                    onValueChange={setPassword}
                                    onConfirmValueChange={setConfirmPassword}
                                    required
                                />

                                <Button type="submit" className="w-full">
                                    Créer mon compte
                                </Button>
                                <div className="text-center text-sm">
                                    Vous avez déjà un compte ?{" "}
                                    <a href="/login" className="underline underline-offset-4">
                                        Me connecter
                                    </a>
                                </div>
                            </div>
                        </form>
                    </div>
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
                En continuant, vous acceptez nos <a href="/terms">Conditions d'utilisation</a>{" "}
                et notre <a href="/privacy">Politique de confidentialité</a>.
            </div>
        </div>
    );
}
