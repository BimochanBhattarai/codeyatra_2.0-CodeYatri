import AuthenticatedWrapper from "@/components/global/AuthenticatedWrapper";
import Hero from "./components/Hero";

const page = () => {
  return (
    <AuthenticatedWrapper>
      <Hero />
    </AuthenticatedWrapper>
  );
};

export default page;
