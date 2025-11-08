"use client";

import {useState} from "react";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button} from "@/components/ui/button";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {toast} from "sonner";

const schema = z.object({
    name: z.string().min(2, "Votre nom doit comporter au moins 2 caractères"),
    email: z.string().email("Email invalide"),
});

export function AccountSettingsForm({
                                        defaultValues,
                                    }: {
    defaultValues: z.infer<typeof schema>;
}) {
    const [loading, setLoading] = useState(false);
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues,
    });

    const onSubmit = async (values: z.infer<typeof schema>) => {
        setLoading(true);
        try {
            const res = await fetch("/api/account/update", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(values),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data?.error || "Une erreur est survenue");
            }
            toast.success("Profil mis à jour");
        } catch (e: any) {
            toast.error(e.message || "Impossible de mettre à jour le profil");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl font-semibold tracking-tight">Informations</h2>
                <p className="text-sm text-muted-foreground">Modifiez votre nom et votre email.</p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Nom</FormLabel>
                                <FormControl>
                                    <Input placeholder="Votre nom" {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="vous@exemple.com" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Votre email de connexion.
                                </FormDescription>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <div className="flex gap-2">
                        <Button type="submit" disabled={loading}>
                            {loading ? "Enregistrement..." : "Enregistrer"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
