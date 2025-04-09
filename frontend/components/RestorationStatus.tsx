import Link from "next/link";
import React from "react";

export const RestorationStatus = () => {
  return (
    <div>
      <h1 className="p-2 text-xl">
        Hang tight! We&apos;ll shoot you an email as soon as your files are
        ready to go! 😊
      </h1>
      <Link href={"/"} className="text-center">
        <div className="modal-btn text-primary-accent p-2 rounded-2xl bg-btn-primary hover:bg-primary-accent hover:text-secondary">
          Go Back
        </div>
      </Link>
    </div>
  );
};
