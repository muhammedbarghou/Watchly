import React, { useState } from "react";
import { ThemeToggle } from "../components/theme/ThemeToggle";
import { User, Mail, Lock,MessageCircleWarning,Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { doc, setDoc } from "firebase/firestore"; 
import { db } from "../firebase"; 
import * as Dialog from "@radix-ui/react-dialog";


function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateUserId = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit string
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
      );

      const user = userCredential.user;

      const userId = generateUserId();

      await setDoc(doc(db, "users", user.uid), {
        name: formData.name,
        email: formData.email,
        userId: userId,
        createdAt: new Date(),
      });

      setSuccess();

    } catch (err) {
      setError(err.message);
    }
  };

  const handleClick = () => {
    navigate("/login");
  };

  return (
      <div className="font-[sans-serif] max-w-4xl flex items-center mx-auto md:h-screen p-4 dark:bg-transparent">
        <div className="grid md:grid-cols-3 items-center shadow-[0_2px_10px_-3px_rgba(6,81,237,0.3)] rounded-xl overflow-hidden">
          <aside className="max-md:order-1 flex flex-col justify-center space-y-16 max-md:mt-16 min-h-full bg-gradient-to-r from-[#6a040f] to-[#d00000] lg:px-8 px-4 py-4">
            <div>
              <h4 className="text-white text-lg font-semibold">Create Your Account</h4>
              <p className="text-[13px] text-gray-300 mt-3 leading-relaxed">
                Welcome to our registration page! Get started by creating your
                account.
              </p>
            </div>
            <div>
              <h4 className="text-white text-lg font-semibold">
                Simple & Secure Registration
              </h4>
              <p className="text-[13px] text-gray-300 mt-3 leading-relaxed">
                Our registration process is designed to be straightforward and
                secure. We prioritize your privacy and data security.
              </p>
            </div>
          </aside>

          <form
              onSubmit={handleSubmit}
              className="md:col-span-2 w-full py-6 px-6 sm:px-16 dark:bg-gray-950"
          >
            <div className="mb-6 flex-row">
              <h3 className="text-gray-800 text-2xl font-bold dark:text-white">
                Create an account
              </h3>
              <ThemeToggle />
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-gray-800 text-sm mb-2 block dark:text-white">
                  Name
                </label>
                <div className="relative flex items-center">
                  <input
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      className="text-gray-800 dark:text-white bg-white dark:bg-gray-900  w-full text-sm px-4 py-2.5 rounded-md "
                      placeholder="Enter name"
                  />
                  <User className={"w-4 h-4 absolute right-4 dark:text-white"} />
                </div>
              </div>

              <div>
                <label className="text-gray-800 text-sm mb-2 block dark:text-white">
                  Email
                </label>
                <div className="relative flex items-center">
                  <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="text-gray-800 dark:text-white bg-white dark:bg-gray-900  w-full text-sm px-4 py-2.5 rounded-md"
                      placeholder="Enter email"
                  />
                  <Mail className={"w-4 h-4 absolute right-4 dark:text-white"} />
                </div>
              </div>

              <div>
                <label className="text-gray-800 text-sm mb-2 block dark:text-white">
                  Password
                </label>
                <div className="relative flex items-center">
                  <input
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="text-gray-800 dark:text-white bg-white dark:bg-gray-900  w-full text-sm px-4 py-2.5 rounded-md"
                      placeholder="Enter password"
                  />
                  <Lock className={"w-4 h-4 absolute right-4 dark:text-white"} />
                </div>
              </div>

              <div className="flex items-center">
                <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 shrink-0 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                    htmlFor="remember-me"
                    className="ml-3 block text-sm text-gray-800 dark:text-white"
                >
                  I accept the Terms and Conditions
                </label>
              </div>
            </div>

            {error && 
            <Dialog.Root open={!!error} onOpenChange={() => setError(null)}>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 w-full h-full bg-black opacity-50" />
                <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] px-4 w-full max-w-lg">
                  <div className="bg-white dark:bg-gray-900 rounded-md shadow-lg px-4 py-6 sm:flex">
                    <div className="flex items-center justify-center flex-none w-12 h-12 mx-auto bg-red-100 rounded-full">
                      <MessageCircleWarning className="w-6 h-6 text-red-600"/>
                    </div>
                    <div className="mt-2 text-center sm:ml-4 sm:text-left">
                      <Dialog.Title className="text-lg font-medium text-gray-800 dark:text-white">
                        You must enter your information
                      </Dialog.Title>
                      <Dialog.Description className="mt-2 text-sm leading-relaxed text-gray-500">
                        for you to benefit from our services You must enter your informations
                      </Dialog.Description>
                      <div className="items-center gap-2 mt-3 text-sm sm:flex">
                        <Dialog.Close asChild>
                          <button className="w-full mt-2 p-2.5 flex-1 text-white bg-red-600 rounded-md ring-offset-2 ring-red-600 focus:ring-2">
                            Close
                          </button>
                        </Dialog.Close>
                      </div>
                    </div>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
            }
            {success &&
            <Dialog.Root open={!!success} onOpenChange={() => setSuccess(null)}>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 w-full h-full bg-black opacity-50" />
              <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-lg mx-auto px-4">
                <div className="bg-white rounded-md shadow-lg px-4 py-6 dark:bg-gray-900">
                  <div className=" flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full">
                    <Check className="w-6 h-6 text-green-600"/>
                  </div>
                  <Dialog.Title className="text-lg font-medium text-gray-800 text-center mt-3 dark:text-white">
                    {" "}
                    Successfully registered!
                  </Dialog.Title>
                  <Dialog.Description className="mt-1 text-sm leading-relaxed text-center text-gray-500 dark:text-gray-400">
                    Your account has been successfully created
                  </Dialog.Description>
                  <div className="items-center gap-2 mt-3 text-sm sm:flex">
                      <button onClick={() => navigate('/login')} className="w-full mt-2 p-2.5 flex-1 text-white bg-red-600 rounded-md outline-none ring-offset-2 ring-indigo-600 focus:ring-2">
                        Go to login
                      </button>
                    <Dialog.Close asChild>
                      <button
                        className="w-full mt-2 p-2.5 flex-1 text-gray-800 rounded-md outline-none border ring-offset-2 ring-indigo-600 focus:ring-2"
                        aria-label="Close"
                      >
                        Cancel
                      </button>
                    </Dialog.Close>
                  </div>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
            </Dialog.Root>
            }

            <div className="!mt-12">
              <button
                  type="submit"
                  className="w-full py-3 px-4 tracking-wider text-sm rounded-md text-white bg-gray-700 hover:bg-gray-800 focus:outline-none"
              >
                Create an account
              </button>
            </div>
            <p className="text-gray-800 text-sm mt-6 text-center dark:text-white">
              Already have an account?{" "}
              <button
                  onClick={handleClick}
                  className="text-red-600 font-semibold hover:underline ml-1"
              >
                Login here
              </button>
            </p>
          </form>
        </div>
      </div>
  );
}

export default SignUp;
