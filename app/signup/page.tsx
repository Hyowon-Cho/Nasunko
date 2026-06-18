import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "나선코 회원가입",
  description: "나선코 라운지 계정을 만드세요."
};

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
