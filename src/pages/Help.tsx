import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Check, AlertCircle, ArrowRight, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import MainLayout from '@/components/layout/MainLayout';
import { TranslatedText } from '@/hooks/useTranslation';
import { useAppSelector } from '@/store/Store';
import { selectIsTranslationAvailable } from '@/slices/languageSlice';

function Help() {
  const isTranslationAvailable = useAppSelector(selectIsTranslationAvailable);
  
  // Form state
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    subject: 'General Inquiry' // Default subject
  });
  
  const [formStatus, setFormStatus] = useState<{ 
    submitted: boolean, 
    loading: boolean, 
    success: boolean, 
    error: string | null 
  }>({ 
    submitted: false, 
    loading: false, 
    success: false, 
    error: null 
  });
  
  const [activeTab, setActiveTab] = useState("contact");
  const formRef = useRef<HTMLDivElement>(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.6 }
    }
  };

  // Contact information with hover effects
  const contactInfo = [
    {
      icon: <Phone className="w-10 h-10" />,
      title: isTranslationAvailable ? <TranslatedText text="Call Us" /> : "Call Us",
      primary: "+1-316-555-0116",
      secondary: "+1-446-526-0117",
      color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
      available: isTranslationAvailable ? <TranslatedText text="24/7 Support" /> : "24/7 Support"
    },
    {
      icon: <Mail className="w-10 h-10" />,
      title: isTranslationAvailable ? <TranslatedText text="Email Us" /> : "Email Us",
      primary: "contact@example.com",
      secondary: "support@example.com",
      color: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
      available: isTranslationAvailable ? <TranslatedText text="Responses within 24hrs" /> : "Responses within 24hrs"
    },
    {
      icon: <MapPin className="w-10 h-10" />,
      title: isTranslationAvailable ? <TranslatedText text="Visit Us" /> : "Visit Us",
      primary: "8502 Preston Rd.",
      secondary: "Ingle, Maine 98380, USA",
      color: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
      available: isTranslationAvailable ? <TranslatedText text="Mon-Fri: 9AM-5PM" /> : "Mon-Fri: 9AM-5PM"
    }
  ];

  // FAQ data
  const faqItems = [
    {
      question: isTranslationAvailable ? 
        <TranslatedText text="How do I join a watch party?" /> : 
        "How do I join a watch party?",
      answer: isTranslationAvailable ? 
        <TranslatedText text="To join a watch party, you need the room ID from the host. Enter this ID on our homepage and click 'Join Room'. You'll need to be logged in to participate in the watch party experience." /> : 
        "To join a watch party, you need the room ID from the host. Enter this ID on our homepage and click 'Join Room'. You'll need to be logged in to participate in the watch party experience."
    },
    {
      question: isTranslationAvailable ? 
        <TranslatedText text="Can I control the video playback?" /> : 
        "Can I control the video playback?",
      answer: isTranslationAvailable ? 
        <TranslatedText text="Only the host of the watch party can control video playback. This ensures everyone stays synchronized. If you're the host, you'll have full playback controls including play, pause, and seeking." /> : 
        "Only the host of the watch party can control video playback. This ensures everyone stays synchronized. If you're the host, you'll have full playback controls including play, pause, and seeking."
    },
    {
      question: isTranslationAvailable ? 
        <TranslatedText text="What types of videos can be watched?" /> : 
        "What types of videos can be watched?",
      answer: isTranslationAvailable ? 
        <TranslatedText text="Our platform supports a wide range of video sources including YouTube, Vimeo, and direct video file URLs. The host simply needs to paste the video URL when creating the room." /> : 
        "Our platform supports a wide range of video sources including YouTube, Vimeo, and direct video file URLs. The host simply needs to paste the video URL when creating the room."
    },
    {
      question: isTranslationAvailable ? 
        <TranslatedText text="Is there a limit to how many people can join a watch party?" /> : 
        "Is there a limit to how many people can join a watch party?",
      answer: isTranslationAvailable ? 
        <TranslatedText text="Standard rooms can accommodate up to 25 simultaneous viewers. For larger events, please contact our support team to arrange special accommodations." /> : 
        "Standard rooms can accommodate up to 25 simultaneous viewers. For larger events, please contact our support team to arrange special accommodations."
    },
    {
      question: isTranslationAvailable ? 
        <TranslatedText text="How do I report inappropriate content or behavior?" /> : 
        "How do I report inappropriate content or behavior?",
      answer: isTranslationAvailable ? 
        <TranslatedText text="You can report any concerns by clicking the 'Report' option in the room options menu, or by contacting our support team directly via this contact form." /> : 
        "You can report any concerns by clicking the 'Report' option in the room options menu, or by contacting our support team directly via this contact form."
    }
  ];

  // Handle form input changes
  const handleInputChange = (e: { target: { id: any; value: any; }; }) => {
    const { id, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    
    // Form validation
    if (!formState.name || !formState.email || !formState.message) {
      const errorMessage = "Please fill out all required fields.";
      setFormStatus({
        submitted: true,
        loading: false,
        success: false,
        error: errorMessage
      });
      return;
    }
    
    // Simulate API call
    setFormStatus({
      submitted: true,
      loading: true,
      success: false,
      error: null
    });
    
    try {
      // Simulated API response delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success
      setFormStatus({
        submitted: true,
        loading: false,
        success: true,
        error: null
      });
      
      // Reset form after success
      setTimeout(() => {
        setFormState({
          name: '',
          email: '',
          phone: '',
          company: '',
          message: '',
          subject: 'General Inquiry'
        });
        
        setFormStatus({
          submitted: false,
          loading: false,
          success: false,
          error: null
        });
      }, 5000);
      
    } catch (error) {
      const errorMessage = "There was an error sending your message. Please try again.";
      setFormStatus({
        submitted: true,
        loading: false,
        success: false,
        error: errorMessage
      });
    }
  };

  // Scroll to form function
  const scrollToForm = () => {
    setActiveTab("contact");
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Subject options with translation
  const subjectOptions = [
    isTranslationAvailable ? <TranslatedText text="General Inquiry" /> : "General Inquiry",
    isTranslationAvailable ? <TranslatedText text="Technical Support" /> : "Technical Support",
    isTranslationAvailable ? <TranslatedText text="Billing Question" /> : "Billing Question",
    isTranslationAvailable ? <TranslatedText text="Feature Request" /> : "Feature Request",
    isTranslationAvailable ? <TranslatedText text="Report an Issue" /> : "Report an Issue"
  ];

  return (
    <MainLayout>
      <section className="py-12 bg-gradient-to-b from-gray-50 to-white sm:py-16 lg:py-24 dark:from-gray-950 dark:to-netflix-black">
        <div className="px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
          {/* Hero section */}
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="inline-flex items-center justify-center px-6 py-2 mb-4 text-xs font-medium tracking-wide text-red-700 uppercase rounded-full bg-red-100 dark:bg-red-900/30 dark:text-red-300">
              {isTranslationAvailable ? <TranslatedText text="Customer Support" /> : "Customer Support"}
            </motion.div>
            
            <motion.h1 
              className="text-4xl font-bold leading-tight text-gray-900 sm:text-5xl lg:text-6xl dark:text-white"
              variants={itemVariants}
            >
              {isTranslationAvailable ? 
                <><TranslatedText text="How Can We" /> <span className="text-[#d00000] dark:text-red-400"><TranslatedText text="Help You?" /></span></> : 
                <>How Can We <span className="text-[#d00000] dark:text-red-400">Help You?</span></>
              }
            </motion.h1>
            
            <motion.p 
              className="max-w-2xl mx-auto mt-4 text-xl leading-relaxed text-gray-600 dark:text-gray-300"
              variants={itemVariants}
            >
              {isTranslationAvailable ? 
                <TranslatedText text="Get in touch with our friendly team for any questions about our service, technical issues, or feature requests." /> : 
                "Get in touch with our friendly team for any questions about our service, technical issues, or feature requests."
              }
            </motion.p>
            
            <motion.div variants={itemVariants} className="mt-8 space-x-4">
              <Button 
                size="lg" 
                className="bg-[#d00000] hover:bg-red-700"
                onClick={scrollToForm}
              >
                {isTranslationAvailable ? <TranslatedText text="Contact Us" /> : "Contact Us"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setActiveTab("faq")}
              >
                {isTranslationAvailable ? <TranslatedText text="View FAQs" /> : "View FAQs"}
              </Button>
            </motion.div>
          </motion.div>

          {/* Tabs for Contact/FAQ */}
          <motion.div 
            className="max-w-5xl mx-auto mt-16"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            <Tabs defaultValue="contact" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                <TabsTrigger value="contact">
                  {isTranslationAvailable ? <TranslatedText text="Contact Us" /> : "Contact Us"}
                </TabsTrigger>
                <TabsTrigger value="faq">
                  {isTranslationAvailable ? <TranslatedText text="FAQs" /> : "FAQs"}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="contact" className="mt-2">
                {/* Contact info cards */}
                <motion.div 
                  className="grid grid-cols-1 gap-8 md:grid-cols-3"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {contactInfo.map((info, index) => (
                    <motion.div 
                      key={index}
                      variants={itemVariants}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                      <Card className="h-full border-2 hover:border-red-300 dark:hover:border-red-700 transition-all duration-300">
                        <CardContent className="p-6 flex flex-col items-center">
                          <div className={`p-3 rounded-full ${info.color} mb-4`}>
                            {info.icon}
                          </div>
                          <h3 className="text-lg font-semibold dark:text-white">{info.title}</h3>
                          <p className="mt-2 text-gray-800 dark:text-gray-200">{info.primary}</p>
                          {info.secondary && (
                            <p className="text-gray-600 dark:text-gray-400">{info.secondary}</p>
                          )}
                          <div className="mt-4 flex items-center text-sm">
                            <Clock className="h-4 w-4 mr-1 text-gray-500" />
                            <span className="text-gray-500">{info.available}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Contact form */}
                <motion.div 
                  className="mt-12"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  ref={formRef}
                >
                  <Card className="border-2">
                    <CardContent className="p-8 sm:p-10">
                      <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-3xl font-bold text-center">
                          {isTranslationAvailable ? <TranslatedText text="Send us a message" /> : "Send us a message"}
                        </CardTitle>
                        <CardDescription className="text-center mt-3">
                          {isTranslationAvailable ? 
                            <TranslatedText text="Fill out the form below and we'll get back to you as soon as possible." /> : 
                            "Fill out the form below and we'll get back to you as soon as possible."
                          }
                        </CardDescription>
                      </CardHeader>

                      <AnimatePresence mode="wait">
                        {formStatus.success ? (
                          <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="py-12"
                          >
                            <div className="flex flex-col items-center justify-center text-center">
                              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
                                <Check className="w-8 h-8" />
                              </div>
                              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {isTranslationAvailable ? <TranslatedText text="Message Sent!" /> : "Message Sent!"}
                              </h3>
                              <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-md">
                                {isTranslationAvailable ? 
                                  <TranslatedText text="Thank you for reaching out. We've received your message and will respond shortly." /> : 
                                  "Thank you for reaching out. We've received your message and will respond shortly."
                                }
                              </p>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.form 
                            key="form"
                            onSubmit={handleSubmit} 
                            className="mt-8 space-y-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            {formStatus.error && (
                              <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>
                                  {isTranslationAvailable ? <TranslatedText text="Error" /> : "Error"}
                                </AlertTitle>
                                <AlertDescription>
                                  {isTranslationAvailable ? 
                                    <TranslatedText text={formStatus.error} /> : 
                                    formStatus.error
                                  }
                                </AlertDescription>
                              </Alert>
                            )}
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                              <motion.div variants={itemVariants}>
                                <Label htmlFor="name" className="required-field">
                                  {isTranslationAvailable ? <TranslatedText text="Your name" /> : "Your name"} <span className="text-red-500">*</span>
                                </Label>
                                <Input 
                                  id="name"
                                  type="text"
                                  value={formState.name}
                                  onChange={handleInputChange}
                                  placeholder={isTranslationAvailable ? 
                                    <TranslatedText text="Enter your full name" /> as any : 
                                    "Enter your full name"
                                  }
                                  className="mt-2 focus:border-[#d00000]"
                                  required
                                />
                              </motion.div>

                              <motion.div variants={itemVariants}>
                                <Label htmlFor="email" className="required-field">
                                  {isTranslationAvailable ? <TranslatedText text="Email address" /> : "Email address"} <span className="text-red-500">*</span>
                                </Label>
                                <Input 
                                  id="email"
                                  type="email"
                                  value={formState.email}
                                  onChange={handleInputChange}
                                  placeholder={isTranslationAvailable ? 
                                    <TranslatedText text="Enter your email address" /> as any : 
                                    "Enter your email address"
                                  }
                                  className="mt-2 focus:border-purple-500"
                                  required
                                />
                              </motion.div>

                              <motion.div variants={itemVariants}>
                                <Label htmlFor="phone">
                                  {isTranslationAvailable ? <TranslatedText text="Phone number" /> : "Phone number"}
                                </Label>
                                <Input 
                                  id="phone"
                                  type="tel"
                                  value={formState.phone}
                                  onChange={handleInputChange}
                                  placeholder={isTranslationAvailable ? 
                                    <TranslatedText text="Enter your phone number" /> as any : 
                                    "Enter your phone number"
                                  }
                                  className="mt-2 focus:border-purple-500"
                                />
                              </motion.div>

                              <motion.div variants={itemVariants}>
                                <Label htmlFor="company">
                                  {isTranslationAvailable ? <TranslatedText text="Company name" /> : "Company name"}
                                </Label>
                                <Input 
                                  id="company"
                                  type="text"
                                  value={formState.company}
                                  onChange={handleInputChange}
                                  placeholder={isTranslationAvailable ? 
                                    <TranslatedText text="Enter your company name" /> as any : 
                                    "Enter your company name"
                                  }
                                  className="mt-2 focus:border-purple-500"
                                />
                              </motion.div>
                              
                              <motion.div variants={itemVariants} className="sm:col-span-2">
                                <Label htmlFor="subject">
                                  {isTranslationAvailable ? <TranslatedText text="Subject" /> : "Subject"}
                                </Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {subjectOptions.map((option, index) => (
                                    <Badge 
                                      key={index}
                                      variant={formState.subject === (typeof option === 'string' ? option : 'General Inquiry') ? "default" : "outline"}
                                      className={`cursor-pointer px-3 py-1 text-sm ${
                                        formState.subject === (typeof option === 'string' ? option : 'General Inquiry')
                                          ? "bg-[#d00000]" 
                                          : "hover:bg-red-100 dark:hover:bg-red-900/20"
                                      }`}
                                      onClick={() => setFormState(prev => ({ 
                                        ...prev, 
                                        subject: typeof option === 'string' ? option : 'General Inquiry'
                                      }))}
                                    >
                                      {option}
                                    </Badge>
                                  ))}
                                </div>
                              </motion.div>

                              <motion.div variants={itemVariants} className="sm:col-span-2">
                                <Label htmlFor="message" className="required-field">
                                  {isTranslationAvailable ? <TranslatedText text="Message" /> : "Message"} <span className="text-red-500">*</span>
                                </Label>
                                <Textarea 
                                  id="message"
                                  value={formState.message}
                                  onChange={handleInputChange}
                                  placeholder={isTranslationAvailable ? 
                                    <TranslatedText text="Tell us how we can help you..." /> as any : 
                                    "Tell us how we can help you..."
                                  }
                                  className="mt-2 min-h-32 focus:border-purple-500"
                                  rows={5}
                                  required
                                />
                              </motion.div>

                              <motion.div variants={itemVariants} className="sm:col-span-2">
                                <Button 
                                  type="submit" 
                                  className="w-full bg-[#d00000] hover:bg-red-700"
                                  size="lg"
                                  disabled={formStatus.loading}
                                >
                                  {formStatus.loading ? (
                                    <>
                                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      {isTranslationAvailable ? <TranslatedText text="Sending Message..." /> : "Sending Message..."}
                                    </>
                                  ) : (
                                    isTranslationAvailable ? <TranslatedText text="Send Message" /> : "Send Message"
                                  )}
                                </Button>
                                <p className="text-xs text-center text-gray-500 mt-3">
                                  {isTranslationAvailable ? 
                                    <TranslatedText text="We'll get back to you within 24 hours." /> : 
                                    "We'll get back to you within 24 hours."
                                  }
                                </p>
                              </motion.div>
                            </div>
                          </motion.form>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
              
              <TabsContent value="faq">
                <motion.div
                  variants={fadeIn}
                  initial="hidden"
                  animate="visible"
                  className="max-w-3xl mx-auto"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl md:text-3xl font-bold text-center">
                        {isTranslationAvailable ? <TranslatedText text="Frequently Asked Questions" /> : "Frequently Asked Questions"}
                      </CardTitle>
                      <CardDescription className="text-center">
                        {isTranslationAvailable ? 
                          <TranslatedText text="Find quick answers to common questions about our watch party service." /> : 
                          "Find quick answers to common questions about our watch party service."
                        }
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {faqItems.map((item, i) => (
                          <AccordionItem key={i} value={`item-${i}`}>
                            <AccordionTrigger className="text-left text-lg font-medium hover:text-[#d00000]">
                              {item.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 dark:text-gray-300">
                              {item.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                      
                      <div className="mt-8 text-center">
                        <p className="mb-4 text-gray-600 dark:text-gray-300">
                          {isTranslationAvailable ? 
                            <TranslatedText text="Still have questions? We're here to help." /> : 
                            "Still have questions? We're here to help."
                          }
                        </p>
                        <Button onClick={scrollToForm} className="bg-[#d00000] hover:bg-red-700">
                          {isTranslationAvailable ? <TranslatedText text="Contact Support" /> : "Contact Support"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
}

export default Help;