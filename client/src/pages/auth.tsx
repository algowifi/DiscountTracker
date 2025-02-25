import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { insertUserSchema } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [isLogin, setIsLogin] = useState(true); // Default a true per mostrare il login
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  if (user) {
    setLocation("/");
    return null;
  }

  const onSubmit = async (data: any) => {
    if (isLogin) {
      try {
        await loginMutation.mutateAsync(data);
      } catch (error: any) {
        const errorMessage = error.message || "";
        if (errorMessage.includes("401")) {
          const response = await fetch("/api/user-exists", { 
            method: "POST", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: data.username })
          });

          if (response.status === 404) {
            // Utente non esiste, passa alla registrazione
            setIsLogin(false);
            form.reset();
            toast({
              description: "Utente non trovato. Procedi con la registrazione.",
            });
          } else {
            // Password errata
            toast({
              title: "Errore di accesso",
              description: "Password non corretta. Riprova.",
              variant: "destructive",
            });
          }
        }
      }
    } else {
      await registerMutation.mutateAsync(data);
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen bg-background flex">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{isLogin ? "Accedi" : "Registrati"}</CardTitle>
            <CardDescription>
              {isLogin
                ? "Accedi per gestire gli sconti delle attività"
                : "Crea un account per iniziare"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Il tuo username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="La tua password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLogin ? "Accedi" : "Registrati"}
                </Button>
              </form>
            </Form>
            <div className="mt-4 text-center">
              <Button
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm"
              >
                {isLogin
                  ? "Non hai un account? Registrati"
                  : "Hai già un account? Accedi"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="hidden lg:flex flex-1 bg-primary/5 items-center justify-center p-8">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Gestione Sconti Attività
          </h1>
          <p className="text-lg text-muted-foreground">
            Accedi per visualizzare e gestire gli sconti disponibili per diverse attività.
            Attiva o disattiva gli sconti con un semplice click.
          </p>
        </div>
      </div>
    </div>
  );
}