import { useState } from 'react';
import { MessageSquare, Bug, ExternalLink, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const faqs = [
  {
    id: 'create-room',
    question: "How do I create a watch room?",
    answer: "Click the 'Create Room' button on the Rooms page, enter a name and video URL, then invite your friends. You can customize room settings like privacy and chat preferences before creating the room."
  },
  {
    id: 'video-support',
    question: "Can I watch any video?",
    answer: "You can watch any publicly available video that allows embedding. This includes content from popular platforms like YouTube, Vimeo, and other supported streaming services. Some premium content may have restrictions."
  },
  {
    id: 'invite-friends',
    question: "How do I invite friends?",
    answer: "Share your room's unique link or send invites directly through the app. You can also generate temporary guest links or set up recurring watch sessions with saved guest lists."
  }
];

export function HelpSupportSettings() {
  const [feedback, setFeedback] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showSupportDialog, setShowSupportDialog] = useState(false);
  const [showBugDialog, setShowBugDialog] = useState(false);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // API call would go here
      console.log('Submitting feedback:', feedback);
      setFeedback('');
      showTemporarySuccess('Thank you for your feedback!');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const showTemporarySuccess = (_message: string) => {
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  return (
    <div className="space-y-6">
      {showSuccessMessage && (
        <Alert>
          <AlertDescription>
            Your feedback has been submitted successfully. Thank you for helping us improve!
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>
            Find quick answers to common questions about using our platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          <Button variant="secondary" className="w-full sm:w-auto mt-4">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Full Documentation
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
          <CardDescription>
            Get help from our support team or report technical issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            className="w-full justify-start"
            onClick={() => setShowSupportDialog(true)}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat with Support
          </Button>
          <Button 
            variant="secondary" 
            className="w-full justify-start"
            onClick={() => setShowBugDialog(true)}
          >
            <Bug className="w-4 h-4 mr-2" />
            Report a Bug
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submit Feedback</CardTitle>
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
            <Button type="submit" disabled={!feedback.trim()}>
              <Send className="w-4 h-4 mr-2" />
              Send Feedback
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={showSupportDialog} onOpenChange={setShowSupportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chat with Support</DialogTitle>
            <DialogDescription>
              Our support team is here to help. Starting a chat will connect you with the next available support representative.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSupportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowSupportDialog(false);
              showTemporarySuccess('Connecting to support...');
            }}>
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
              Please provide details about the issue you're experiencing. Include steps to reproduce if possible.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Describe the bug..."
              className="resize-none"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBugDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowBugDialog(false);
              showTemporarySuccess('Bug report submitted successfully');
            }}>
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default HelpSupportSettings;