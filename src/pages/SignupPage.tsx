import { SignForm } from "@/components/auth/signp-form";
import logo from '@/assets/logo.png';


export  function SignupPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-netflix-black">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start ">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="flex items-center justify-center rounded-md ">
              <img src={logo} className="h-6" alt="" />
            </div>
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
          src="https://images.pexels.com/photos/7991182/pexels-photo-7991182.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover "
        />
      </div>
    </div>
  )
}
