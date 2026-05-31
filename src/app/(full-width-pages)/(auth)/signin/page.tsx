import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SignIn Page | OCT",
  description: "Office du Commerce de la Tunisie",
};

export default function SignIn() {
  return <SignInForm />;
}
