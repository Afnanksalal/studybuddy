import React from "react";

interface Props {
  name: string;
}

const Header = ({ name }: Props) => {
  return (
    <div className="fixed top-0 left-0 w-full z-10 flex items-center h-16">
    <h1 className="text-2xl md:text-4xl font-semibold text-left bg-clip-text px-4 py-1">
    StudyBuddy
    </h1>
    </div>
  );
};

export default Header;
