"use client";
import React from "react";

export const ArchivedFilesList = ({ archivedFiles }) => {
  return (
    <div>
      <h1 className="p-2 text-xl">
        {archivedFiles.length} files have been archived successfully! 🎉
      </h1>
      <button className="modal-btn text-primary-accent p-2 rounded-2xl bg-btn-primary hover:bg-primary-accent hover:text-secondary w-full">
        Retrieve Archived Files
      </button>
    </div>
  );
};
