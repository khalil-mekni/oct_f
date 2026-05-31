import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SignUp Page | OCT",
  description: "Office du Commerce de la Tunisie",
};

export default function SignUp() {
  return <SignUpForm />;
}
