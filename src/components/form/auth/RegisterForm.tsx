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
import Link from "next/link";
import {useTranslations} from "next-intl";


export function RegisterForm({className, ...props}: React.ComponentProps<"div">) {
    const t = useTranslations("Auth.register");
    const validationT = useTranslations("Auth.validation");
    const commonT = useTranslations("Auth.common");
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
            const registerFormSchema = z.object({
                name: z.string().min(2, validationT("name.minLength")),
                email: z.string().email(validationT("email.invalid")),
                password: z.string()
                    .min(8, validationT("password.minLength"))
                    .regex(/[A-Z]|[0-9]/, validationT("password.uppercaseOrNumber")),
                confirmPassword: z.string()
            }).refine((data) => data.password === data.confirmPassword, {
                message: validationT("password.confirmMismatch"),
                path: ["confirmPassword"],
            });
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
                    setErrors({email: t("errors.emailExists")});
                    return;
                }
                throw new Error();
            }

            toast.success(t("toast.success"));
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
                return;
            }
            toast.error(t("toast.error"));
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="overflow-hidden py-0">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <div className="p-6 md:p-8">
                        <div className="flex flex-col items-center text-center">
                            <h1 className="text-2xl font-bold">
                                {t("title")}
                            </h1>
                            <p className="text-balance text-muted-foreground">
                                {t("description")}
                            </p>
                        </div>

                        <Separator className="my-5"/>

                        <form onSubmit={handleRegister}>
                            <div className="flex flex-col gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">{commonT("fields.name")}</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder={t("placeholders.name")}
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
                                    <Label htmlFor="email">{commonT("fields.email")}</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder={t("placeholders.email")}
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
                                    label={commonT("fields.password")}
                                    error={errors.password}
                                    confirmError={errors.confirmPassword}
                                    onValueChange={setPassword}
                                    onConfirmValueChange={setConfirmPassword}
                                    required
                                />

                                <Button type="submit" className="w-full">
                                    {t("submit")}
                                </Button>
                                <div className="text-center text-sm">
                                    {t("alreadyHaveAccount")}{" "}
                                    <Link href="/login" className="underline underline-offset-4">
                                        {t("signIn")}
                                    </Link>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div className="relative hidden bg-muted md:block">
                        <img
                            src="/assets/auth/terrarium.jpeg"
                            alt={commonT("imageAlt")}
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
