import { getAllSpeakers, Speaker } from '@/lib/events';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, BrainCircuit, Calendar, Globe, GraduationCap, Github, Linkedin, MessageSquare, Users, UserCheck, ArrowRight, Bot, CodeXml, Blocks, Rocket, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const AdvisorCard = ({ advisor }: { advisor: Speaker }) => (
    <Card className="flex flex-col text-center items-center p-6 transition-all duration-300 hover:shadow-xl hover:scale-105">
      <Avatar className="w-32 h-32 mb-4 border-4 border-background ring-4 ring-primary">
        <AvatarImage src={advisor.avatar} alt={advisor.name} className="object-cover" data-ai-hint="chân dung chuyên nghiệp" />
        <AvatarFallback>{advisor.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <h3 className="text-xl font-bold font-headline">{advisor.name}</h3>
      <p className="text-primary font-medium mb-2">{advisor.title}</p>
      <p className="text-sm text-muted-foreground mb-4 flex-grow">{advisor.summary}</p>
      <Button asChild variant="outline" size="sm">
         <Link href={`/speakers/${advisor.id}`}>
            Xem hồ sơ <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </Button>
    </Card>
);

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

export default async function AboutClubPage() {
    const advisors = await getAllSpeakers();

    return (
        <div className="bg-muted/20 pt-24">
            <section className="relative py-24 md:py-32 flex items-center justify-center overflow-hidden bg-card">
                <div className="absolute inset-0">
                    <Image 
                    src="https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=1470&auto=format&fit=crop"
                    alt="Abstract background"
                    fill
                    className="object-cover"
                    data-ai-hint="nền gradient trừu tượng"
                    />
                    <div className="absolute inset-0 bg-black/50"></div>
                </div>
                <div className="container relative z-10 text-center text-white">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4 font-headline">
                    CLB Quant & AI
                    </h1>
                    <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-200">
                    Nơi hội tụ, chia sẻ và phát triển cho cộng đồng đam mê Giao dịch định lượng và Trí tuệ nhân tạo tại Việt Nam.
                    </p>
                </div>
            </section>

            <section className="container py-20">
                 <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight mb-4 font-headline">Về chúng tôi</h2>
                        <div className="space-y-4 text-muted-foreground text-lg">
                           <p>
                                CLB Quant & AI được thành lập bởi XNO Quant với sứ mệnh xây dựng một cộng đồng vững mạnh, nơi các thành viên có thể học hỏi, trao đổi kiến thức và cùng nhau phát triển trong lĩnh vực giao dịch thuật toán và ứng dụng AI trong tài chính.
                           </p>
                           <p>
                                Chúng tôi tin rằng bằng cách chia sẻ và hợp tác, chúng ta có thể chinh phục những thử thách phức tạp của thị trường và tạo ra những giá trị bền vững.
                           </p>
                        </div>
                    </div>
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3"><Calendar className="w-7 h-7 text-primary" /> Lịch sinh hoạt</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div>
                                <h4 className="font-semibold text-lg">Tần suất</h4>
                                <p className="text-muted-foreground">Định kỳ <strong>hàng tháng</strong>, chúng tôi tổ chức các buổi workshop và offline chia sẻ kiến thức.</p>
                            </div>
                             <div>
                                <h4 className="font-semibold text-lg">Nội dung</h4>
                                <p className="text-muted-foreground">Mỗi buổi sinh hoạt sẽ xoay quanh một chủ đề "hot" trong ngành, từ các kỹ thuật phân tích dữ liệu, xây dựng mô hình AI, đến backtesting và triển khai bot giao dịch.</p>
                            </div>
                             <div>
                                <h4 className="font-semibold text-lg">Thông báo</h4>
                                <p className="text-muted-foreground">Lịch chi tiết và chủ đề sẽ được công bố trên các kênh truyền thông của CLB trước mỗi sự kiện.</p>
                            </div>
                        </CardContent>
                     </Card>
                 </div>
            </section>

            <section className="bg-card py-20">
                <div className="container">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight mb-4 font-headline flex items-center justify-center gap-3">
                           <UserCheck className="w-8 h-8" />
                            Đội ngũ cố vấn
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                           CLB tự hào có sự đồng hành của các chuyên gia hàng đầu trong lĩnh vực Công nghệ và Tài chính.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {advisors.map(advisor => (
                           <AdvisorCard key={advisor.id} advisor={advisor} />
                        ))}
                    </div>
                </div>
            </section>

             <section className="container py-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight mb-4 font-headline">Trải nghiệm Nền tảng XNO Quant</h2>
                    <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                        Biến ý tưởng giao dịch thành hiện thực. XNO Quant cung cấp bộ công cụ mạnh mẽ cho cả người mới bắt đầu và chuyên gia.
                    </p>
                </div>
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <Card className="text-center">
                        <CardHeader>
                             <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full mb-4 w-fit">
                                <Bot className="w-8 h-8" />
                            </div>
                            <CardTitle>Tạo bot bằng AI</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Sử dụng giao diện chat để mô tả chiến lược. AI sẽ giúp bạn hiện thực hoá ý tưởng và kiểm thử hiệu suất.</p>
                        </CardContent>
                    </Card>
                     <Card className="text-center">
                        <CardHeader>
                            <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full mb-4 w-fit">
                                <Award className="w-8 h-8" />
                            </div>
                            <CardTitle>Thi đấu trên BXH</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Cạnh tranh với cộng đồng Quant. Các chiến lược được đánh giá hiệu suất và xếp hạng công khai trên leaderboard của XNO.</p>
                        </CardContent>
                    </Card>
                     <Card className="text-center">
                        <CardHeader>
                             <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full mb-4 w-fit">
                                <Rocket className="w-8 h-8" />
                            </div>
                            <CardTitle>Chia sẻ lợi nhuận</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Biến thuật toán của bạn thành tài sản. Các chiến lược có hiệu suất vượt trội có thể được thương mại hoá ngay trên nền tảng của XNO.</p>
                        </CardContent>
                    </Card>
                </div>
                <div className="text-center mt-12">
                    <Button asChild size="lg" variant="link" className="text-lg">
                        <Link href="https://www.xnoquant.vn" target="_blank" rel="noopener noreferrer">
                            Khám phá ngay <ArrowRight className="w-5 h-5 ml-2"/>
                        </Link>
                    </Button>
                </div>
            </section>

             <section className="bg-card py-20">
                <div className="container text-center">
                    <h2 className="text-3xl font-bold tracking-tight mb-4 font-headline">Tham gia cộng đồng</h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10">
                        Kết nối với chúng tôi qua các nền tảng sau để không bỏ lỡ bất kỳ thông tin và sự kiện hấp dẫn nào!
                    </p>
                    <div className="flex flex-wrap justify-center gap-6">
                       <Button asChild size="lg">
                            <Link href="https://www.facebook.com/groups/xnoquant.vn" target="_blank" rel="noopener noreferrer" className="group relative overflow-hidden flex items-center justify-center w-48">
                                <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-full">
                                    <Users className="mr-2 h-5 w-5" />
                                    Nhóm Facebook
                                </span>
                                <span className="absolute inset-0 flex items-center justify-center translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                                    Tham gia <ArrowRight className="w-4 h-4 ml-2" />
                                </span>
                            </Link>
                       </Button>
                        <Button asChild size="lg" variant="secondary">
                            <Link href="https://zalo.me/g/vysbax694" target="_blank" rel="noopener noreferrer" className="group relative overflow-hidden flex items-center justify-center w-48">
                                 <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-full">
                                    <MessageSquare className="mr-2 h-5 w-5" />
                                    Nhóm Zalo
                                </span>
                                <span className="absolute inset-0 flex items-center justify-center translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                                    Tham gia <ArrowRight className="w-4 h-4 ml-2" />
                                </span>
                            </Link>
                       </Button>
                         <Button asChild size="lg">
                            <Link href="https://www.facebook.com/xnoquant.vn" target="_blank" rel="noopener noreferrer" className="group relative overflow-hidden flex items-center justify-center w-48">
                                 <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-full">
                                    <FacebookIcon className="mr-2 h-5 w-5" />
                                    Trang Facebook
                                </span>
                                <span className="absolute inset-0 flex items-center justify-center translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                                    Theo dõi <ArrowRight className="w-4 h-4 ml-2" />
                                </span>
                            </Link>
                       </Button>
                       <Button asChild size="lg" variant="secondary">
                            <Link href="https://www.linkedin.com/company/xnoquant" target="_blank" rel="noopener noreferrer" className="group relative overflow-hidden flex items-center justify-center w-48">
                                 <span className="absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-full">
                                    <Linkedin className="mr-2 h-5 w-5" />
                                    LinkedIn
                                </span>
                                <span className="absolute inset-0 flex items-center justify-center translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                                    Theo dõi <ArrowRight className="w-4 h-4 ml-2" />
                                </span>
                            </Link>
                       </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
