import React from "react";

interface Props {
  name: string;
}

const Header = ({ name }: Props) => {
  return (
    <div className="fixed top-2 left-2 z-10 flex items-center">
    <h1 className="text-2xl md:text-4xl font-semibold bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-100 text-center sm:text-left bg-clip-text text-transparent px-4 py-1">
    StudyBuddy
    </h1>
    </div>
  );
};

export default Header;
