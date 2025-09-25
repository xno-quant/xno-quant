
"use client";

import { useActionState, useEffect, useState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { checkinForEvent } from "@/app/actions";
import type { Event } from "@/lib/events";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogIn, Check, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const initialState = {
  type: "error" as const,
  message: "",
  errors: {},
};

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full text-lg" disabled={pending || disabled}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang xử lý...
        </>
      ) : (
        <>
          <Check className="mr-2 h-5 w-5" /> Xác nhận Check-in
        </>
      )}
    </Button>
  );
}

export default function CheckinClient({ todaysEvents }: { todaysEvents: Event[] }) {
  const { user, signInWithGoogle, loading } = useAuth();
  const [state, formAction] = useActionState(checkinForEvent, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [idToken, setIdToken] = useState<string>('');

  const [selectedEventId, setSelectedEventId] = useState<string>(() => {
    return todaysEvents.length === 1 ? todaysEvents[0].id : '';
  });

  useEffect(() => {
    const getIdToken = async () => {
      if (user) {
        try {
          const token = await user.getIdToken();
          setIdToken(token);
        } catch (error) {
          console.error("Error getting ID token:", error);
        }
      }
    };
    getIdToken();
  }, [user]);

  useEffect(() => {
    if (state.type === "success") {
      toast({
        title: "Thành công!",
        description: state.message,
        className: "bg-green-100 dark:bg-green-900 border-green-400",
        duration: 5000,
      });
      // Disable the form/button after successful check-in
      if (formRef.current) {
        const button = formRef.current.querySelector('button[type="submit"]') as HTMLButtonElement;
        if (button) button.disabled = true;
      }
    } else if (state.type === "error") {
      toast({
        title: "Lỗi",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, toast]);

  if (loading) {
    return <Loader2 className="h-12 w-12 animate-spin text-primary" />;
  }

  if (!user) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Yêu cầu đăng nhập</CardTitle>
          <CardDescription>Bạn cần đăng nhập để thực hiện check-in.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={signInWithGoogle} className="w-full" size="lg">
            <LogIn className="mr-2 h-5 w-5" />
            Đăng nhập với Google
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (todaysEvents.length === 0) {
    return (
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Không có sự kiện</AlertTitle>
        <AlertDescription>
          Hiện không có sự kiện nào được lên lịch cho hôm nay. Vui lòng kiểm tra lại.
        </AlertDescription>
      </Alert>
    );
  }

  const selectedEvent = todaysEvents.find(e => e.id === selectedEventId);

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <form ref={formRef} action={formAction}>
        <input type="hidden" name="idToken" value={idToken} />
        <CardHeader className="text-center">
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3 text-center">
            <div className="flex justify-center">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
                  {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <p className="text-muted-foreground">Chào mừng,</p>
              <p className="font-bold text-xl">{user.displayName}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event" className="font-semibold">Sự kiện</Label>
            {todaysEvents.length === 1 ? (
              <>
                <input type="hidden" name="eventId" value={todaysEvents[0].id} />
                <div className="p-3 border rounded-md bg-muted text-center font-medium">
                  {todaysEvents[0].title}
                </div>
              </>
            ) : (
              <Select name="eventId" required onValueChange={setSelectedEventId} value={selectedEventId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn sự kiện để check-in" />
                </SelectTrigger>
                <SelectContent>
                  {todaysEvents.map(event => (
                    <SelectItem key={event.id} value={event.id}>{event.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {state.errors?.eventId && <p className="text-sm text-destructive">{state.errors.eventId[0]}</p>}
          </div>

        </CardContent>
        <CardFooter>
          <SubmitButton disabled={!selectedEventId || !idToken} />
        </CardFooter>
      </form>
    </Card>
  );
}
