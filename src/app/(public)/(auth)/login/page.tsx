"use client";

import {LoginForm} from "@/components/form/auth/LoginForm";

export default function LoginPage() {
    return (
        <div className="flex flex-col items-center justify-center p-6 md:p-10 min-h-[50%]">
            <div className="w-full max-w-sm md:max-w-3xl">
                <LoginForm/>
            </div>
        </div>
    );
}
