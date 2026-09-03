import { Link } from "react-router-dom";
import BrandLogo from "@/components/branding/BrandLogo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="bg-app flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <BrandLogo size="large" withWordmark />
      <h1 className="mt-8 text-3xl font-bold">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">That route is not part of iTeach iFuntology.</p>
      <Button className="mt-6" asChild>
        <Link to="/login">Back to sign in</Link>
      </Button>
    </div>
  );
}
