import { api, HydrateClient } from "@/trpc/server";
import { ProductViewCard } from "./_components/product-view-card";
import { ProductUpdateForm } from "./_components/update-product-form";

export default async function ProductDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [productsResponse, farmers, categories, tags] = await Promise.all([
    api.product.getProducts({
      limit: 1,
      cursor: params.id,
    }),
    api.farmer.getAll(),
    api.category.getAll(),
    api.tag.getAll(),
  ]);

  const product = productsResponse.products[0];

  if (!product) return <div>Product Not Found!</div>;

  const formattedFarmers = farmers.map(({ id, name }) => ({
    id,
    name,
  }));

  return (
    <HydrateClient>
      <section className="w-full px-10">
        <section className="flex items-center justify-between py-4">
          <p className="text-4xl font-bold">{product.title}</p>
        </section>

        <section className="flex w-[1024px] flex-wrap items-start justify-between gap-10">
          <ProductViewCard initialProductData={product} />
          <ProductUpdateForm
            initialProductData={product}
            farmers={formattedFarmers}
            categories={categories}
            tags={tags}
          />
        </section>
      </section>
    </HydrateClient>
  );
}
