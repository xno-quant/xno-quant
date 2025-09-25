import Link from 'next/link';
import { Linkedin, Users, MessageSquare } from 'lucide-react';
import Logo from '@/components/logo';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );

const Footer = () => {
  return (
    <footer className="bg-muted text-muted-foreground">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="text-sm">Nơi hiện thực hóa ý tưởng giao dịch của bạn thành bot tự động</p>
            <TooltipProvider>
              <div className="flex gap-1 mt-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href="https://www.facebook.com/groups/xnoquant.vn" target="_blank" className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground"><Users className="w-5 h-5" /></Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Cộng đồng Facebook</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href="https://zalo.me/g/vysbax694" target="_blank" className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground"><MessageSquare className="w-5 h-5" /></Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Nhóm Zalo</p>
                    </TooltipContent>
                  </Tooltip>
                   <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href="https://www.facebook.com/xnoquant.vn" target="_blank" className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground"><FacebookIcon className="w-5 h-5" /></Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Trang Facebook</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href="https://www.linkedin.com/company/xnoquant" target="_blank" className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground"><Linkedin className="w-5 h-5" /></Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>LinkedIn</p>
                    </TooltipContent>
                  </Tooltip>
              </div>
            </TooltipProvider>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <h4 className="font-semibold text-foreground">Sự kiện</h4>
            <Link href="/events" className="hover:text-primary">Tất cả sự kiện</Link>
            {/* <Link href="/#about" className="hover:text-primary">Giới thiệu</Link> */}
            <Link href="/speakers" className="hover:text-primary">Diễn giả</Link>
            <Link href="/#schedule" className="hover:text-primary">Lịch trình</Link>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <h4 className="font-semibold text-foreground">Quant Platform</h4>
            <Link href="https://www.xnoquant.vn/dashboard" className="hover:text-primary">Tạo chiến lược</Link>
            <Link href="https://www.xnoquant.vn/leaderboard" className="hover:text-primary">Xếp Hạng Bot</Link>
            <Link href="https://www.xnoquant.vn/progression" className="hover:text-primary">Hướng dẫn</Link>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <h4 className="font-semibold text-foreground">CLB Quant & AI</h4>
            <Link href="/gioi-thieu" className="hover:text-primary">Giới thiệu CLB</Link>
            <Link href="https://www.facebook.com/groups/xnoquant.vn" target="_blank" rel="noopener noreferrer" className="hover:text-primary">Cộng đồng</Link>
            <Link href="https://zalo.me/g/vysbax694" target="_blank" rel="noopener noreferrer" className="hover:text-primary">Hỗ trợ</Link>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} - XNO Quant</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
