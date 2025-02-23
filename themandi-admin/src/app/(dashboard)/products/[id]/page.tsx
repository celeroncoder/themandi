import { api, HydrateClient } from "@/trpc/server";
import { BookViewCard } from "./_components/book-view-card";
import { BookUpdateForm } from "./_components/update-book-form";

export default async function BookDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const authors = await api.author.getAll();
  const tags = await api.tag.getAll();
  const genres = await api.genre.getAll();

  const book = await api.book.getBook({ id: params.id });

  if (!book) return <div>Book Not Found!</div>;

  return (
    <HydrateClient>
      <section className="w-full px-10">
        <section className="flex items-center justify-between py-4">
          <p className="text-4xl font-bold">{book.title}</p>
        </section>

        <section className="flex w-[1024px] flex-wrap items-start justify-between gap-10">
          <BookViewCard initialBookData={book} />
          <BookUpdateForm
            initialBookData={book}
            authors={authors}
            genres={genres}
            tags={tags}
          />
        </section>
      </section>
    </HydrateClient>
  );
}
