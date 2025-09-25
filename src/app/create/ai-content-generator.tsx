
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useEffect, useState } from "react";
import { generateContentAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Clipboard, ClipboardCheck, Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";

const initialState = {
  type: "",
  message: "",
  data: null,
};

function GenerateButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Đang tạo...
        </>
      ) : (
        <>
          <Bot className="mr-2 h-4 w-4" />
          Tạo nội dung
        </>
      )}
    </Button>
  );
}

function CopyButton({ textToCopy }: { textToCopy: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleCopy}>
      {copied ? <ClipboardCheck className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
      <span className="sr-only">Sao chép</span>
    </Button>
  );
}

export default function AiContentGenerator() {
  const { user, loading } = useAuth();
  const [state, formAction] = useActionState(generateContentAction, initialState);
  const [generatedTitle, setGeneratedTitle] = useState("");
  const [generatedDescription, setGeneratedDescription] = useState("");

  useEffect(() => {
    if (state.type === 'success' && state.data) {
      setGeneratedTitle(state.data.suggestedTitle);
      setGeneratedDescription(state.data.suggestedDescription);
    }
  }, [state]);

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card><CardHeader><CardTitle>Đang tải...</CardTitle></CardHeader></Card>
        <Card><CardHeader><CardTitle>Đang tải...</CardTitle></CardHeader></Card>
      </div>
    );
  }

  // NOTE: You would want to implement proper authorization, maybe role-based access.
  if (!user) {
    return (
      <div className="text-center">
        <p>Vui lòng đăng nhập để sử dụng tính năng này.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Trợ lý nội dung AI</CardTitle>
          <CardDescription>Cung cấp tên và chủ đề sự kiện để bắt đầu.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="eventName">Tên sự kiện</Label>
              <Input id="eventName" name="eventName" placeholder="VD: Quantum Coding Summit" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventTopic">Chủ đề sự kiện</Label>
              <Input id="eventTopic" name="eventTopic" placeholder="VD: Tương lai của tính toán lượng tử" />
            </div>
            <GenerateButton />
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Nội dung được tạo</CardTitle>
          <CardDescription>Xem lại và sử dụng nội dung do AI tạo cho sự kiện của bạn.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="generatedTitle">Tiêu đề đề xuất</Label>
            <div className="flex items-center gap-2">
              <Textarea
                id="generatedTitle"
                value={generatedTitle}
                onChange={(e) => setGeneratedTitle(e.target.value)}
                placeholder="Tiêu đề do AI tạo sẽ xuất hiện ở đây..."
                rows={2}
              />
              <CopyButton textToCopy={generatedTitle} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="generatedDescription">Mô tả đề xuất</Label>
            <div className="flex items-center gap-2">
              <Textarea
                id="generatedDescription"
                value={generatedDescription}
                onChange={(e) => setGeneratedDescription(e.target.value)}
                placeholder="Mô tả do AI tạo sẽ xuất hiện ở đây..."
                rows={6}
              />
              <CopyButton textToCopy={generatedDescription} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
