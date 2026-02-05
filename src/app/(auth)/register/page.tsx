import { RegisterForm } from "@/components/features/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-dot-pattern">
      {/* Background purely aesthetic elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <RegisterForm />
      </div>
      
      <p className="mt-8 text-sm text-muted-foreground animate-in fade-in duration-1000 delay-500">
        &copy; {new Date().getFullYear()} Anclora Personal Budget. Todos los derechos reservados.
      </p>
    </div>
  );
}
