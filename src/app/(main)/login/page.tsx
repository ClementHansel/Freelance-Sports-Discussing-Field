import React from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { AdBanner } from "@/components/ads/AdBanner";

const Login = () => {
  return (
    <>
      <LoginForm />
      <AdBanner />
    </>
  );
};

export default Login;
