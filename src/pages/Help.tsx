import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

function Help  ()  {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const contactInfo = [
    {
      icon: <Phone className="w-10 h-10 text-gray-400" />,
      primary: "+1-316-555-0116",
      secondary: "+1-446-526-0117"
    },
    {
      icon: <Mail className="w-10 h-10 text-gray-400" />,
      primary: "contact@example.com",
      secondary: "hr@example.com"
    },
    {
      icon: <MapPin className="w-10 h-10 text-gray-400" />,
      primary: "8502 Preston Rd. Ingle, Maine 98380, USA",
      secondary: ""
    }
  ];

  return (
    <MainLayout>
      <section className="py-10 bg-gray-100 sm:py-16 lg:py-24 dark:bg-netflix-black">
        <div className="px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
          <motion.div 
            className="max-w-2xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.h2 
              className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl dark:text-white"
              variants={itemVariants}
            >
              Contact us
            </motion.h2>
            <motion.p 
              className="max-w-xl mx-auto mt-4 text-base leading-relaxed text-gray-500 dark:text-white"
              variants={itemVariants}
            >
              We are here to help and answer any question you might have. We look forward to hearing from
            </motion.p>
          </motion.div>

          <div className="max-w-5xl mx-auto mt-12 sm:mt-16">
            <motion.div 
              className="grid grid-cols-1 gap-6 px-8 text-center md:px-0 md:grid-cols-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {contactInfo.map((info, index) => (
                <motion.div 
                  key={index}
                  variants={itemVariants}
                >
                  <Card>
                    <CardContent className="p-6 flex flex-col items-center">
                      {info.icon}
                      <p className="mt-6 text-lg font-medium dark:text-gray-50">{info.primary}</p>
                      {info.secondary && (
                        <p className="mt-1 text-lg font-medium dark:text-gray-100">{info.secondary}</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            <motion.div 
              className="mt-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <Card>
                <CardContent className="px-6 py-12 sm:p-12">
                  <CardHeader>
                    <CardTitle className="text-3xl font-semibold text-center">Send us a message</CardTitle>
                  </CardHeader>

                  <form onSubmit={(e) => e.preventDefault()} className="mt-14">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                      <motion.div variants={itemVariants}>
                        <Label htmlFor="name">Your name</Label>
                        <Input 
                          id="name"
                          type="text"
                          placeholder="Enter your full name"
                          className="mt-2.5"
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <Label htmlFor="email">Email address</Label>
                        <Input 
                          id="email"
                          type="email"
                          placeholder="Enter your email address"
                          className="mt-2.5"
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <Label htmlFor="phone">Phone number</Label>
                        <Input 
                          id="phone"
                          type="tel"
                          placeholder="Enter your phone number"
                          className="mt-2.5"
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <Label htmlFor="company">Company name</Label>
                        <Input 
                          id="company"
                          type="text"
                          placeholder="Enter your company name"
                          className="mt-2.5"
                        />
                      </motion.div>

                      <motion.div variants={itemVariants} className="sm:col-span-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea 
                          id="message"
                          placeholder="Type your message here"
                          className="mt-2.5"
                          rows={4}
                        />
                      </motion.div>

                      <motion.div variants={itemVariants} className="sm:col-span-2">
                        <Button 
                          type="submit" 
                          className="w-full"
                        >
                          Send
                        </Button>
                      </motion.div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Help;