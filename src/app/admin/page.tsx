
import { getAllEvents } from "@/lib/events";
import AdminDashboard from "./admin-dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";

export const dynamic = 'force-dynamic';

const isStaticMode = process.env.NEXT_PUBLIC_STATIC_MODE === 'true';

export default async function AdminPage() {
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
                            Trang quản trị yêu cầu kết nối backend và đã bị vô hiệu hóa trong chế độ tĩnh (Static Mode).
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }
    
    const events = await getAllEvents();
    
    return (
        <div className="container py-12 pt-24">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold tracking-tight font-headline">Trang quản trị</h1>
                <p className="text-lg text-muted-foreground mt-2">Xuất dữ liệu sự kiện.</p>
            </div>
            <AdminDashboard events={events} />
        </div>
    );
}
