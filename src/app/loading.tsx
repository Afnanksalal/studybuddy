import React from "react";

const loading = () => {
  return (
    <div className="flex gap-2 text-xl md:text-4xl flex-col w-full min-h-screen items-center justify-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div>
  );
};

export default loading;
