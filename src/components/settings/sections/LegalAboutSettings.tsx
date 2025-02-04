import { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Cookie, Shield, Book, CheckCircle2, Info, ChevronRight, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import React from 'react';

interface LegalDocument {
  title: string;
  icon: LucideIcon;
  content: string;
}

type LegalDocuments = {
  [K in 'terms' | 'privacy' | 'cookies']: LegalDocument;
};

const legalDocuments: LegalDocuments = {
  terms: {
    title: 'Terms of Service',
    icon: Book,
    content: `Last updated: January 15, 2024...`
  },
  privacy: {
    title: 'Privacy Policy',
    icon: Shield,
    content: `Last updated: January 15, 2024...`
  },
  cookies: {
    title: 'Cookie Policy',
    icon: Cookie,
    content: `Last updated: January 15, 2024...`
  }
};

const fadeIn: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const buttonHover: Variants = {
  rest: { scale: 1, backgroundColor: 'var(--secondary)' },
  hover: { 
    scale: 1.02,
    backgroundColor: 'var(--secondary-hover)',
    transition: { duration: 0.2 }
  }
};

export function LegalAboutSettings(): JSX.Element {
  const [activeDocument, setActiveDocument] = useState<keyof LegalDocuments | null>(null);
  const version = "1.0.0";
  const buildNumber = "2024.01.19.1";
  const isUpToDate = true;

  const openDocument = (doc: keyof LegalDocuments): void => setActiveDocument(doc);

  return (
    <motion.div 
      className="space-y-6"
      initial="initial"
      animate="animate"
      variants={{
        initial: { opacity: 0 },
        animate: { 
          opacity: 1,
          transition: { staggerChildren: 0.1 }
        }
      }}
    >
      <motion.div variants={fadeIn}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Legal Information</CardTitle>
            <CardDescription className="text-base">
              Review our terms, privacy policy, and other legal documents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(Object.entries(legalDocuments) as [keyof LegalDocuments, LegalDocument][]).map(([key, doc]) => (
              <motion.div key={key} variants={buttonHover} initial="rest" whileHover="hover">
                <Button 
                  variant="secondary" 
                  className="w-full justify-between group text-base"
                  onClick={() => openDocument(key)}
                >
                  <div className="flex items-center">
                    <doc.icon className="w-5 h-5 mr-3" />
                    {doc.title}
                  </div>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={fadeIn}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">About Watchly</CardTitle>
            <CardDescription className="text-base">
              Application information and version details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h4 className="text-xl font-bold">Watchly</h4>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-sm">v{version}</Badge>
                    <Badge variant="outline" className="text-sm">Build {buildNumber}</Badge>
                  </div>
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isUpToDate ? (
                    <Badge variant="default" className="flex items-center gap-2 py-2 px-3">
                      <CheckCircle2 className="w-4 h-4" />
                      Up to date
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="flex items-center gap-2 py-2 px-3">
                      <Info className="w-4 h-4" />
                      Update available
                    </Badge>
                  )}
                </motion.div>
              </div>
              
              <Separator />
              
              <motion.p 
                className="text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                © 2024 Watchly. All rights reserved.
              </motion.p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      <AnimatePresence>
        {activeDocument && (
          <Dialog open={!!activeDocument} onOpenChange={() => setActiveDocument(null)}>
            <DialogContent className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    {activeDocument && (
                      <>
                        {legalDocuments[activeDocument].icon && (
                          React.createElement(legalDocuments[activeDocument].icon, { className: "w-5 h-5" })
                        )}
                        {legalDocuments[activeDocument].title}
                      </>
                    )}
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh]">
                  <div className="space-y-4 p-4">
                    <p className="whitespace-pre-line leading-relaxed">
                      {activeDocument && legalDocuments[activeDocument].content}
                    </p>
                  </div>
                </ScrollArea>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default LegalAboutSettings;