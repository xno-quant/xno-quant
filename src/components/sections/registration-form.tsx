"use client";

import { registerForEvent } from "@/app/actions";
import AddToCalendarButton from "@/components/add-to-calendar-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import type { Event } from "@/lib/events";
import axios from "axios";
import { LogIn, PenSquare } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";

interface IDataForBackend {
  full_name: string;
  email: string;
  phone: string;
  job: string;
  question: string;
}

const sendFormDataToBackend = async (formData: IDataForBackend) => {
  console.log("Sending form data to backend", formData);
  const body = {
    full_name: formData.full_name || "",
    email: formData.email || "",
    phone: formData.phone || "",
    job: formData.job || "",
    question: formData.question || "",
  };

  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_FORM_SERVICES}/event`,
    body,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

const initialState: {
  type: string;
  message: string;
  errors?: any;
} = {
  type: "",
  message: "",
  errors: {},
};

function SubmitButton() {
  const { user, signInWithGoogle } = useAuth();
  const { pending } = useFormStatus();

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!user) {
      event.preventDefault(); // Prevent form submission

      const form = event.currentTarget.closest("form");
      if (form) {
        // Ensure form is valid before proceeding
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        const formData = new FormData(form);
        const dataToStore: { [key: string]: any } = {};
        formData.forEach((value, key) => {
          if (key !== "idToken") {
            // Don't store the empty token
            dataToStore[key] = value;
          }
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));

        const dataForBackend: IDataForBackend = {
          full_name: String(formData.get("name") || ""),
          email: String(formData.get("email") || ""),
          phone: String(formData.get("phone") || ""),
          job: String(formData.get("currentJob") || ""),
          question: String(formData.get("question") || ""),
        };
        await sendFormDataToBackend(dataForBackend);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
        signInWithGoogle();
      }
    }
  };

  if (pending) {
    return (
      <Button type="submit" className="w-full" disabled={true}>
        Đang gửi...
      </Button>
    );
  }

  return (
    <Button type="submit" className="w-full" onClick={handleClick}>
      {!user ? (
        <>
          <LogIn className="mr-2 h-4 w-4" />
          Đăng nhập để đăng ký
        </>
      ) : (
        <>
          <PenSquare className="mr-2 h-4 w-4" />
          Đăng ký miễn phí
        </>
      )}
    </Button>
  );
}

const RequiredIndicator = () => (
  <span className="text-destructive ml-1">*</span>
);

const STORAGE_KEY = "xno-event-registration-form";

const RegistrationForm = ({ event }: { event?: Event }) => {
  const { user } = useAuth();
  const [state, formAction] = useFormState(registerForEvent, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    currentJob: "",
    question: "",
  });
  const [idToken, setIdToken] = useState<string>("");
  const pathname = usePathname();
  const eventIdSlug = pathname.startsWith("/events/")
    ? pathname.split("/")[2]
    : "homepage-event";

  // Get ID Token
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

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // On successful registration, clear form and local storage
  useEffect(() => {
    if (state.type === "success") {
      toast({
        title: "Thành công!",
        description: state.message,
        className: "bg-green-100 dark:bg-green-900 border-green-400",
      });
      formRef.current?.reset();
      setFormData({
        name: "",
        email: "",
        phone: "",
        currentJob: "",
        question: "",
      });
      localStorage.removeItem(STORAGE_KEY);
    } else if (state.type === "error") {
      toast({
        title: "Lỗi",
        description:
          state.message || "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
        variant: "destructive",
      });
    }
  }, [state, toast]);

  // When user logs in, check for saved data and submit if found
  useEffect(() => {
    if (user && formRef.current) {
      const savedDataRaw = localStorage.getItem(STORAGE_KEY);
      if (savedDataRaw) {
        const submitButton = formRef.current.querySelector(
          'button[type="submit"]'
        );
        if (submitButton instanceof HTMLButtonElement) {
          // We wrap this in a timeout to ensure the user state (especially accessToken) is fully propagated
          setTimeout(async () => {
            // Re-populate form with saved data just before clicking
            try {
              const savedData = JSON.parse(savedDataRaw);
              if (formRef.current) {
                (
                  formRef.current.elements.namedItem("name") as HTMLInputElement
                ).value = savedData.name || "";
                (
                  formRef.current.elements.namedItem(
                    "phone"
                  ) as HTMLInputElement
                ).value = savedData.phone || "";
                (
                  formRef.current.elements.namedItem(
                    "currentJob"
                  ) as HTMLInputElement
                ).value = savedData.currentJob || "";
                (
                  formRef.current.elements.namedItem(
                    "question"
                  ) as HTMLTextAreaElement
                ).value = savedData.question || "";
              }
              const dataForBackend: IDataForBackend = {
                full_name: savedData.name,
                email: String(savedData.email),
                phone: String(savedData.phone),
                job: String(savedData.currentJob),
                question: String(savedData.question),
              };

              await sendFormDataToBackend(dataForBackend);
            } catch (e) {
              console.error(e);
            }

            submitButton.click();
          }, 500); // Increased timeout slightly
        }
      }
    }
  }, [user]);

  // Set initial form data from user profile if available, or from local storage
  useEffect(() => {
    let initialData = {
      name: "",
      email: "",
      phone: "",
      currentJob: "",
      question: "",
    };
    const savedDataRaw = localStorage.getItem(STORAGE_KEY);

    if (savedDataRaw) {
      try {
        initialData = { ...initialData, ...JSON.parse(savedDataRaw) };
      } catch (e) {
        console.error("Could not parse saved form data", e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    if (user) {
      initialData.name = user.displayName || initialData.name;
      initialData.email = user.email || initialData.email;
    }
    setFormData(initialData);
  }, [user]);

  return (
    <section id="form" className="bg-background">
      <div className="container flex justify-center">
        <Card className="w-full max-w-lg shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold font-headline">
              Đăng ký tham gia sự kiện
            </CardTitle>
            <CardDescription>
              Giữ chỗ cho workshop độc quyền này. Hoàn toàn miễn phí!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form ref={formRef} action={formAction} className="space-y-4">
              <input type="hidden" name="eventId" value={eventIdSlug} />
              <input type="hidden" name="idToken" value={idToken} />

              <div className="space-y-2">
                <Label htmlFor="name">
                  Họ và Tên
                  <RequiredIndicator />
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Nguyễn Văn A"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                {state.errors?.name && (
                  <p className="text-sm text-destructive">
                    {state.errors.name[0]}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email
                  <RequiredIndicator />
                </Label>
                <Input
                  id="email"
                  name="email"
                  placeholder="nguyenvana@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  type="email"
                  readOnly={!!user?.email}
                  className={!!user?.email ? "bg-muted" : ""}
                />
                {state.errors?.email && (
                  <p className="text-sm text-destructive">
                    {state.errors.email[0]}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Số điện thoại
                  <RequiredIndicator />
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="09xxxxxxxx"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
                {state.errors?.phone && (
                  <p className="text-sm text-destructive">
                    {state.errors.phone[0]}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentJob">Công việc hiện tại</Label>
                <Input
                  id="currentJob"
                  name="currentJob"
                  placeholder="Quant Trader tại ..."
                  value={formData.currentJob}
                  onChange={handleInputChange}
                />
                {state.errors?.currentJob && (
                  <p className="text-sm text-destructive">
                    {state.errors.currentJob[0]}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="question">Câu hỏi cho diễn giả</Label>
                <Textarea
                  id="question"
                  name="question"
                  placeholder="Tôi muốn hỏi về..."
                  value={formData.question}
                  onChange={handleInputChange}
                />
                {state.errors?.question && (
                  <p className="text-sm text-destructive">
                    {state.errors.question[0]}
                  </p>
                )}
              </div>
              <div className="space-y-4">
                <SubmitButton />
                {event && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Đừng quên đặt nhắc nhở để không bỏ lỡ sự kiện!
                    </p>
                    <AddToCalendarButton
                      event={event}
                      variant="outline"
                      className="w-full"
                    />
                  </div>
                )}
              </div>
              {state.errors?.idToken && (
                <p className="text-sm text-center text-destructive">
                  {state.errors.idToken[0]}
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default RegistrationForm;
