"use client";

import {useState} from "react";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {toast} from "sonner";
import SaveSubmitButton from "@/components/form/SaveSubmitButton";

const schema = z
    .object({
        currentPassword: z.string().min(6, "Mot de passe actuel trop court"),
        newPassword: z.string().min(8, "Le nouveau mot de passe doit faire 8 caractères minimum"),
        confirmNewPassword: z.string().min(8),
    })
    .refine((vals) => vals.newPassword === vals.confirmNewPassword, {
        message: "Les mots de passe ne correspondent pas",
        path: ["confirmNewPassword"],
    });

export function PasswordChangeForm() {
    const [loading, setLoading] = useState(false);
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof schema>) => {
        setLoading(true);
        try {
            const res = await fetch("/api/account/change-password", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    currentPassword: values.currentPassword,
                    newPassword: values.newPassword,
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data?.error || "Une erreur est survenue");
            }
            toast.success("Mot de passe mis à jour");
            form.reset();
        } catch (e: any) {
            toast.error(e.message || "Impossible de changer le mot de passe");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl font-semibold tracking-tight">Sécurité</h2>
                <p className="text-sm text-muted-foreground">Changez votre mot de passe.</p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
                    <FormField
                        control={form.control}
                        name="currentPassword"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Mot de passe actuel</FormLabel>
                                <FormControl>
                                    <Input type="password" autoComplete="current-password" {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="newPassword"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Nouveau mot de passe</FormLabel>
                                <FormControl>
                                    <Input type="password" autoComplete="new-password" {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="confirmNewPassword"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Confirmer le mot de passe</FormLabel>
                                <FormControl>
                                    <Input type="password" autoComplete="new-password" {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <div className="flex gap-2">
                        <SaveSubmitButton pending={loading} />
                    </div>
                </form>
            </Form>
        </div>
    );
}
