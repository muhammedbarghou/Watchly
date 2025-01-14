
import { HelpCircle, MessageSquare, Bug, ExternalLink } from 'lucide-react';
import { Button } from '../../ui/button';

const faqs = [
  {
    question: "How do I create a watch room?",
    answer: "Click the 'Create Room' button on the Rooms page, enter a name and video URL, then invite your friends."
  },
  {
    question: "Can I watch any video?",
    answer: "You can watch any publicly available video that allows embedding."
  },
  {
    question: "How do I invite friends?",
    answer: "Share your room's unique link or send invites directly through the app."
  }
];

export function HelpSupportSettings() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details key={index} className="group">
              <summary className="flex items-center justify-between p-4 rounded-lg bg-netflix-gray/50 cursor-pointer">
                <span className="font-medium">{faq.question}</span>
                <HelpCircle className="w-5 h-5 text-netflix-red group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-2 px-4 text-gray-400">{faq.answer}</p>
            </details>
          ))}
        </div>
        
        <Button variant="secondary" className="mt-4 w-full">
          <ExternalLink className="w-4 h-4 mr-2" />
          View Full Documentation
        </Button>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Contact Support</h3>
        <div className="space-y-4">
          <Button className="w-full justify-start">
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat with Support
          </Button>
          <Button variant="secondary" className="w-full justify-start">
            <Bug className="w-4 h-4 mr-2" />
            Report a Bug
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Submit Feedback</h3>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Your Feedback</label>
            <textarea
              className="w-full p-3 rounded-lg bg-netflix-gray border border-netflix-gray"
              rows={4}
              placeholder="Share your thoughts or suggestions..."
            />
          </div>
          <Button type="submit">Send Feedback</Button>
        </form>
      </div>
    </div>
  );
}