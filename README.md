# tosho 図書

a random bookstore...

# ABOUT TECH I've used in this project...

DISCLAIMER: pretty strong tech opinions incoming...

- **Next.js 15** (it's annoying as there were some build errors that were bascially breaking type changes from this new verison)
- **Shadcn/Ui** (Love it, it has charts, beautiful loading state skeleton, helped to speed up the time-taking UI process)
- **Tailwind CSS** (mentioning it seprately as it's the best thing!)
- **tRPC** (love it, eliminates the need for having a seprate backend and the type integration it provides between server and client 🤌, nothing better than this...)
- **t3-env-validation** (Love Theo and the t3 stack in general but this is the best thing ever.)
- **NO ESLINT** (ik i should use it but it would've made the process very sloowwww)
- **STRIPE** (love the createCheckoutSession API it's really easy to understand and reallly well documented than before...)
- **PRISMA** (the best way to deal with databases - some problems with mysql stuff but overall i love it... that's whyy i use it everywhere...)
- **CLERK** (has made the AUTH veryx100 simple for me) (plx fix the trpc integration thing though 🤝)
- **Uploadthing** (Love it but ig the migration and error thing could be better I'll be using s3 only!)
- **v0 + claude + chatgpt** (did the boring stuff...)

## SCHEMA

### v1

- User Model:

  - Handles both admin and regular users through the Role enum
  - Connected to purchases, ratings, and cart

- Book Model:

  - Stores all book information including files and metadata
  - Many-to-many relationships with authors, tags, and genres
  - Connected to purchases, ratings, and cart items

- Purchase Model:

  - Tracks all transactions with status
  - Includes Stripe payment reference
  - Links users to their purchased books

- Cart System:

  - Separate Cart and CartItem models for better organization
  - Ensures data integrity with unique constraints

- Rating System:

  - One rating per user per book (@@unique constraint)
  - Updates the average rating in the Book model

### v1.1

- User Model:
  - removed the `name`, `email`, and `password` as not applicable
  - added the new `authId` with `@unique` trait to store up the clerk's user ID, to sync up users in clerk's db and the our db.
