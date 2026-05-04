import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {signIn} from "next-auth/react";
import {FormEvent, useState} from "react";
import Link from "next/link";
import {toast} from "sonner";
import {z} from "zod";
import {useTranslations} from "next-intl";

export function LoginForm({className, ...props}: React.ComponentProps<"div">) {
    const t = useTranslations("Auth.login");
    const validationT = useTranslations("Auth.validation");
    const commonT = useTranslations("Auth.common");
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
            const loginFormSchema = z.object({
                email: z.email(validationT("email.invalid")),
                password: z.string().min(8, validationT("password.minLength")),
            });
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
                    setErrors({password: t("errors.invalidCredentials")});
                    return;
                }
                toast.success(t("toast.success"));
                window.location.href = "/dashboard";
            })
            .catch((error) => {
                console.error("Sign in error", error);
                toast.error(t("toast.error"));
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
                                    {t("title")}
                                </h1>
                                <p className="text-balance text-muted-foreground">
                                    {t("description")}
                                </p>
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
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">{commonT("fields.password")}</Label>
                                    <Link
                                        href="#"
                                        className="ml-auto text-sm underline-offset-2 hover:underline"
                                    >
                                        {t("forgotPassword")}
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder={t("placeholders.password")}
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
                                {t("submit")}
                            </Button>
                            <div className="text-center text-sm">
                                {t("noAccount")}{" "}
                                <Link href="/register" className="underline underline-offset-4">
                                    {t("createAccount")}
                                </Link>
                            </div>
                        </div>
                    </form>
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
    )
}
