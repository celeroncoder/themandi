import { HydrateClient } from "@/trpc/server";
import { ProductTable } from "./_components/product-table";
import { ProductCreateDialog } from "./_components/product-create-dialog";

export default async function UsersPage() {
  return (
    <HydrateClient>
      <section className="w-full max-w-screen-lg">
        <section className="flex items-center justify-between px-10 py-4">
          <p className="text-4xl font-bold">Products</p>
          <ProductCreateDialog />
        </section>

        <section className="min-w-full max-w-screen-md px-10 pb-4">
          <ProductTable />
        </section>
      </section>
    </HydrateClient>
  );
}
