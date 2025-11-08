"use client";

import React, {useCallback, useState} from "react";
import {Check, Eye, EyeOff, X} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {cn} from "@/lib/utils";

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    label?: string;
    length?: number;
    strength?: boolean;
    confirm?: boolean;
    error?: string;
    confirmError?: string;
    onValueChange?: (value: string) => void;
    onConfirmValueChange?: (value: string) => void;
}

const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0;

    let score = password.length * 2;
    if (password.length >= 8) score += 20;
    if (/\d/.test(password)) score += 20;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 30;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 30;

    return score > 100 ? 100 : score;
};

const getStrengthColor = (strength: number): string => {
    if (strength <= 25) return "bg-red-500";
    if (strength <= 50) return "bg-orange-500";
    if (strength <= 75) return "bg-yellow-500";
    return "bg-green-500";
};

const getStrengthLabel = (strength: number): string => {
    if (strength <= 25) return "Faible";
    if (strength <= 50) return "Moyen";
    if (strength <= 75) return "Bon";
    return "Excellent";
};

export const PasswordInput = ({
                                  label = "Mot de passe",
                                  length,
                                  strength,
                                  confirm = false,
                                  error,
                                  confirmError,
                                  onValueChange,
                                  onConfirmValueChange,
                                  className,
                                  ...props
                              }: PasswordInputProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        onValueChange?.(newPassword);
    }, [onValueChange]);

    const handleConfirmPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newConfirmPassword = e.target.value;
        setConfirmPassword(newConfirmPassword);
        onConfirmValueChange?.(newConfirmPassword);
    }, [onConfirmValueChange]);

    const togglePasswordVisibility = () => setShowPassword(prev => !prev);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(prev => !prev);

    const passwordStrength = calculatePasswordStrength(password);
    const lengthProgress = length ? (password.length / length) * 100 : 0;
    const progressValue = strength && length
        ? Math.min(lengthProgress, passwordStrength)
        : strength
            ? passwordStrength
            : lengthProgress;

    const progressColor = strength
        ? getStrengthColor(passwordStrength)
        : password.length >= (length || 0)
            ? "bg-green-500"
            : "bg-yellow-500";

    return (
        <div className={cn("space-y-4", className)}>
            <div className="space-y-2">
                <Label>{label}</Label>
                <div className="relative">
                    <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={handlePasswordChange}
                        className={cn(
                            "pr-10",
                            error && "border-red-500"
                        )}
                        placeholder="Mot de passe"
                        {...props}
                    />
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4"/>
                        ) : (
                            <Eye className="h-4 w-4"/>
                        )}
                    </button>
                </div>

                {password && (length || strength) && (
                    <div className="space-y-1">
                        <div className="h-1 w-full rounded-full bg-secondary">
                            <div
                                className={cn(
                                    "h-1 rounded-full transition-all",
                                    progressColor
                                )}
                                style={{width: `${progressValue}%`}}
                            />
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            {length && (
                                <span>{password.length}/{length} caractères minimum</span>
                            )}
                            {strength && (
                                <span className="flex items-center gap-1">
                                    Force: {getStrengthLabel(passwordStrength)}
                                    {passwordStrength >= 50 ? (
                                        <Check
                                            className={`h-3 w-3 ${passwordStrength > 75 ? "text-green-500" : "text-yellow-500"}`}/>
                                    ) : (
                                        <X className="h-3 w-3 text-red-500"/>
                                    )}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            {confirm && (
                <div className="space-y-2">
                    <Label>Confirmer le mot de passe</Label>
                    <div className="relative">
                        <Input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            className={cn(
                                "pr-10",
                                confirmError && "border-red-500"
                            )}
                            placeholder="Confirmer le mot de passe"
                        />
                        <button
                            type="button"
                            onClick={toggleConfirmPasswordVisibility}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4"/>
                            ) : (
                                <Eye className="h-4 w-4"/>
                            )}
                        </button>
                    </div>
                    {confirmError && (
                        <p className="text-sm text-red-500">{confirmError}</p>
                    )}
                </div>
            )}
        </div>
    );
};