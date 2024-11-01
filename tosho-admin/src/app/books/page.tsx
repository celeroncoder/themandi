import { HydrateClient } from "@/trpc/server";
import { BookTable } from "./_components/book-table";

export default async function UsersPage() {
  return (
    <HydrateClient>
      <section>
        <section className="px-10 py-4">
          <p className="text-4xl font-bold">Books</p>
        </section>

        <section className="px-10 pb-4">
          <BookTable />
        </section>
      </section>
    </HydrateClient>
  );
}
