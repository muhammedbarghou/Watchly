import { useState } from 'react';
import { Cookie, Shield, Book, CheckCircle2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const legalDocuments = {
  terms: {
    title: 'Terms of Service',
    content: `Last updated: January 15, 2024

This Terms of Service agreement ("Agreement") governs your access to and use of Watchly's services. By using our services, you agree to be bound by these terms.

1. Acceptance of Terms
By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the Service.

2. Description of Service
Watchly provides a platform for synchronized video watching and social interaction...`
  },
  privacy: {
    title: 'Privacy Policy',
    content: `Last updated: January 15, 2024

This Privacy Policy describes how Watchly ("we", "our", or "us") collects, uses, and shares your personal information when you use our service.

1. Information Collection
We collect information that you provide directly to us when you:
- Create an account
- Use our services
- Contact us for support...`
  },
  cookies: {
    title: 'Cookie Policy',
    content: `Last updated: January 15, 2024

This Cookie Policy explains how Watchly uses cookies and similar technologies to recognize you when you visit our platform.

1. What are cookies?
Cookies are small pieces of text used to store information on web browsers...`
  }
};

export function LegalAboutSettings() {
  const [activeDocument, setActiveDocument] = useState<keyof typeof legalDocuments | null>(null);
  const version = "1.0.0";
  const buildNumber = "2024.01.19.1";
  const isUpToDate = true;

  const openDocument = (doc: keyof typeof legalDocuments) => {
    setActiveDocument(doc);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Legal Information</CardTitle>
          <CardDescription>
            Review our terms, privacy policy, and other legal documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="secondary" 
            className="w-full justify-start"
            onClick={() => openDocument('terms')}
          >
            <Book className="w-4 h-4 mr-2" />
            Terms of Service
          </Button>
          <Button 
            variant="secondary" 
            className="w-full justify-start"
            onClick={() => openDocument('privacy')}
          >
            <Shield className="w-4 h-4 mr-2" />
            Privacy Policy
          </Button>
          <Button 
            variant="secondary" 
            className="w-full justify-start"
            onClick={() => openDocument('cookies')}
          >
            <Cookie className="w-4 h-4 mr-2" />
            Cookie Policy
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About Watchly</CardTitle>
          <CardDescription>
            Application information and version details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-lg font-semibold">Watchly</h4>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">Version {version}</p>
                  <p className="text-xs text-muted-foreground">Build {buildNumber}</p>
                </div>
              </div>
              {isUpToDate ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Up to date
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Update available
                </Badge>
              )}
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                © 2024 Watchly. All rights reserved.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!activeDocument} onOpenChange={() => setActiveDocument(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {activeDocument && legalDocuments[activeDocument].title}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 p-4">
              <p className="whitespace-pre-line">
                {activeDocument && legalDocuments[activeDocument].content}
              </p>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default LegalAboutSettings;