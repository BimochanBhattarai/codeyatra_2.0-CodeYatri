import NonAuthenticatedWrapper from "@/components/global/NonAuthenticatedWrapper";

export default function AuthLayout({ children }) {
  return <NonAuthenticatedWrapper>{children}</NonAuthenticatedWrapper>;
}
