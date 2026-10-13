import type { Metadata } from "next";
import { emptyListingValues } from "@/lib/listings/types";
import { ListingForm } from "../listing-form";

export const metadata: Metadata = { title: "Share food | ResQfood" };

export default function NewListingPage() {
  return (
    <main>
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight">Share food</h1>
      <ListingForm initial={emptyListingValues()} />
    </main>
  );
}
