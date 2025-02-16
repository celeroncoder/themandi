"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { UploadDropzone } from "@/lib/uploadthing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, RouterOutputs } from "@/trpc/react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Price must be a positive number",
  }),
  pdfUrl: z.string().url("Must be a valid URL"),
  thumbnailUrl: z.string().url("Must be a valid URL"),
  publisher: z.string().min(1, "Publisher is required"),
  releaseDate: z.date(),
  authors: z.array(z.string()).min(1, "At least one author is required"),
  tags: z.array(z.string()),
  genres: z.array(z.string()).min(1, "At least one genre is required"),
});

type FormValues = z.infer<typeof formSchema>;

export const BookUpdateForm: React.FC<{
  initialBookData: RouterOutputs["book"]["getBook"];
  authors: RouterOutputs["author"]["getAll"];
  genres: RouterOutputs["genre"]["getAll"];
  tags: RouterOutputs["tag"]["getAll"];
}> = ({ initialBookData, authors, genres, tags }) => {
  const {
    data: book,
    isLoading,
    error,
  } = api.book.getBook.useQuery(
    { id: initialBookData.id },
    { initialData: initialBookData },
  );

  const { toast } = useToast();

  const trpcCtx = api.useContext();

  const updateBook = api.book.updateBook.useMutation({
    onSuccess: () => {
      trpcCtx.book.getBook.invalidate({ id: book.id });
      trpcCtx.book.getBook.refetch({ id: book.id });
      toast({
        title: "Success",
        description: "Book updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: book?.title || "",
      description: book?.description || "",
      price: book?.price.toString() || "",
      pdfUrl: book?.pdfUrl || "",
      thumbnailUrl: book?.thumbnailUrl || "",
      publisher: book?.publisher || "",
      releaseDate: book?.releaseDate || new Date(),
      authors: book?.authors.map((a) => a.id) || [],
      tags: book?.tags.map((t) => t.id) || [],
      genres: book?.genres.map((g) => g.id) || [],
    },
  });

  const onSubmit = async (data: FormValues) => {
    updateBook.mutate({
      id: initialBookData.id,
      ...data,
      price: Number(data.price),
    });
  };

  return (
    <Card className="flex-[0.5]">
      <CardHeader>
        <CardTitle>Update Book</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter book title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter book description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Enter book price"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="publisher"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Publisher</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter publisher name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="releaseDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Release Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={`w-[240px] pl-3 text-left font-normal ${
                            !field.value && "text-muted-foreground"
                          }`}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="authors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Authors</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) =>
                        field.onChange([...field.value, value])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select authors" />
                      </SelectTrigger>
                      <SelectContent>
                        {authors.map((author) => (
                          <SelectItem key={author.id} value={author.id}>
                            {author.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {field.value.map((authorId) => (
                      <Badge key={authorId} variant="secondary">
                        {authors.find((author) => author.id == authorId)?.name}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 h-4 w-4 p-0"
                          onClick={() =>
                            field.onChange(
                              field.value.filter((a) => a !== authorId),
                            )
                          }
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) =>
                        field.onChange([...field.value, value])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tags" />
                      </SelectTrigger>
                      <SelectContent>
                        {tags.map((tag) => (
                          <SelectItem key={tag.id} value={tag.id}>
                            {tag.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {field.value.map((tagId) => (
                      <Badge key={tagId} variant="secondary">
                        {tags.find((tag) => tag.id == tagId)?.name}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 h-4 w-4 p-0"
                          onClick={() =>
                            field.onChange(
                              field.value.filter((t) => t !== tagId),
                            )
                          }
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="genres"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Genres</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) =>
                        field.onChange([...field.value, value])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select genres" />
                      </SelectTrigger>
                      <SelectContent>
                        {genres.map((genre) => (
                          <SelectItem key={genre.id} value={genre.id}>
                            {genre.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {field.value.map((genreId) => (
                      <Badge key={genreId} variant="secondary">
                        {genres.find((genre) => genre.id == genreId)?.name}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 h-4 w-4 p-0"
                          onClick={() =>
                            field.onChange(
                              field.value.filter((g) => g !== genreId),
                            )
                          }
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* UploadButton for Thumbnail */}
            <FormField
              control={form.control}
              name="thumbnailUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload Thumbnail</FormLabel>
                  <FormControl>
                    <UploadDropzone
                      endpoint="imageUploader"
                      onClientUploadComplete={(res) => {
                        const url = res[0]?.url;
                        if (url) {
                          form.setValue("thumbnailUrl", url);
                          toast({
                            title: "Success",
                            description: "Thumbnail uploaded successfully",
                          });
                        }
                      }}
                      onUploadError={(error) => {
                        toast({
                          title: "Error",
                          description: error.message,
                          variant: "destructive",
                        });
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* UploadButton for PDF */}
            <FormField
              control={form.control}
              name="pdfUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload PDF</FormLabel>
                  <FormControl>
                    <UploadDropzone
                      endpoint="pdfUploader"
                      onClientUploadComplete={(res) => {
                        console.log("upload complete!", res);
                        const url = res[0]?.url;
                        if (url) {
                          form.setValue("pdfUrl", url);
                          toast({
                            title: "Success",
                            description: "PDF uploaded successfully",
                          });
                        }
                      }}
                      onUploadError={(error) => {
                        console.log("upload error!", error);
                        toast({
                          title: "Error",
                          description: error.message,
                          variant: "destructive",
                        });
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button type="submit" className="w-full">
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
