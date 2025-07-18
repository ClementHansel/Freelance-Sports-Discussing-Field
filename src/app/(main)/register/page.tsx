"use client";
import React, { Suspense } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function Register() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading form...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
