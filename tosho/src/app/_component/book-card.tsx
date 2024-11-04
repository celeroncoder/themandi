import { currencyFormatter } from "@/lib/utils";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RouterOutputs } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";

export const BookCard: React.FC<{
  book: RouterOutputs["book"]["getBooks"]["books"][number];
}> = ({ book }) => {
  return (
    <Card key={book.id} className="max-h-fit">
      <CardHeader>
        <CardTitle className="line-clamp-2 capitalize">{book.title}</CardTitle>
        <Image
          src={book.thumbnailUrl || "/images/book-cover.png"}
          alt={book.title}
          height={192}
          width={256}
          className="mb-4 h-48 w-full rounded-md object-cover"
        />
      </CardHeader>
      <CardContent>
        <p className="mb-2 text-sm text-gray-600">
          by {book.authors.map((a) => a.name).join(", ")}
        </p>
        <div className="mb-2 text-sm text-gray-500">
          Genres:{" "}
          {book.genres.map((genre) => (
            <Badge variant={"outline"} key={genre.id} className="mb-1 mr-2">
              {genre.name}
            </Badge>
          ))}
        </div>
        <div className="mb-2 text-sm text-gray-500">
          Tags:{" "}
          {book.tags.map((tag) => (
            <Badge variant={"secondary"} key={tag.id} className="mb-1 mr-2">
              {tag.name}
            </Badge>
          ))}
        </div>
        <p className="text-lg font-bold">
          {/* @ts-ignore */}
          {currencyFormatter.format(book.price)}.00
        </p>
      </CardContent>
      <CardFooter>
        <Button className="w-full">
          <ShoppingCart /> <span className="mt-px">Add to Cart</span>
        </Button>
      </CardFooter>
    </Card>
  );
};
