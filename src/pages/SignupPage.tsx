import { SignForm } from "@/components/auth/signp-form";
import logo from '@/assets/LogoLini.png';
import bg from '@/assets/bg-3.jpeg'


export  function SignupPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-netflix-black">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start ">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary ">
              <img src={logo} className="h-6" alt="" />
            </div>
            <span className="text-white">Watchly</span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src={bg}
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
