import { ReactElement } from "react";

export default function NoMatch(): ReactElement {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center mt-24 text-4xl text-[#f4f1fe]">
      <h2>404: no chog here</h2>
      <p className="text-base text-[#f4f1fe]/50 mt-2 font-mono">Uh oh! Wrong page 🐸</p>
    </div>
  );
}
