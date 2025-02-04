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
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { ArrowLeft, Loader2, Mail, AlertCircle } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { ToastAction } from "../components/ui/toast";
import { Toaster } from "../components/ui/toaster";
import { motion } from "framer-motion";

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
        title: "Reset email sent successfully",
        description: "Check your inbox for the password reset link",
        action: (
          <ToastAction altText="Try again" onClick={() => form.reset()}>
            Send again
          </ToastAction>
        ),
      });
    } catch (error: any) {
      let message = "Failed to send reset email";
      
      switch (error.code) {
        case "auth/user-not-found":
          message = "No account found with this email address";
          break;
        case "auth/invalid-email":
          message = "Please enter a valid email address";
          break;
        case "auth/too-many-requests":
          message = "Too many attempts. Please try again in a few minutes";
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-netflix-black to-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="bg-gray-900/90 border border-gray-800 backdrop-blur-sm shadow-xl">
          <CardHeader className="space-y-4">
            <Button
              variant="ghost"
              className="w-fit h-fit p-2 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors rounded-full"
              onClick={() => navigate("/login")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-white">
                Reset Password
              </CardTitle>
              <CardDescription className="text-gray-400">
                Enter your email address and we'll send you instructions to reset your
                password.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <Alert variant="destructive" className="border-red-900/50 bg-red-900/10">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            {isEmailSent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <Alert className="border-green-600/50 bg-green-600/10">
                  <Mail className="h-4 w-4 text-green-500" />
                  <AlertTitle className="text-green-500">Check your inbox</AlertTitle>
                  <AlertDescription className="text-gray-300">
                    Reset instructions have been sent to your email address. Please
                    check your inbox and follow the link to reset your password.
                  </AlertDescription>
                </Alert>
                <Button
                  variant="outline"
                  className="w-full text-white border-gray-700 hover:bg-gray-800 hover:text-white transition-colors"
                  onClick={() => {
                    setIsEmailSent(false);
                    form.reset();
                  }}
                >
                  Send another email
                </Button>
              </motion.div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">Email address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="name@example.com"
                            type="email"
                            disabled={isLoading}
                            className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:ring-red-500/50 focus:border-red-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending Reset Link...
                      </div>
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
              className="text-sm text-gray-400 hover:text-red-500 transition-colors"
              onClick={() => navigate("/login")}
            >
              Remember your password? Login instead
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
      <Toaster />
    </div>
  );
}