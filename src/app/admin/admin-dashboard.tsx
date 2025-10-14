
"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { getFeedback, getRegistrations } from "./actions";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import type { Event } from "@/lib/events";
import { Loader2, Download, Clipboard, ClipboardCheck, Users, MessageSquare } from "lucide-react";

const initialState: any = {
  type: "",
  message: "",
  data: null,
  dataType: null,
};

function ExportButton({ children, action, disabled }: { children: React.ReactNode, action: any, disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button formAction={action} type="submit" disabled={pending || disabled}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : children}
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
        <span className="sr-only">Sao chép vào clipboard</span>
      </Button>
    );
}

const objectToCsv = (data: any[]) => {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => {
                const value = String(row[header] || '');
                // Escape commas and quotes
                if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',')
        )
    ];
    return csvRows.join('\n');
}


export default function AdminDashboard({ events }: { events: Event[] }) {
  const { user, isAdmin, loading } = useAuth();
  const [registrationsState, registrationsAction] = useFormState(getRegistrations, initialState);
  const [feedbackState, feedbackAction] = useFormState(getFeedback, initialState);
  const { toast } = useToast();

  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [tableData, setTableData] = useState<any[]>([]);
  const [tableDataType, setTableDataType] = useState<string | null>(null);

  useEffect(() => {
    const state = registrationsState.dataType === 'registrations' ? registrationsState : feedbackState;
    if (state.type === 'success' && state.data) {
        setTableData(state.data);
        setTableDataType(state.dataType);
    } else if (state.type === 'error') {
        toast({ title: "Lỗi", description: state.message, variant: "destructive" });
        setTableData([]);
        setTableDataType(null);
    }
  }, [registrationsState, feedbackState, toast]);

  if (loading) {
    return <div className="text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></div>;
  }

  if (!isAdmin) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Truy cập bị từ chối</CardTitle>
          <CardDescription>Bạn không có quyền truy cập trang này. Vui lòng đăng nhập với tài khoản admin.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const renderTable = () => {
    if (tableData.length === 0) return <p className="text-center text-muted-foreground mt-8">Không có dữ liệu để hiển thị.</p>;
    
    const headers = Object.keys(tableData[0]);

    return (
        <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                    {tableDataType === 'registrations' ? 'Dữ liệu đăng ký' : 'Dữ liệu phản hồi'}
                </h3>
                <CopyButton textToCopy={objectToCsv(tableData)} />
            </div>
            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {headers.map(header => <TableHead key={header}>{header}</TableHead>)}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tableData.map((row, index) => (
                            <TableRow key={index}>
                                {headers.map(header => <TableCell key={header}>{String(row[header])}</TableCell>)}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
        <Card>
            <CardHeader>
                <CardTitle>Bảng điều khiển</CardTitle>
                <CardDescription>Chọn một sự kiện để xuất dữ liệu.</CardDescription>
            </CardHeader>
            <CardContent>
                <form className="space-y-4">
                    <input type="hidden" name="idToken" value={user?.accessToken || ''} />
                    <Select name="eventId" onValueChange={setSelectedEvent} value={selectedEvent}>
                        <SelectTrigger>
                            <SelectValue placeholder="Chọn một sự kiện" />
                        </SelectTrigger>
                        <SelectContent>
                            {events.map(event => (
                                <SelectItem key={event.id} value={event.id}>
                                    {event.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="flex gap-4">
                        <ExportButton action={registrationsAction} disabled={!selectedEvent}>
                            <Users className="mr-2 h-4 w-4"/>
                            Xuất đăng ký
                        </ExportButton>
                        <ExportButton action={feedbackAction} disabled={!selectedEvent}>
                            <MessageSquare className="mr-2 h-4 w-4"/>
                            Xuất phản hồi
                        </ExportButton>
                    </div>
                </form>

                {renderTable()}
            </CardContent>
        </Card>
    </div>
  );
}
