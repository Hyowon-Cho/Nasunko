import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "나선코 로그인",
  description: "나선코 라운지 계정으로 로그인하세요."
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
