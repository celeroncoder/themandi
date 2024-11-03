import { HydrateClient } from "@/trpc/server";
import { BookTable } from "./_components/book-table";
import { BookCreateDialog } from "./_components/book-create-dialog";

export default async function UsersPage() {
  return (
    <HydrateClient>
      <section>
        <section className="flex items-center justify-between px-10 py-4">
          <p className="text-4xl font-bold">Books</p>
          <BookCreateDialog />
        </section>

        <section className="px-10 pb-4">
          <BookTable />
        </section>
      </section>
    </HydrateClient>
  );
}
