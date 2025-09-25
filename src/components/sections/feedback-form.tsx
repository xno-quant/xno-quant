
"use client";

import { useActionState, useEffect, useState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { submitFeedback } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Star, MessageSquare, Building, Lightbulb, User, Settings, Send } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

const initialState = {
  type: "",
  message: "",
  errors: {},
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <> <Settings className="mr-2 h-4 w-4 animate-spin" />Đang gửi...</> : <><Send className="mr-2 h-4 w-4" />Gửi phản hồi</>}
    </Button>
  );
}

const RequiredIndicator = () => <span className="text-red-500 ml-1">*</span>;

const StarRatingInput = ({ name, label, error, required }: { name: string, label: string, error?: string, required?: boolean }) => {
    const [hoverRating, setHoverRating] = useState(0);
    const [currentRating, setCurrentRating] = useState(0);
    const radioGroupRef = useRef<HTMLDivElement>(null);

    const handleRatingClick = (value: number) => {
        setCurrentRating(value);
        const radioButton = radioGroupRef.current?.querySelector(`input[value="${value}"]`) as HTMLInputElement;
        if(radioButton) {
            radioButton.click();
            radioButton.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
  
    return (
      <div className="space-y-2">
        <Label className={cn("font-semibold flex items-center", error && "text-destructive")}>
          {label}
          {required && <RequiredIndicator />}
        </Label>
        <div 
          className="flex items-center gap-1"
          onMouseLeave={() => setHoverRating(0)}
        >
          {[1, 2, 3, 4, 5].map((value) => (
            <Star
              key={value}
              className={cn(
                  "w-6 h-6 cursor-pointer transition-colors",
                  (hoverRating >= value || currentRating >= value) 
                  ? "text-amber-400 fill-amber-400" 
                  : "text-gray-300 dark:text-gray-600"
              )}
              onMouseEnter={() => setHoverRating(value)}
              onClick={() => handleRatingClick(value)}
            />
          ))}
        </div>
        <RadioGroup name={name} ref={radioGroupRef} className="hidden">
           {[1, 2, 3, 4, 5].map((value) => (
               <RadioGroupItem key={value} value={String(value)} id={`${name}-${value}`} />
           ))}
        </RadioGroup>
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      </div>
    );
};


const FeedbackForm = ({ eventId }: { eventId: string }) => {
  const [state, formAction] = useActionState(submitFeedback, initialState);
  const { toast } = useToast();
  const [isDetailed, setIsDetailed] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [quickFeedback, setQuickFeedback] = useState({ feedback: '', futureTopic: '' });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (state?.type === 'success') {
      toast({
        title: "Gửi thành công!",
        description: state.message,
        className: "bg-green-100 dark:bg-green-900 border-green-400"
      });
      formRef.current?.reset();
      setIsDetailed(false);
      setQuickFeedback({ feedback: '', futureTopic: '' });
    } else if (state?.type === 'error') {
      toast({
        title: "Oops! Đã có lỗi xảy ra",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, toast]);

  return (
    <section id="form" className="bg-muted/40">
      <div className="container flex justify-center">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold font-headline">Góp ý cho sự kiện</CardTitle>
            <CardDescription>Sự kiện đã kết thúc. Hãy cho chúng tôi biết trải nghiệm của bạn nhé!</CardDescription>
             <div className="flex items-center justify-center space-x-2 pt-4">
                <Label htmlFor="feedback-mode" className={!isDetailed ? 'text-primary font-bold' : ''}>Nhanh</Label>
                <Switch
                    id="feedback-mode"
                    checked={isDetailed}
                    onCheckedChange={setIsDetailed}
                />
                <Label htmlFor="feedback-mode" className={isDetailed ? 'text-primary font-bold' : ''}>Chi tiết</Label>
            </div>
          </CardHeader>
          <CardContent>
            {isClient ? (
              <form ref={formRef} action={formAction} className="space-y-8">
                <input type="hidden" name="eventId" value={eventId} />
                <input type="hidden" name="detailed_mode" value={String(isDetailed)} />
                
                {!isDetailed ? (
                  // Quick Form
                  <div className="space-y-6">
                    <StarRatingInput name="rating" label="Bạn đánh giá chung về sự kiện này như thế nào?" error={state.errors?.rating?.[0]} required />
                    <div className="space-y-2">
                      <Label htmlFor="feedback" className="font-semibold flex items-center gap-2"><MessageSquare className="w-5 h-5"/> Vài dòng cảm nhận hoặc góp ý của bạn</Label>
                      <Textarea 
                        id="feedback" 
                        name="feedback" 
                        placeholder="Bạn thích nhất điều gì? Chúng tôi có thể cải thiện ở đâu?..." 
                        rows={4}
                        value={quickFeedback.feedback}
                        onChange={e => setQuickFeedback({...quickFeedback, feedback: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="futureTopic" className="font-semibold flex items-center gap-2"><Lightbulb className="w-5 h-5" /> Chủ đề bạn muốn XNO Quant tổ chức trong tương lai?</Label>
                      <Textarea 
                        id="futureTopic" 
                        name="futureTopic" 
                        placeholder="Ví dụ: Ứng dụng AI trong phân tích vĩ mô, Xây dựng bot trade cho thị trường crypto..." 
                        rows={3}
                        value={quickFeedback.futureTopic}
                        onChange={e => setQuickFeedback({...quickFeedback, futureTopic: e.target.value})}
                      />
                    </div>
                  </div>
                ) : (
                  // Detailed Form
                  <div className="space-y-6">
                      <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                          <AccordionItem value="item-1">
                              <AccordionTrigger className="text-lg font-semibold"><Star className="w-5 h-5 mr-2 text-primary" />Đánh giá chung</AccordionTrigger>
                              <AccordionContent className="pt-4 pl-2 space-y-4">
                                  <StarRatingInput name="rating" label="Mức độ hài lòng tổng thể của bạn" error={state.errors?.rating?.[0]} required />
                                  <div className="space-y-2">
                                      <Label htmlFor="feedback">Góp ý chi tiết về trải nghiệm chung</Label>
                                      <Textarea id="feedback" name="feedback" defaultValue={quickFeedback.feedback} placeholder="Cảm nhận chung của bạn về sự kiện là gì?" rows={3} />
                                  </div>
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-2">
                              <AccordionTrigger className="text-lg font-semibold"><Building className="w-5 h-5 mr-2 text-primary" />Công tác tổ chức</AccordionTrigger>
                              <AccordionContent className="pt-4 pl-2 space-y-4">
                                  <StarRatingInput name="rating_organization" label="Chất lượng công tác tổ chức (địa điểm, thời gian, hỗ trợ...)" error={state.errors?.rating_organization?.[0]} required />
                                  <div className="space-y-2">
                                      <Label htmlFor="feedback_organization">Góp ý chi tiết về công tác tổ chức</Label>
                                      <Textarea id="feedback_organization" name="feedback_organization" placeholder="Bạn có góp ý gì về địa điểm, công tác check-in, hay sự hỗ trợ của team không?" rows={3} />
                                  </div>
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-3">
                              <AccordionTrigger className="text-lg font-semibold"><MessageSquare className="w-5 h-5 mr-2 text-primary" />Nội dung chương trình</AccordionTrigger>
                              <AccordionContent className="pt-4 pl-2 space-y-4">
                                  <StarRatingInput name="rating_content" label="Chất lượng nội dung được chia sẻ" error={state.errors?.rating_content?.[0]} required/>
                                  <div className="space-y-2">
                                      <Label htmlFor="feedback_content">Góp ý chi tiết về nội dung</Label>
                                      <Textarea id="feedback_content" name="feedback_content" placeholder="Nội dung có hữu ích không? Bạn muốn tìm hiểu sâu hơn về phần nào?" rows={3} />
                                  </div>
                              </AccordionContent>
                          </AccordionItem>
                           <AccordionItem value="item-4">
                              <AccordionTrigger className="text-lg font-semibold"><User className="w-5 h-5 mr-2 text-primary" />Diễn giả</AccordionTrigger>
                              <AccordionContent className="pt-4 pl-2 space-y-4">
                                  <StarRatingInput name="rating_speaker" label="Chất lượng của diễn giả" error={state.errors?.rating_speaker?.[0]} required/>
                                  <div className="space-y-2">
                                      <Label htmlFor="feedback_speaker">Góp ý chi tiết về diễn giả</Label>
                                      <Textarea id="feedback_speaker" name="feedback_speaker" placeholder="Cách trình bày, kiến thức, và khả năng tương tác của diễn giả như thế nào?" rows={3} />
                                  </div>
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-5">
                              <AccordionTrigger className="text-lg font-semibold"><Lightbulb className="w-5 h-5 mr-2 text-primary" />Đề xuất cho tương lai</AccordionTrigger>
                              <AccordionContent className="pt-4 pl-2 space-y-4">
                                 <div className="space-y-2">
                                      <Label htmlFor="futureTopic">Chủ đề hoặc diễn giả bạn muốn XNO Quant mời trong các workshop sắp tới?</Label>
                                      <Textarea id="futureTopic" name="futureTopic" defaultValue={quickFeedback.futureTopic} placeholder="Ví dụ: Ứng dụng AI trong phân tích vĩ mô, mời chuyên gia về Reinforcement Learning..." rows={3} />
                                 </div>
                              </AccordionContent>
                          </AccordionItem>
                      </Accordion>
                  </div>
                )}
                
                <SubmitButton />
              </form>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default FeedbackForm;
