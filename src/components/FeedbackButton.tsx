import { useState } from "react";
import { MessageSquare, Star, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

const FeedbackButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);

    // Mock submission to localStorage
    setTimeout(() => {
      const feedback = {
        id: Date.now().toString(),
        title,
        content,
        rating,
        date: new Date().toISOString(),
        userType: 'guest' // In a real app we'd get this from auth context
      };

      try {
        const existing = JSON.parse(localStorage.getItem('system_feedback') || '[]');
        localStorage.setItem('system_feedback', JSON.stringify([feedback, ...existing]));
        
        toast({
          title: "המשוב נשלח בהצלחה",
          description: "תודה שעזרת לנו להשתפר!",
        });

        setIsOpen(false);
        setTitle("");
        setContent("");
        setRating(0);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "שגיאה",
          description: "לא ניתן היה לשלוח את המשוב",
        });
      } finally {
        setIsSubmitting(false);
      }
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-4 left-4 z-50 rounded-full shadow-lg gap-2"
          size="lg"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="hidden md:inline">משוב למערכת</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>שלח משוב</DialogTitle>
          <DialogDescription>
            נשמח לשמוע את דעתך על המערכת. המשוב עוזר לנו להשתפר.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">נושא (חובה)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="נושא המשוב..."
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">תוכן המשוב (חובה)</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="כתוב כאן את המשוב שלך..."
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>דירוג (אופציונלי)</Label>
            <div className="flex gap-1 justify-center py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 transition-transform hover:scale-110 focus:outline-none"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="submit" disabled={isSubmitting || !title || !content} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  שולח...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 ml-2" />
                  שלח משוב
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackButton;
