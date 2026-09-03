import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-app min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-3 py-6 sm:px-4">
        <main className="flex flex-1 items-center py-8">{children}</main>
      </div>
    </div>
  );
}
