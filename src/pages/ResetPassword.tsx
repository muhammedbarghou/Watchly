import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { ToastAction } from "../components/ui/toast";
import { Toaster } from "../components/ui/toaster";

const formSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
});

type FormValues = z.infer<typeof formSchema>;

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isEmailSent, setIsEmailSent] = React.useState<boolean>(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError("");

    try {
      await sendPasswordResetEmail(auth, data.email);
      setIsEmailSent(true);
      toast({
        title: "Reset email sent",
        description: "Check your inbox for the password reset link",
        action: (
          <ToastAction altText="Try again" onClick={() => form.reset()}>
            Try again
          </ToastAction>
        ),
      });
    } catch (error: any) {
      let message = "Failed to send reset email";
      
      switch (error.code) {
        case "auth/user-not-found":
          message = "No account found with this email";
          break;
        case "auth/invalid-email":
          message = "Invalid email address";
          break;
        case "auth/too-many-requests":
          message = "Too many attempts. Please try again later";
          break;
        default:
          message = error.message;
      }
      
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-netflix-black p-4">
      <Card className="w-full max-w-md bg-netflix-gray border border-netflix-red">
        <CardHeader>
          <Button
            variant="link"
            className="w-fit h-fit p-0 mb-4 text-white"
            onClick={() => navigate("/login")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to login
          </Button>
          <CardTitle className="text-2xl text-white">Reset Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your
            password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isEmailSent ? (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  Reset instructions have been sent to your email address. Please
                  check your inbox and follow the link to reset your password.
                </AlertDescription>
              </Alert>
              <Button
                variant="outline"
                className="w-full text-white"
                onClick={() => {
                  setIsEmailSent(false);
                  form.reset();
                }}
              >
                Send another email
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 text-netflic-red">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your email address"
                          type="email"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Reset Link
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            variant="link"
            className="text-sm text-netflix-red"
            onClick={() => navigate("/login")}
          >
            Remember your password? Login
          </Button>
        </CardFooter>
      </Card>
      <Toaster />
    </div>
  );
}