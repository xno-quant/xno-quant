import AiContentGenerator from './ai-content-generator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";

const isStaticMode = process.env.NEXT_PUBLIC_STATIC_MODE === 'true';

export default function CreateEventPage() {
    if (isStaticMode) {
        return (
            <div className="container py-12 pt-24">
                 <Card className="max-w-md mx-auto border-destructive">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-destructive/10 text-destructive p-3 rounded-full w-fit mb-4">
                            <XCircle className="w-10 h-10" />
                        </div>
                        <CardTitle className="text-destructive">Tính năng không khả dụng</CardTitle>
                        <CardDescription>
                            Tính năng tạo nội dung bằng AI yêu cầu kết nối backend và đã bị vô hiệu hóa trong chế độ tĩnh (Static Mode).
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

  return (
    <div className="container py-12 pt-24">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight font-headline">Tạo sự kiện của bạn</h1>
        <p className="text-lg text-muted-foreground mt-2">Sử dụng trợ lý AI của chúng tôi để tạo tiêu đề và mô tả hoàn hảo.</p>
      </div>
      <AiContentGenerator />
    </div>
  );
}
