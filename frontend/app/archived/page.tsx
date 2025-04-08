import { ArchivedFilesList } from "@/components/ArchivedFilesList";
import { RestorationComplete } from "@/components/RestorationComplete";
import { RestorationStatus } from "@/components/RestorationStatus";

import React from "react";

const ArchivedPage = async () => {
  const data = await fetch(
    process.env.NEXT_PUBLIC_API_URL +
      `/upload/list-of-files?email=${process.env.NEXT_PUBLIC_EMAIL}`
  );
  const files = await data.json();
  console.log(files);
  return (
    <section className="flex flex-col items-center justify-center ">
      <div className="mt-32 bg-secondary text-primary-accent rounded-2xl">
        <ArchivedFilesList archivedFiles={files ?? []} />

        <RestorationStatus />

        <RestorationComplete />
      </div>
    </section>
  );
};

export default ArchivedPage;
