# tosho 図書

a random bookstore...

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
