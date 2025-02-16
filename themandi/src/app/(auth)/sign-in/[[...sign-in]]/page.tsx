import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <SignIn
      afterSignInUrl={"/create-account"}
      afterSignUpUrl={"/create-account"}
    />
  );
}
