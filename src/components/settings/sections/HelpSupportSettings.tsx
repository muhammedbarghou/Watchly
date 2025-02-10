import { useState, useEffect } from 'react';
import { MessageSquare, Bug, ExternalLink, Send, Search, BookOpen, ArrowRight, HelpCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, addDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'technical' | 'account';
  helpful?: boolean;
}

interface Feedback {
  message: string;
  createdAt: Date;
  userId?: string;
}

interface BugReport {
  description: string;
  createdAt: Date;
  userId?: string;
  status: 'open' | 'in-progress' | 'resolved';
}

export function HelpSupportSettings() {
  const { currentUser } = useAuth();
  const [feedback, setFeedback] = useState('');
  const [bugReport, setBugReport] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSupportDialog, setShowSupportDialog] = useState(false);
  const [showBugDialog, setShowBugDialog] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<string | undefined>(undefined);
  const [faqList, setFaqList] = useState<FAQ[]>([]);
  const [isLoadingFAQs, setIsLoadingFAQs] = useState(true);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const docRef = doc(db, 'content', 'help-support');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setFaqList(docSnap.data().faqs || []);
        } else {
          const defaultFAQs = [
            {
              id: 'create-room',
              question: "How do I create a watch room?",
              answer: "Click the 'Create Room' button on the Rooms page, enter a name and video URL, then invite your friends. You can customize room settings like privacy and chat preferences before creating the room.",
              category: 'general' as const
            },
            {
              id: 'video-support',
              question: "What video platforms are supported?",
              answer: "You can watch content from YouTube, Vimeo, Twitch, and other major streaming platforms that allow embedding. Some premium content may have restrictions based on the provider's policies.",
              category: 'technical' as const
            },
            {
              id: 'invite-friends',
              question: "How do I invite friends?",
              answer: "Share your room's unique link or send invites directly through the app. You can also generate temporary guest links or set up recurring watch sessions with saved guest lists.",
              category: 'general' as const
            },
            {
              id: 'account-settings',
              question: "How do I change my account settings?",
              answer: "Navigate to Settings from your profile menu. You can update your profile information, notification preferences, and privacy settings from there.",
              category: 'account' as const
            }
          ];
          await setDoc(docRef, { faqs: defaultFAQs });
          setFaqList(defaultFAQs);
        }
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      } finally {
        setIsLoadingFAQs(false);
      }
    };

    fetchFAQs();
  }, []);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!feedback.trim()) return;

      await addDoc(collection(db, 'feedback'), {
        message: feedback,
        createdAt: new Date(),
        userId: currentUser?.uid
      });

      setFeedback('');
      showTemporarySuccess('Thank you for your feedback! We appreciate your input.');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const handleBugReportSubmit = async () => {
    try {
      if (!bugReport.trim()) return;

      await addDoc(collection(db, 'bugReports'), {
        description: bugReport,
        createdAt: new Date(),
        userId: currentUser?.uid,
        status: 'open' as const
      });

      setShowBugDialog(false);
      setBugReport('');
      showTemporarySuccess('Bug report submitted successfully. Our team will investigate.');
    } catch (error) {
      console.error('Failed to submit bug report:', error);
    }
  };

  const handleFAQHelpful = async (id: string, helpful: boolean) => {
    try {
      const faqRef = doc(db, 'content', 'help-support');
      const updatedFAQs = faqList.map(faq => 
        faq.id === id ? { ...faq, helpful } : faq
      );
      
      await setDoc(faqRef, { faqs: updatedFAQs }, { merge: true });
      setFaqList(updatedFAQs);
      showTemporarySuccess('Thank you for your feedback!');
    } catch (error) {
      console.error('Error updating FAQ:', error);
    }
  };

  const showTemporarySuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const filteredFAQs = faqList.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoadingFAQs) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading help content...</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6 max-w-4xl mx-auto p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                {successMessage}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <CardTitle>Help Center</CardTitle>
            </div>
            <CardDescription>
              Find quick answers to common questions about using our platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search FAQs..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Accordion 
              type="single" 
              collapsible 
              className="w-full"
              value={expandedFAQ}
              onValueChange={setExpandedFAQ}
            >
              {filteredFAQs.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AccordionItem value={faq.id}>
                    <AccordionTrigger className="text-left hover:no-underline">
                      <div className="flex items-center space-x-2">
                        <HelpCircle className="w-4 h-4 text-primary" />
                        <span>{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <p className="text-muted-foreground">{faq.answer}</p>
                        {expandedFAQ === faq.id && (
                          <motion.div 
                            className="flex items-center space-x-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <span className="text-sm text-muted-foreground">Was this helpful?</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFAQHelpful(faq.id, true)}
                              className={faq.helpful === true ? 'bg-primary/10' : ''}
                            >
                              <ThumbsUp className="w-4 h-4 mr-2" />
                              Yes
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFAQHelpful(faq.id, false)}
                              className={faq.helpful === false ? 'bg-primary/10' : ''}
                            >
                              <ThumbsDown className="w-4 h-4 mr-2" />
                              No
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button variant="secondary" className="w-full sm:w-auto mt-4">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Full Documentation
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <CardTitle>Contact Support</CardTitle>
            </div>
            <CardDescription>
              Get help from our support team or report technical issues
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full justify-start hover:scale-102 transition-transform"
              onClick={() => setShowSupportDialog(true)}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat with Support
            </Button>
            <Button 
              variant="secondary" 
              className="w-full justify-start hover:scale-102 transition-transform"
              onClick={() => setShowBugDialog(true)}
            >
              <Bug className="w-4 h-4 mr-2" />
              Report a Bug
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Send className="w-5 h-5 text-primary" />
              <CardTitle>Submit Feedback</CardTitle>
            </div>
            <CardDescription>
              Share your thoughts and suggestions to help us improve
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="feedback">Your Feedback</Label>
                <Textarea
                  id="feedback"
                  placeholder="Share your thoughts or suggestions..."
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="resize-none"
                />
              </div>
              <Button 
                type="submit" 
                disabled={!feedback.trim()}
                className="w-full sm:w-auto"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Feedback
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={showSupportDialog} onOpenChange={setShowSupportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chat with Support</DialogTitle>
            <DialogDescription>
              Our support team is here to help 24/7. Starting a chat will connect you with the next available support representative.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert>
              <AlertDescription>
                Average response time: &lt;5 minutes
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSupportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowSupportDialog(false);
              showTemporarySuccess('Connecting to support...');
            }}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Start Chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBugDialog} onOpenChange={setShowBugDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report a Bug</DialogTitle>
            <DialogDescription>
              Help us improve by reporting any issues you encounter. Please provide as much detail as possible.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Describe what happened, steps to reproduce, and any error messages you saw..."
              className="resize-none"
              rows={4}
              value={bugReport}
              onChange={(e) => setBugReport(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBugDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBugReportSubmit}
              disabled={!bugReport.trim()}
            >
              <Bug className="w-4 h-4 mr-2" />
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

export default HelpSupportSettings;