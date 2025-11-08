"use client";

import {RegisterForm} from "@/components/form/auth/RegisterForm";

export default function RegisterPage() {
    return (
        <div className="flex flex-col items-center justify-center p-6 md:p-10 min-h-[50%]">
            <RegisterForm className="w-full max-w-5xl"/>
        </div>
    );
}
