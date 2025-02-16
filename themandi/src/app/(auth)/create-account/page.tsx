import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { api } from "@/trpc/server";

export default async function CreateAccountPage() {
  const { userId } = await auth();

  // PAGE ONLY ACCESIBLE TO LOGGED IN USERS DOUBLE CHECK!!
  if (!userId) {
    return redirect("/sign-in");
  }

  const data = await api.user.createUser({ authId: userId });

  if (data.id) return redirect("/");
  else return redirect("/sign-in");

  return null;
}
