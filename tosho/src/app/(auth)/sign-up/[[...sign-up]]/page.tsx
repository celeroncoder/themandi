import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <SignUp
      afterSignInUrl={"/create-account"}
      afterSignUpUrl={"/create-account"}
    />
  );
}
