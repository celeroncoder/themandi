import { HydrateClient } from "@/trpc/server";
import { UserTable } from "./_components/user-table";

export default async function UsersPage() {
  return (
    <HydrateClient>
      <section>
        <section className="px-10 py-4">
          <p className="text-4xl font-bold">Users</p>
        </section>

        <section className="px-10 pb-4">
          <UserTable />
        </section>
      </section>
    </HydrateClient>
  );
}
