"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Wallet, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginValues) {
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: "Error de autenticación",
          description: "Credenciales incorrectas. Inténtalo de nuevo.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión correctamente.",
        });
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un problema inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleForgotPassword = () => {
    toast({
      title: "Recuperar contraseña",
      description: "Esta funcionalidad estará disponible pronto. Por ahora, contacta con soporte.",
    });
  };

  return (
    <Card className="premium-card w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 flex flex-col items-center">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-4 text-primary">
          <Wallet className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold font-outfit text-center flex flex-col items-center leading-tight">
          <span className="text-muted-foreground text-lg font-medium">Acceso a</span>
          <span className="gradient-gold text-3xl">Anclora Personal Budget</span>
        </CardTitle>
        <CardDescription className="text-center pt-2">
          Introduce tus datos para gestionar tus finanzas
        </CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="nombre@ejemplo.com"
              {...form.register("email")}
              className="rounded-lg h-11"
            />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contraseña</Label>
              <Button 
                variant="link" 
                className="px-0 font-normal text-xs text-primary hover:text-primary/80" 
                type="button"
                onClick={handleForgotPassword}
              >
                ¿Olvidaste tu contraseña?
              </Button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...form.register("password")}
                className="rounded-lg h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-4">
          <Button 
            type="submit" 
            className="w-full rounded-lg py-6 font-outfit text-lg premium-shadow transition-all duration-300" 
            disabled={loading}
          >
            {loading ? "Iniciando sesión..." : "Entrar →"}
          </Button>
          <div className="text-sm text-center text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Crear una ahora
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
