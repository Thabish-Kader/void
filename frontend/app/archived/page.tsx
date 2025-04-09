import React from "react";

import { ArchivedFilesList } from "@/components/ArchivedFilesList";

const ArchivedPage = async () => {
  const res = await fetch(
    process.env.NEXT_PUBLIC_API_URL +
      `/upload/list-of-files?email=${process.env.NEXT_PUBLIC_EMAIL}`
  );
  const files = await res.json();

  return (
    <section className="flex flex-col items-center justify-center ">
      <div className="mt-32 bg-secondary text-primary-accent rounded-2xl">
        <ArchivedFilesList archivedFiles={files ?? []} />
      </div>
    </section>
  );
};

export default ArchivedPage;
