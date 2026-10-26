"use client";
import { AiMessage } from "@/components/AiMessage";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, LogOut, Plus, ShieldAlert, CheckCircle2, 
  Clock, Mail, Search, LayoutDashboard, X, Menu, ChevronDown,
  Lightbulb, UserCheck, Send, ArrowRight, Sun, Moon, Globe, Library, Users, TrendingUp, BarChart3, Trash2, Edit3, CreditCard, DollarSign, Wallet, Sparkles, Heart, ShieldCheck, UserCog, ShoppingBag, BookmarkCheck, AlertTriangle, HelpCircle
} from "lucide-react";

const getAvail = (b: any) => b.available_copies ?? b.availableCopies ?? b.available ?? 0;
const getTotal = (b: any) => b.total_copies ?? b.totalCopies ?? b.total ?? 5;
const getBookId = (b: any) => b.id || b._id;

const unwrap = (res: any) => res?.data?.data ?? res?.data;
const errMsg = (err: any) => {
  if (!err?.response) return err?.message === "Network Error" ? "Network Error: Check backend URL / CORS / file size" : (err?.message || "Something went wrong");
  const data = err?.response?.data;
  if (Array.isArray(data?.message)) return data.message.join(", ");
  return data?.message || data?.error || err?.message || "Something went wrong";
};

const getCover = (book: any) => {
  if (book?.coverUrl && book.coverUrl.trim() !== "") {
    let url = book.coverUrl.trim();
    if (url.startsWith("http://")) {
      url = url.replace("http://", "https://");
    }
    if (url.startsWith("https://")) {
      return url;
    }
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://shelfloop-backend.onrender.com";
    return `${backendUrl.replace(/\/$/, "")}${url.startsWith('/') ? '' : '/'}${url}`;
  }
  return "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1000&auto=format&fit=crop";
};

const aiQuotes = [
  {
    title1: { en: "Welcome To Your Digital", ar: "مرحبا بك في مساحتك" },
    title2: { en: "Reading Sanctuary.", ar: "الرقمية للقراءة." },
    desc: { en: "Explore a vast collection of knowledge, developer guides, and research materials thoughtfully organized for modern learners.", ar: "استكشف مجموعة واسعة من المعرفة وأدلة المطورين والمواد البحثية المنظمة بعناية للمتعلمين المعاصرين." }
  },
  {
    title1: { en: "Discover Thousands Of", ar: "اكتشف آلاف" },
    title2: { en: "Books & Resources.", ar: "الكتب والموارد." },
    desc: { en: "Step into an endlessly inspiring library crafted to expand your mind, sharpen your skill set, and guide your journey.", ar: "ادخل إلى مكتبة ملهمة بلا حدود مصممة لتوسيع آفاقك وصقل مهاراتك." }
  },
  {
    title1: { en: "Read, Learn & Build", ar: "اقرأ، تعلم، واصنع" },
    title2: { en: "Without Boundaries.", ar: "بلا حدود." },
    desc: { en: "Seamless borrowing, intelligent AI assistant recommendations, and structured cataloging built for every avid reader.", ar: "استعارة سلسة، توصيات ذكية من المساعد، وفهرسة منظمة لكل قارئ شغوف." }
  }
];

const categoryTranslations: Record<string, { en: string; ar: string }> = {
  "All": { en: "All Categories", ar: "جميع الأقسام" },
  "Programming": { en: "Programming", ar: "البرمجة" },
  "Novels": { en: "Novels", ar: "الروايات" },
  "War": { en: "War", ar: "الحرب" },
  "Horror": { en: "Horror", ar: "رعب" },
  "History": { en: "History", ar: "التاريخ" },
  "Self-Development": { en: "Self-Development", ar: "التنمية البشرية" }
};

const getCategoryLabel = (cat: string, lang: "en" | "ar") => {
  return categoryTranslations[cat]?.[lang] || cat;
};

const t = {
  en: {
    brand: "ShelfLoop",
    login: "Sign In",
    register: "Create Account",
    forgot: "Forgot Password?",
    otp: "Verify OTP",
    reset: "New Password",
    email: "Email Address",
    password: "Password",
    name: "Full Name",
    continue: "Continue",
    catalogTab: "Library Catalog",
    myBooksTab: "My Borrowed Books",
    myPurchasesTab: "My Library Collection",
    favoritesTab: "Favorite Books",
    finesTab: "Fines & Payments",
    contactTab: "Contact Us",
    aiTab: "Smart Advisor",
    adminTab: "Control Panel",
    borrowedTitle: "My Borrowed Library",
    borrowedDesc: "Manage your active borrowings, due dates, and returns seamlessly",
    purchasesTitle: "My Permanent Library Collection",
    purchasesDesc: "Books you own permanently with no return needed",
    favoritesTitle: "My Favorite Books",
    favoritesDesc: "Quickly access books you loved and saved for later",
    dueDate: "Due date:",
    returnBtn: "Return Book",
    catalogTitle: "Digital Catalog",
    catalogDesc: "Browse available books and borrow or purchase instantly",
    searchPlaceholder: "Search title or author...",
    borrowBtn: "Borrow",
    buyBtn: "Buy Book",
    outOfStock: "Out of Stock",
    availableCopies: "copies available",
    finesTitle: "Library Fines & Payments",
    finesDesc: "Review and settle your late return fees securely",
    noFines: "You have no pending fines. Great job!",
    noFavorites: "You haven't added any favorite books yet.",
    noPurchases: "You haven't purchased any books yet.",
    payNow: "Pay Now",
    daysLateLabel: "Days Late:",
    amountLabel: "Amount:",
    paymentMethodLabel: "Select Payment Method",
    cashMethod: "Pay at Library",
    cardMethod: "Credit / Debit Card",
    walletMethod: "Mobile Wallet",
    payConfirm: "Proceed to Checkout",
    contactTitle: "Contact Support",
    contactDesc: "Reach out directly for inquiries and assistance",
    messageLabel: "Message",
    sendBtn: "Send Message",
    sendingBtn: "Sending...",
    confirmBorrowTitle: "Confirm Borrowing",
    confirmBuyTitle: "Confirm Purchase",
    period: "Borrowing period:",
    days: "14 Days",
    fine: "Late fine:",
    fineVal: "5 EGP / day",
    cancel: "Cancel",
    confirm: "Confirm Borrow",
    confirmBuyBtn: "Proceed to Checkout",
    totalBooks: "Total Books",
    borrowedBooks: "Currently Borrowed",
    totalUsers: "Registered Users",
    engagement: "Engagement Rate",
    addBookTitle: "Add New Book",
    editBookTitle: "Edit Book Details",
    bookTitle: "Book Title",
    bookAuthor: "Author Name",
    bookCopies: "Copies Count",
    bookCategory: "Category",
    bookPrice: "Price (EGP)",
    saveBook: "Save Book",
    updateBook: "Update Book",
    noBorrows: "You haven't borrowed any books yet.",
    exploreBtn: "Browse Catalog",
    borrowRate: "Borrowing Rate Trend",
    categoryDist: "Real-time Categories Distribution",
    manageBooks: "Manage Library Books",
    deleteBook: "Delete",
    editBook: "Edit",
    aiTitle: "Smart Advisor",
    aiDesc: "Chat with our intelligent assistant to get instant book recommendations and insights.",
    aiPlaceholder: "Ask me about any book or programming topic...",
    aiSend: "Send",
    cashApprovalsTitle: "Cash & Fines Approvals",
    approveBtn: "Approve Payment",
    userLabel: "User",
    bookLabel: "Book",
    methodLabel: "Method",
    statusLabel: "Status",
    redirectingPay: "Redirecting to Secure Payment...",
    submitCashPurchase: "Submit Cash Purchase",
    submitCashPurchaseDesc: "Confirm cash payment",
    cancelRequestBtn: "Cancel Request",
    unitPriceLabel: "Unit Price",
    availableCopiesLabel: "Available Copies",
    numberOfCopiesLabel: "Number of Copies",
    totalCalculatedPriceLabel: "Total Calculated Price",
    ownedPermanently: "Owned Permanently",
    pendingApproval: "Pending Admin Approval",
    grandTotal: "Grand Total",
    categorySubtotal: "Category Subtotal",
    allCategories: "All Categories",
    platform: "Platform",
    services: "Services",
    system: "System",
    footerDesc: "A modern digital library platform designed for developers and technical learners to manage, borrow, and explore professional resources seamlessly.",
    apiVer: "API Version 1.0",
    secureGateway: "Secure Gateway",
    operational: "Operational",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    security: "Security",
    allRights: "All rights reserved.",
    next: "Next",
    prev: "Previous",
    page: "Page",
    of: "of",
    zoomIn: "Zoom In",
    zoomOut: "Zoom Out",
    resetZoom: "Reset"
  },
  ar: {
    brand: "شيلف لوب",
    login: "تسجيل الدخول",
    register: "إنشاء حساب جديد",
    forgot: "نسيت كلمة المرور؟",
    otp: "رمز التحقق",
    reset: "كلمة مرور جديدة",
    email: "البريد الإلكتروني",
    password: "كلمة السر",
    name: "الاسم بالكامل",
    continue: "متابعة",
    catalogTab: "كتالوج المكتبة",
    myBooksTab: "كتبي المستعارة",
    myPurchasesTab: "مكتبتي المملوكة",
    favoritesTab: "العناصر المفضلة",
    finesTab: "الغرامات والمدفوعات",
    contactTab: "تواصل معنا",
    aiTab: "المستشار الذكي",
    adminTab: "لوحة التحكم",
    borrowedTitle: "مكتبتي المستعارة",
    borrowedDesc: "إدارة الكتب التي تستعيرها ومتابعة مواعيد الإرجاع بسهولة",
    purchasesTitle: "مكتبتك المملوكة نهائياً",
    purchasesDesc: "الكتب التي قمت بشرائها وأصبحت ملكاً لك للأبد بدون إرجاع",
    favoritesTitle: "الكتب المفضلة",
    favoritesDesc: "الوصول السريع إلى الكتب التي أعجبتك وقمت بحفظها",
    dueDate: "تاريخ الإرجاع:",
    returnBtn: "إرجاع الكتاب",
    catalogTitle: "الكتب المتاحة",
    catalogDesc: "تصفح الكتب واستعر أو اقتن ما تحتاجه بضغطة زر",
    searchPlaceholder: "بحث عن كتاب أو مؤلف...",
    borrowBtn: "استعارة",
    buyBtn: "شراء الكتاب",
    outOfStock: "نفدت النسخ",
    availableCopies: "نسخة متاحة",
    finesTitle: "الغرامات ومستحقات التأخير",
    finesDesc: "متابعة وسداد غرامات التأخير الخاصة بكتب المكتبة بأمان",
    noFines: "ليس لديك أي غرامات معلقة. عمل ممتاز!",
    noFavorites: "لم تقم بإضافة أي كتب إلى المفضلة حتى الآن.",
    noPurchases: "لم تقم بشراء أي كتب حتى الآن.",
    payNow: "دفع الآن",
    daysLateLabel: "أيام التأخير:",
    amountLabel: "المبلغ المستحق:",
    paymentMethodLabel: "اختر طريقة الدفع",
    cashMethod: "الدفع نقداً بالمكتبة",
    cardMethod: "بطاقة ائتمانية",
    walletMethod: "المحفظة الإلكترونية",
    payConfirm: "الانتقال إلى بوابة الدفع",
    contactTitle: "تواصل مع الدعم",
    contactDesc: "يسعدنا الإجابة على جميع استفساراتك المباشرة",
    messageLabel: "الرسالة",
    sendBtn: "إرسال الرسالة",
    sendingBtn: "جاري الإرسال...",
    confirmBorrowTitle: "تأكيد استعارة الكتاب",
    confirmBuyTitle: "تأكيد شراء الكتاب",
    period: "مدة الاستعارة:",
    days: "14 يوماً",
    fine: "غرامة التأخير:",
    fineVal: "5 ج.م / يوم",
    cancel: "إلغاء",
    confirm: "تأكيد الاستعارة",
    confirmBuyBtn: "تأكيد وإتمام الحجز",
    totalBooks: "إجمالي كتب المكتبة",
    borrowedBooks: "الكتب المستعارة",
    totalUsers: "المستخدمين المسجلين",
    engagement: "نسبة التفاعل",
    addBookTitle: "إضافة كتاب جديد",
    editBookTitle: "تعديل بيانات الكتاب",
    bookTitle: "عنوان الكتاب",
    bookAuthor: "اسم المؤلف",
    bookCopies: "عدد النسخ",
    bookCategory: "القسم / الفئة",
    bookPrice: "السعر (ج.م)",
    saveBook: "حفظ الكتاب",
    updateBook: "تحديث الكتاب",
    noBorrows: "لم تقم باستعارة أي كتب حتى الآن.",
    exploreBtn: "تصفح الكتالوج الآن",
    borrowRate: "مؤشر معدل الاستعارة",
    categoryDist: "التوزيع الفعلي للأقسام والمجالات",
    manageBooks: "إدارة وحذف كتب المكتبة",
    deleteBook: "حذف نهائي",
    editBook: "تعديل",
    aiTitle: "المستشار الذكي",
    aiDesc: "تحدث مع المساعد الذكي للحصول على اقتراحات فورية للكتب والمراجع.",
    aiPlaceholder: "اسأل عن أي كتاب أو موضوع برمجي...",
    aiSend: "إرسال",
    cashApprovalsTitle: "مراجعة الغرامات والمدفوعات المعلقة",
    approveBtn: "قبول الدفع",
    userLabel: "المستخدم",
    bookLabel: "الكتاب",
    methodLabel: "الطريقة",
    statusLabel: "الحالة",
    redirectingPay: "جاري تحويلك لبوابة الدفع الآمنة...",
    submitCashPurchase: "تأكيد الدفع نقداً",
    submitCashPurchaseDesc: "إرسال طلب الشراء نقداً",
    cancelRequestBtn: "إلغاء الطلب",
    unitPriceLabel: "سعر الوحدة",
    availableCopiesLabel: "النسخ المتاحة",
    numberOfCopiesLabel: "عدد النسخ المطلوبة",
    totalCalculatedPriceLabel: "إجمالي السعر المحسوب",
    ownedPermanently: "مملوك نهائياً",
    pendingApproval: "قيد المراجعة والانتظار",
    grandTotal: "الإجمالي الكلي",
    categorySubtotal: "إجمالي القسم",
    allCategories: "جميع الأقسام",
    platform: "المنصة",
    services: "الخدمات",
    system: "النظام",
    footerDesc: "منصة مكتبة رقمية حديثة مصممة للمطورين والمتعلمين لإدارة واستعارة واستكشاف الموارد الاحترافية بسهولة.",
    apiVer: "إصدار الواجهة 1.0",
    secureGateway: "بوابة آمنة",
    operational: "يعمل بكفاءة",
    privacyPolicy: "سياسة الخصوصية",
    termsOfService: "شروط الخدمة",
    security: "الأمان",
    allRights: "جميع الحقوق محفوظة.",
    next: "التالي",
    prev: "السابق",
    page: "صفحة",
    of: "من",
    zoomIn: "تكبير",
    zoomOut: "تصغير",
    resetZoom: "إعادة الضبط"
  }
};

export default function Page() {
  const [isMounted, setIsMounted] = useState(false);
  const [lang, setLang] = useState<"en" | "ar">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("shelfloop_lang") as "en" | "ar" | null;
      return saved || "en";
    }
    return "en";
  });
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("shelfloop_theme") as "dark" | "light" | null;
      return saved || "dark";
    }
    return "dark";
  });
  const [zoom, setZoom] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("shelfloop_zoom");
      return saved ? parseInt(saved) : 100;
    }
    return 100;
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [BOOKS_PER_PAGE, setBooksPerPage] = useState(8);
  useEffect(() => {
    const updatePerPage = () => {
      if (typeof window !== "undefined") {
        setBooksPerPage(window.innerWidth < 640 ? 6 : 8);
      }
    };
    updatePerPage();
    window.addEventListener("resize", updatePerPage);
    return () => window.removeEventListener("resize", updatePerPage);
  }, []);
  const [user, setUser] = useState<any>(null);
  const [books, setBooks] = useState<any[]>([]);
  const [borrows, setBorrows] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [fines, setFines] = useState<any[]>([]);
  const [dismissedFines, setDismissedFines] = useState<string[]>([]);
  const [fineFilter, setFineFilter] = useState<"ALL" | "PENDING" | "PAID">("ALL");
  const [fineDropdownOpen, setFineDropdownOpen] = useState(false);
  const [adminFines, setAdminFines] = useState<any[]>([]);
  const [adminPurchases, setAdminPurchases] = useState<any[]>([]);
  const [dismissedAdminFines, setDismissedAdminFines] = useState<string[]>([]);
  const [adminMethodFilter, setAdminMethodFilter] = useState<"ALL" | "CASH" | "CARD" | "WALLET">("ALL");
  const [adminStatusFilter, setAdminStatusFilter] = useState<"ALL" | "PENDING" | "PAID">("ALL");
  const [adminMethodDropdownOpen, setAdminMethodDropdownOpen] = useState(false);
  const [adminStatusDropdownOpen, setAdminStatusDropdownOpen] = useState(false);
  const [selectedFine, setSelectedFine] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<"CARD" | "WALLET" | "CASH">("CARD");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const [isProcessingBorrow, setIsProcessingBorrow] = useState(false);

  const [buyPaymentMethod, setBuyPaymentMethod] = useState<"CARD" | "WALLET" | "CASH">("CARD");
  const [isProcessingBuy, setIsProcessingBuy] = useState(false);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [buyError, setBuyError] = useState("");

  const [allBorrowsList, setAllBorrowsList] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [activeUserMenu, setActiveUserMenu] = useState<string | null>(null);
  const [emailUserTarget, setEmailUserTarget] = useState<any | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const [mode, setMode] = useState<"login" | "register" | "forgot" | "otp" | "reset">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", otp: "", newPass: "" });
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ title: string; message: string; onConfirm: () => void; type?: "danger" | "warning" | "info" } | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [hint, setHint] = useState<any>(null);
  const [buyHint, setBuyHint] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"catalog" | "mybooks" | "purchases" | "favorites" | "fines" | "contact" | "ai" | "admin">("catalog");
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactSent, setContactSent] = useState(false);

  const [editingBook, setEditingBook] = useState<any>(null);
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [showBooksModal, setShowBooksModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showBorrowsModal, setShowBorrowsModal] = useState(false);

  const [aiQuoteIndex, setAiQuoteIndex] = useState(0);

  const [aiMessages, setAiMessages] = useState([
    { role: "ai", text: "Hello! I'm your Advisor AI assistant. Ask me for book recommendations in English or Arabic." }
  ]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [newBook, setNewBook] = useState({ title: "", author: "Robert Martin", totalCopies: 5, category: "Programming", price: 150 });
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const text = t[lang];
  const isDark = theme === "dark";

  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => {
        setMsg(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [msg]);

  const toggleLanguage = () => {
    const nextLang = lang === "en" ? "ar" : "en";
    setLang(nextLang);
    document.documentElement.dir = nextLang === "ar" ? "rtl" : "ltr";
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("shelfloop_theme", newTheme);
  };

  useEffect(() => {
    localStorage.setItem("shelfloop_lang", lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("shelfloop_theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("shelfloop_zoom", String(zoom));
    const root = document.documentElement;
    (root.style as any).zoom = `${zoom}%`;
  }, [zoom]);

  const changeZoom = (delta: number) => {
    setZoom((prev) => {
      const next = Math.min(125, Math.max(75, prev + delta));
      return next;
    });
  };

  const hardLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setUser(null);
    setBooks([]);
    setBorrows([]);
    setPurchases([]);
    setFavorites([]);
    setFines([]);
    setAdminFines([]);
    setAdminPurchases([]);
  };

  const dismissFineCard = (fineId: string) => {
    setDismissedFines(prev => [...prev, fineId]);
  };

  const dismissAdminFineCard = (fineId: string) => {
    setDismissedAdminFines(prev => [...prev, fineId]);
  };

  useEffect(() => {
    setIsMounted(true);
    const savedLang = localStorage.getItem("shelfloop_lang") as "en" | "ar" | null;
    const savedTheme = localStorage.getItem("shelfloop_theme") as "dark" | "light" | null;
    const savedZoom = localStorage.getItem("shelfloop_zoom");
    if (savedLang) setLang(savedLang);
    if (savedTheme) setTheme(savedTheme);
    if (savedZoom) setZoom(parseInt(savedZoom));
    document.documentElement.dir = savedLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = savedLang || "en";

    const quoteInterval = setInterval(() => {
      setAiQuoteIndex((prev) => (prev + 1) % aiQuotes.length);
    }, 5000);

    try {
      const u = localStorage.getItem("user");
      const tToken = localStorage.getItem("access_token");
      if (u && tToken && u !== "undefined" && tToken !== "undefined") {
        setUser(JSON.parse(u));
        fetchAll();
      } else {
        localStorage.clear();
      }
    } catch {
      localStorage.clear();
    }

    const handlePaymentCallback = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const checkout = searchParams.get("checkout");
      const fineId = searchParams.get("fineId");
      const purchaseId = searchParams.get("purchaseId");
      const borrowId = searchParams.get("borrowId");

      if (checkout === "success" && fineId) {
        try {
          await api.post(`/fines/${fineId}/confirm-online-payment`);
          setMsg({ text: "Payment completed & verified successfully!", type: "success" });
          fetchAll();
        } catch (err: any) {
          setMsg({ text: "Payment completed, updating status...", type: "info" });
          fetchAll();
        }
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (checkout === "success" && purchaseId) {
        try {
          await api.post(`/purchases/${purchaseId}/confirm-online-payment`);
          setMsg({ text: "Book purchase completed & verified successfully!", type: "success" });
          fetchAll();
        } catch (err: any) {
          setMsg({ text: "Purchase completed, updating status...", type: "info" });
          fetchAll();
        }
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (checkout === "success" && borrowId) {
        try {
          setMsg({ text: "Book borrowing fee completed & verified successfully!", type: "success" });
          fetchAll();
        } catch (err: any) {
          fetchAll();
        }
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (checkout === "cancel") {
        setMsg({ text: "Payment process was canceled.", type: "error" });
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handlePaymentCallback();

    return () => clearInterval(quoteInterval);
  }, []);

  const fetchAll = async () => {
    try {
      const b = await api.get("/books");
      const list = unwrap(b);
      setBooks(Array.isArray(list) ? list : list?.items || []);
    } catch (err: any) {
      if (err?.response?.status === 401) { hardLogout(); return; }
    }

    try {
      const br = await api.get("/borrows/my");
      const list = unwrap(br);
      setBorrows(Array.isArray(list) ? list : list?.items || []);
    } catch (err: any) {
      if (err?.response?.status === 401) { hardLogout(); }
    }

    try {
      const pr = await api.get("/purchases/my");
      const list = unwrap(pr);
      setPurchases(Array.isArray(list) ? list : list?.items || []);
    } catch (err: any) {}

    try {
      const fav = await api.get("/favorites/my");
      const list = unwrap(fav);
      setFavorites(Array.isArray(list) ? list : list?.items || []);
    } catch (err: any) {}

    try {
      const fr = await api.get("/fines/my");
      const list = unwrap(fr);
      setFines(Array.isArray(list) ? list : list?.items || []);
    } catch (err: any) {}

    try {
      const allBr = await api.get("/borrows");
      const allList = unwrap(allBr);
      if (Array.isArray(allList)) {
        setAllBorrowsList(allList);
      }
    } catch {}

    try {
      const usrRes = await api.get("/users");
      const usrList = unwrap(usrRes);
      if (Array.isArray(usrList)) {
        setUsersList(usrList);
      }
    } catch {}

    try {
      const adminFinesRes = await api.get("/fines/admin/all");
      const adminFinesList = unwrap(adminFinesRes);
      if (Array.isArray(adminFinesList)) {
        setAdminFines(adminFinesList);
      }
    } catch {}

    try {
      const adminPurchasesRes = await api.get("/purchases/admin/all");
      const adminPurchasesList = unwrap(adminPurchasesRes);
      if (Array.isArray(adminPurchasesList)) {
        setAdminPurchases(adminPurchasesList);
      }
    } catch {}
  };

  const toggleFavorite = async (bookId: string) => {
    const wasFav = favorites.some((b: any) => getBookId(b) === bookId);
    const targetBook = books.find((b: any) => getBookId(b) === bookId) || favorites.find((b: any) => getBookId(b) === bookId);
    if (wasFav) {
      setFavorites((prev: any[]) => prev.filter((b: any) => getBookId(b) !== bookId));
    } else if (targetBook) {
      setFavorites((prev: any[]) => [...prev, targetBook]);
    }
    try {
      await api.post(`/favorites/${bookId}`);
    } catch (err: any) {
      if (wasFav && targetBook) {
        setFavorites((prev: any[]) => [...prev, targetBook]);
      } else {
        setFavorites((prev: any[]) => prev.filter((b: any) => getBookId(b) !== bookId));
      }
      setMsg({ text: errMsg(err), type: "error" });
    } finally {
      try {
        const fav = await api.get("/favorites/my");
        const list = unwrap(fav);
        setFavorites(Array.isArray(list) ? list : list?.items || []);
      } catch {}
    }
  };

  const isFavorite = (bookId: string) => {
    return favorites.some((b: any) => getBookId(b) === bookId);
  };

  const isPurchased = (bookId: string) => {
    return purchases.some((p: any) => p.status === "PAID" && (p.bookId === bookId || getBookId(p.book) === bookId));
  };

  const isPurchasePending = (bookId: string) => {
    return purchases.some((p: any) => p.status === "PENDING" && (p.bookId === bookId || getBookId(p.book) === bookId));
  };

  const cancelPurchaseAction = async (bookId: string) => {
    const pendingP = purchases.find(
      (p: any) => p.status === "PENDING" && (p.bookId === bookId || getBookId(p.book) === bookId)
    );

    if (!pendingP) return;

    setConfirmModal({
      title: lang === "ar" ? "إلغاء طلب الشراء" : "Cancel Purchase Request",
      message: lang === "ar" ? "هل أنت متأكد أنك تريد إلغاء طلب الشراء المعلق هذا؟" : "Are you sure you want to cancel this pending purchase request?",
      type: "warning",
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await api.delete(`/purchases/${pendingP.id}/cancel`);
          setMsg({ text: lang === "ar" ? "تم إلغاء طلب الشراء بنجاح!" : "Purchase request cancelled successfully!", type: "success" });
          fetchAll();
        } catch (err: any) {
          setMsg({ text: errMsg(err), type: "error" });
        }
      }
    });
  };

  const deleteBook = async (bookId: string) => {
    setConfirmModal({
      title: lang === "ar" ? "حذف الكتاب نهائياً" : "Delete Book Permanently",
      message: lang === "ar" ? "هل أنت متأكد أنك تريد حذف هذا الكتاب نهائياً؟ لا يمكن التراجع عن هذا الإجراء." : "Are you sure you want to delete this book permanently? This action cannot be undone.",
      type: "danger",
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await api.delete(`/books/${bookId}`);
          setMsg({ text: lang === "ar" ? "تم حذف الكتاب بنجاح!" : "Book deleted successfully!", type: "success" });
          fetchAll();
        } catch (err: any) {
          setMsg({ text: errMsg(err), type: "error" });
        }
      }
    });
  };

  const deleteUser = async (userId: string) => {
    setConfirmModal({
      title: lang === "ar" ? "تعطيل المستخدم" : "Deactivate User",
      message: lang === "ar" ? "هل أنت متأكد أنك تريد تعطيل / حذف هذا المستخدم؟" : "Are you sure you want to deactivate/delete this user?",
      type: "danger",
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await api.delete(`/users/${userId}`);
          setMsg({ text: lang === "ar" ? "تم تعطيل المستخدم بنجاح!" : "User deactivated successfully!", type: "success" });
          setActiveUserMenu(null);
          fetchAll();
        } catch (err: any) {
          setMsg({ text: errMsg(err), type: "error" });
        }
      }
    });
  };

  const updateUserRole = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    try {
      await api.patch(`/users/${userId}/role`, { role: nextRole });
      setMsg({ text: "User role updated successfully!", type: "success" });
      setActiveUserMenu(null);
      fetchAll();
    } catch (err: any) {
      setMsg({ text: errMsg(err), type: "error" });
    }
  };

  const handleSendDirectEmail = async (e: any) => {
    e.preventDefault();
    if (!emailUserTarget) return;
    setIsSendingEmail(true);
    try {
      await api.post("/users/send-email", {
        to: emailUserTarget.email,
        subject: emailSubject,
        message: emailMessage,
      });
      setMsg({ text: `Email sent to ${emailUserTarget.email} successfully!`, type: "success" });
      setEmailUserTarget(null);
      setEmailSubject("");
      setEmailMessage("");
    } catch (err: any) {
      setMsg({ text: errMsg(err), type: "error" });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const updateBook = async (e: any) => {
    e.preventDefault();
    if (!editingBook) return;
    try {
      const bookId = getBookId(editingBook);
      if (editCoverFile) {
        const formData = new FormData();
        formData.append("file", editCoverFile);
        const coverRes = await api.put(`/books/${bookId}/cover`, formData);
        const coverData = unwrap(coverRes);
        const newTotal = Number(editingBook.totalCopies ?? editingBook.total_copies ?? 5);
        const payload: any = {
          title: editingBook.title,
          author: editingBook.author,
          totalCopies: newTotal,
          category: editingBook.category || "Programming",
          price: Number(editingBook.price || 0),
        };
        await api.put(`/books/${bookId}`, payload);
      } else {
        const newTotal = Number(editingBook.totalCopies ?? editingBook.total_copies ?? 5);
        const payload: any = {
          title: editingBook.title,
          author: editingBook.author,
          totalCopies: newTotal,
          category: editingBook.category || "Programming",
          price: Number(editingBook.price || 0),
          coverUrl: editingBook.coverUrl,
        };
        await api.put(`/books/${bookId}`, payload);
      }
      setMsg({ text: "Book updated successfully! Old image deleted.", type: "success" });
      setEditingBook(null);
      setEditCoverFile(null);
      await fetchAll();
      setTimeout(() => fetchAll(), 500);
    } catch (err: any) {
      setMsg({ text: errMsg(err), type: "error" });
    }
  };

  const handleAuth = async (e: any) => {
    e.preventDefault();
    setMsg({ text: "Processing...", type: "info" });
    try {
      if (mode === "login") {
        const res = await api.post("/auth/login", { email: form.email, password: form.password });
        const payload = unwrap(res);
        const token = payload?.access_token || payload?.token;
        if (!token) throw new Error("No token returned");
        const safe = payload.user || { name: form.email.split("@")[0], email: form.email, role: "USER" };
        localStorage.setItem("access_token", token);
        localStorage.setItem("user", JSON.stringify(safe));
        setUser(safe);
        setMsg({ text: "Welcome back!", type: "success" });
        setForm({ name: "", email: "", password: "", otp: "", newPass: "" });
        setTimeout(() => fetchAll(), 300);
      }
      if (mode === "register") {
        const emailToVerify = form.email;
        await api.post("/auth/register", { name: form.name, email: form.email, password: form.password });
        setMsg({ text: "OTP sent to your email. Please verify below.", type: "success" });
        setForm({ name: "", email: emailToVerify, password: "", otp: "", newPass: "" });
        setMode("otp");
        return;
      }
      if (mode === "otp") {
        if (!form.email || !form.email.trim()) {
          setMsg({ text: "Email is missing. Please enter your email again.", type: "error" });
          setMode("register");
          return;
        }
        await api.post("/auth/verify-register", { email: form.email.trim(), otp: form.otp.trim() });
        setMsg({ text: "Account created successfully! Please sign in.", type: "success" });
        setForm({ name: "", email: "", password: "", otp: "", newPass: "" });
        setMode("login");
        return;
      }
      if (mode === "forgot") {
        const emailToVerify = form.email;
        await api.post("/auth/forgot-password", { email: form.email });
        setMsg({ text: "OTP code sent to your email", type: "success" });
        setForm({ name: "", email: emailToVerify, password: "", otp: "", newPass: "" });
        setMode("otp");
        return;
      }
      if (mode === "reset") {
        await api.post("/auth/reset-password", { email: form.email, otp: form.otp, newPassword: form.newPass });
        setMsg({ text: "Password reset successful!", type: "success" });
        setForm({ name: "", email: "", password: "", otp: "", newPass: "" });
        setMode("login");
      }
    } catch (err: any) {
      setMsg({ text: errMsg(err), type: "error" });
    }
  };

  const confirmBorrow = async () => {
    if (!hint) return;
    setIsProcessingBorrow(true);
    try {
      await api.post(`/borrows/${getBookId(hint)}`);
      setMsg({ text: `Successfully borrowed "${hint.title}"!`, type: "success" });
      setHint(null);
      fetchAll();
    } catch (err: any) {
      if (err?.response?.status === 401) { hardLogout(); }
      setMsg({ text: errMsg(err), type: "error" });
    } finally {
      setIsProcessingBorrow(false);
      setHint(null);
    }
  };

  const confirmPurchase = async () => {
    if (!buyHint) return;
    const available = getAvail(buyHint);
    if (buyQuantity > available) {
      setBuyError(`Requested quantity (${buyQuantity}) exceeds available copies (${available}).`);
      return;
    }
    setBuyError("");
    setIsProcessingBuy(true);
    try {
      const unitPrice = Number(buyHint.price || 0.0);
      const res = await api.post(`/purchases`, { 
        bookId: getBookId(buyHint), 
        quantity: buyQuantity,
        price: unitPrice, 
        method: buyPaymentMethod 
      });
      const checkoutUrl = res.data?.url || res.data?.data?.url;

      if ((buyPaymentMethod === "CARD" || buyPaymentMethod === "WALLET") && checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }

      setMsg({ text: `Purchase request for "${buyHint.title}" (${buyQuantity} copies) submitted successfully! Waiting for admin approval.`, type: "success" });
      setBuyHint(null);
      fetchAll();
    } catch (err: any) {
      if (err?.response?.status === 401) { hardLogout(); }
      setMsg({ text: errMsg(err), type: "error" });
    } finally {
      setIsProcessingBuy(false);
    }
  };

  const doReturn = async (borrowItem: any) => {
    const bookId = borrowItem.bookId || borrowItem.book?.id;
    try {
      await api.post(`/borrows/${bookId}/return`);
      setMsg({ text: "Book returned successfully!", type: "success" });
      fetchAll();
    } catch (err: any) {
      setMsg({ text: errMsg(err), type: "error" });
    }
  };

  const payFineAction = async () => {
    if (!selectedFine) return;
    setIsProcessingPayment(true);

    try {
      const res = await api.post(`/fines/${selectedFine.id}/pay`, { method: paymentMethod });
      const checkoutUrl = res.data?.url || res.data?.data?.url;

      if ((paymentMethod === "CARD" || paymentMethod === "WALLET") && checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }

      setMsg({ text: "Payment request submitted successfully!", type: "success" });
      setSelectedFine(null);
      fetchAll();
    } catch (err: any) {
      setMsg({ text: errMsg(err), type: "error" });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const approveCashPayment = async (itemId: string, type: "FINE" | "PURCHASE" = "FINE") => {
    try {
      if (type === "PURCHASE") {
        await api.post(`/purchases/${itemId}/confirm-cash`);
      } else {
        await api.post(`/fines/${itemId}/confirm-cash`);
      }
      setMsg({ text: "Payment approved successfully!", type: "success" });
      fetchAll();
    } catch (err: any) {
      setMsg({ text: errMsg(err), type: "error" });
    }
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      if (file.size < 1024 * 1024) {
        resolve(file);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxSize = 1024;
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }
              const compressed = new File([blob], file.name.replace(/\.\w+$/, '.jpg'), {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressed);
            },
            'image/jpeg',
            0.7
          );
        };
        img.onerror = () => resolve(file);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  };

  const addBook = async () => {
    if (!newBook.title?.trim() || !newBook.author?.trim()) {
      setMsg({ text: "Please fill Book Title and Author", type: "error" });
      return;
    }
    try {
      setMsg({ text: "Compressing and uploading...", type: "info" });
      let fileToUpload: File | null = null;
      if (coverFile) {
        fileToUpload = await compressImage(coverFile);
      }
      const formData = new FormData();
      formData.append("title", newBook.title.trim());
      formData.append("author", newBook.author.trim());
      formData.append("totalCopies", String(Number(newBook.totalCopies) || 5));
      formData.append("category", newBook.category?.trim() || "Programming");
      formData.append("price", String(Number(newBook.price) || 0));
      formData.append("isbn", "987-" + Math.floor(100000000 + Math.random() * 900000000));
      if (fileToUpload) {
        formData.append("file", fileToUpload);
      }
      await api.post("/books", formData, {
        timeout: 60000,
      });
      setMsg({ text: "Book added successfully with cover!", type: "success" });
      setNewBook({ title: "", author: "Robert Martin", totalCopies: 5, category: "Programming", price: 150 });
      setCoverFile(null);
      fetchAll();
    } catch (err: any) {
      console.error("Add book error:", err?.response?.data || err.message);
      if (err?.code === 'ECONNABORTED' || err?.message?.includes('Network Error')) {
        setMsg({ text: "Upload timed out on mobile. Try a smaller image or use WiFi. Book will be created without cover if upload fails.", type: "error" });
        try {
          const fallbackForm = new FormData();
          fallbackForm.append("title", newBook.title.trim());
          fallbackForm.append("author", newBook.author.trim());
          fallbackForm.append("totalCopies", String(Number(newBook.totalCopies) || 5));
          fallbackForm.append("category", newBook.category?.trim() || "Programming");
          fallbackForm.append("price", String(Number(newBook.price) || 0));
          fallbackForm.append("isbn", "987-" + Math.floor(100000000 + Math.random() * 900000000));
          await api.post("/books", fallbackForm, { timeout: 30000 });
          setMsg({ text: "Book created without cover due to mobile timeout. You can edit cover later.", type: "info" });
          setNewBook({ title: "", author: "Robert Martin", totalCopies: 5, category: "Programming", price: 150 });
          setCoverFile(null);
          fetchAll();
        } catch {}
      } else {
        setMsg({ text: errMsg(err), type: "error" });
      }
    }
  };

  const handleContactSubmit = async (e: any) => {
    e.preventDefault();
    setContactSent(true);
    try {
      await api.post("/contact", {
        name: contactForm.name,
        email: contactForm.email,
        message: contactForm.message,
      });
      setMsg({ text: "Message sent!", type: "success" });
      setContactForm({ name: "", email: "", message: "" });
    } catch (err: any) {
      setMsg({ text: errMsg(err), type: "error" });
    } finally {
      setContactSent(false);
    }
  };

  const sendAiMessage = async (e: any) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const userMsg = aiInput;
    setAiMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setAiInput("");
    setAiLoading(true);

    try {
      const res = await api.post("/ai/chat", { prompt: userMsg });
      const reply = res.data?.reply || res.data?.data?.reply;
      
      if (reply) {
        setAiMessages(prev => [...prev, { role: "ai", text: reply }]);
      } else {
        setAiMessages(prev => [...prev, { role: "ai", text: "No reply received from server." }]);
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to connect to AI service.";
      setAiMessages(prev => [...prev, { role: "ai", text: `Error: ${errorMsg}` }]);
    } finally {
      setAiLoading(false);
    }
  };

  const categories = ["All", ...Array.from(new Set(books.map((b: any) => b.category || "Programming")))];
  
  const categoryStats = (() => {
    if (books.length === 0) return [];
    const counts: Record<string, number> = {};
    books.forEach((b: any) => {
      const cat = b.category || "Programming";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / books.length) * 100)
    }));
  })();

  const purchasesByCategory = (() => {
    const map: Record<string, { category: string; items: any[]; subtotal: number }> = {};
    purchases.forEach((p: any) => {
      const cat = p.book?.category || "Programming";
      if (!map[cat]) {
        map[cat] = { category: cat, items: [], subtotal: 0 };
      }
      map[cat].items.push(p);
      map[cat].subtotal += (p.price || 0);
    });
    return Object.values(map);
  })();

  const grandTotalPurchases = purchases.reduce((sum, p) => sum + (p.price || 0), 0);

  const filtered = books.filter((b: any) => {
    const matchSearch = ((b.title || "") + (b.author || "")).toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === "All" || (b.category || "Programming") === selectedCategory;
    return matchSearch && matchCat;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / BOOKS_PER_PAGE));
  const paginatedBooks = filtered.slice((currentPage - 1) * BOOKS_PER_PAGE, currentPage * BOOKS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [search, selectedCategory]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [BOOKS_PER_PAGE]);

  const filteredFines = fines.filter((f: any) => {
    if (dismissedFines.includes(f.id)) return false;
    if (fineFilter === "PENDING") return f.status === "PENDING";
    if (fineFilter === "PAID") return f.status === "PAID";
    return true;
  });

  const combinedTransactions = [
    ...adminFines.map(f => ({ ...f, txType: "FINE" })),
    ...adminPurchases.map(p => ({ ...p, txType: "PURCHASE", amount: p.price, borrowing: { book: p.book } }))
  ];

  const filteredAdminFines = combinedTransactions.filter((f: any) => {
    if (dismissedAdminFines.includes(f.id)) return false;
    if (adminMethodFilter !== "ALL" && f.method !== adminMethodFilter) return false;
    if (adminStatusFilter !== "ALL" && f.status !== adminStatusFilter) return false;
    return true;
  });

  if (!isMounted) {
    return null;
  }

  if (!user) {
    const currentQuote = aiQuotes[aiQuoteIndex];

    return (
      <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans overflow-hidden bg-stone-950 text-amber-50 selection:bg-amber-500 selection:text-stone-950">
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `* { font-family: 'Plus Jakarta Sans', sans-serif !important; }` }} />
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.div 
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.3, 0.45, 0.3]
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2070&auto=format&fit=crop')`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a09] via-stone-950/80 to-[#0c0a09]/90" />
          <motion.div 
            animate={{
              x: [-20, 20, -20],
              y: [-10, 10, -10]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-amber-500/15 rounded-full blur-[160px] pointer-events-none" 
          />
          <motion.div 
            animate={{
              x: [20, -20, 20],
              y: [10, -10, 10]
            }}
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-orange-600/15 rounded-full blur-[160px] pointer-events-none" 
          />
        </div>

        <div className="absolute top-6 right-6 flex items-center gap-3 z-30">
          <button 
            onClick={toggleLanguage} 
            className="px-4 py-2 rounded-xl text-xs font-bold border border-amber-500/30 bg-stone-900/80 text-amber-400 backdrop-blur-md hover:bg-stone-800 transition flex items-center gap-2 shadow-lg"
          >
            <Globe className="w-4 h-4"/>
            <span>{lang === "en" ? "العربية" : "English"}</span>
          </button>
          <button 
            onClick={toggleTheme} 
            className="p-2.5 rounded-xl border border-amber-500/30 bg-stone-900/80 text-amber-400 backdrop-blur-md hover:bg-stone-800 transition shadow-lg"
          >
            {isDark ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}
          </button>
        </div>

        <div className={`w-full max-w-5xl grid lg:grid-cols-12 rounded-3xl border backdrop-blur-2xl shadow-[0_0_50px_rgba(245,158,11,0.08)] overflow-hidden relative z-10 ${isDark ? "border-amber-500/20 bg-stone-950/60" : "border-amber-200 bg-white/80"}`}>
          <div className="lg:col-span-7 p-8 lg:p-14 flex flex-col justify-between bg-gradient-to-br from-amber-950/40 via-stone-950/80 to-stone-900/60 border-b lg:border-b-0 lg:border-r border-amber-500/10 relative z-10">
            <div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 opacity-60 blur-md" />
                  <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-stone-950 font-black shadow-lg">
                    <Library className="w-6 h-6 text-stone-950"/>
                  </div>
                </div>
                <span className="text-2xl font-black tracking-tight text-white font-sans">
                  {text.brand}
                </span>
              </div>

              <div className="mt-12 lg:mt-16 min-h-[180px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={aiQuoteIndex}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="space-y-4"
                  >
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                      {currentQuote.title1[lang]} <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500">
                        {currentQuote.title2[lang]}
                      </span>
                    </h1>
                    <p className="text-xs sm:text-sm leading-relaxed text-stone-300 max-w-md font-normal">
                      {currentQuote.desc[lang]}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-amber-500/10 flex items-center justify-between text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-500"/>
                <span className="font-semibold text-stone-300">+10,000 Curated Books</span>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-orange-500"/>
                <span className="font-semibold text-stone-300">Pro Developer Community</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-center bg-stone-950/80">
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {mode === "login" && text.login}
                {mode === "register" && text.register}
                {mode === "forgot" && text.forgot}
                {mode === "otp" && text.otp}
                {mode === "reset" && text.reset}
              </h2>
            </div>

            {msg && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }} 
                animate={{ opacity: 1, y: 0 }} 
                className={`mb-6 p-4 rounded-xl text-xs font-medium border ${
                  msg.type === "error" 
                    ? "bg-rose-950/60 border-rose-800/40 text-rose-300" 
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                }`}
              >
                {msg.text}
              </motion.div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              {mode === "register" && (
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-stone-300">{text.name}</label>
                  <input 
                    value={form.name} 
                    onChange={e => setForm({ ...form, name: e.target.value })} 
                    placeholder="Full Name" 
                    required 
                    className={`w-full h-11 rounded-xl border px-4 text-sm focus:outline-none focus:border-amber-500 transition shadow-inner ${isDark ? "bg-stone-900/90 border-stone-800 text-white" : "bg-white border-amber-200 text-stone-900"}`} 
                  />
                </div>
              )}

              {(["login", "register", "forgot"].includes(mode)) && (
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-stone-300">{text.email}</label>
                  <input 
                    value={form.email} 
                    onChange={e => setForm({ ...form, email: e.target.value })} 
                    type="email" 
                    placeholder="name@example.com" 
                    required 
                    className={`w-full h-11 rounded-xl border px-4 text-sm focus:outline-none focus:border-amber-500 transition shadow-inner ${isDark ? "bg-stone-900/90 border-stone-800 text-white" : "bg-white border-amber-200 text-stone-900"}`} 
                  />
                </div>
              )}

              {(["login", "register"].includes(mode)) && (
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-stone-300">{text.password}</label>
                  <input 
                    value={form.password} 
                    onChange={e => setForm({ ...form, password: e.target.value })} 
                    type="password" 
                    placeholder="••••••••" 
                    required 
                    className={`w-full h-11 rounded-xl border px-4 text-sm focus:outline-none focus:border-amber-500 transition shadow-inner ${isDark ? "bg-stone-900/90 border-stone-800 text-white" : "bg-white border-amber-200 text-stone-900"}`} 
                  />
                </div>
              )}

              {mode === "otp" && (
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-stone-300">OTP</label>
                  <input 
                    value={form.otp} 
                    onChange={e => setForm({ ...form, otp: e.target.value })} 
                    placeholder="123456" 
                    className="w-full h-11 rounded-xl bg-stone-900 border border-stone-800 px-4 text-center tracking-[0.5em] text-lg font-mono text-amber-400 focus:outline-none focus:border-amber-500" 
                    required 
                  />
                </div>
              )}

              {mode === "reset" && (
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-stone-300">{text.reset}</label>
                  <input 
                    value={form.newPass} 
                    onChange={e => setForm({ ...form, newPass: e.target.value })} 
                    type="password" 
                    placeholder="••••••••" 
                    required 
                    className="w-full h-11 rounded-xl bg-stone-900 border border-stone-800 px-4 text-sm text-white focus:outline-none focus:border-amber-500" 
                  />
                </div>
              )}

              <button className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2">
                <span>{text.continue}</span>
                <ArrowRight className="w-4 h-4"/>
              </button>
            </form>

            <div className="mt-8 flex items-center justify-between text-xs pt-4 border-t border-stone-800 text-stone-400">
              <button type="button" onClick={() => setMode("login")} className="hover:text-amber-400 transition font-medium">{text.login}</button>
              <button type="button" onClick={() => setMode("register")} className="hover:text-amber-400 transition font-medium">{text.register}</button>
              <button type="button" onClick={() => setMode("forgot")} className="hover:text-amber-400 transition font-medium">{text.forgot}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? "bg-[#0c0a09] text-amber-50" : "bg-amber-50/30 text-stone-900"} font-sans relative transition-colors duration-500 selection:bg-amber-500 selection:text-stone-950`}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: `* { font-family: 'Plus Jakarta Sans', sans-serif !important; }` }} />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-amber-500/10 blur-[160px] pointer-events-none -z-10" />

      <header className="sticky top-0 z-40 w-full transition-all duration-500 relative">
        <div className={`border-b backdrop-blur-2xl px-4 sm:px-8 lg:px-12 h-[64px] sm:h-20 lg:h-24 flex items-center justify-between shadow-2xl transition-all duration-500 ${isDark ? "bg-stone-950/85 border-amber-500/20 shadow-amber-500/5" : "bg-white/90 border-amber-200/80 shadow-stone-200/50"}`}>
          <div className="flex items-center gap-2.5 sm:gap-4 group cursor-pointer shrink-0" onClick={() => setActiveTab("catalog")}>
            <div className="relative">
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 opacity-60 blur-md group-hover:opacity-100 transition duration-500" />
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-stone-950 font-black shadow-lg">
                <Library className="w-6 h-6 sm:w-7 sm:h-7 text-stone-950 group-hover:scale-110 transition duration-300"/>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className={`text-xl sm:text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-stone-900"} font-sans`}>
                  Shelf<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500">Loop</span>
                </span>
              </div>
            </div>
          </div>

          <nav className={`hidden lg:flex items-center gap-3 p-2.5 rounded-2xl border ${isDark ? "bg-stone-900/80 border-stone-800/80" : "bg-amber-50/80 border-amber-200/60"}`}>
            <button 
              onClick={() => setActiveTab("catalog")} 
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${activeTab === "catalog" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-lg shadow-amber-500/25 scale-105" : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/50"}`}
            >
              {text.catalogTab}
            </button>

            <button 
              onClick={() => setActiveTab("mybooks")} 
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 relative flex items-center gap-2 ${activeTab === "mybooks" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-lg shadow-amber-500/25 scale-105" : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/50"}`}
            >
              <span>{text.myBooksTab}</span>
              {borrows.length > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === "mybooks" ? "bg-stone-950 text-amber-400" : "bg-amber-500 text-stone-950"}`}>
                  {borrows.length}
                </span>
              )}
            </button>

            <button 
              onClick={() => setActiveTab("purchases")} 
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 relative flex items-center gap-2 ${activeTab === "purchases" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-lg shadow-amber-500/25 scale-105" : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/50"}`}
            >
              <span>{text.myPurchasesTab}</span>
              {purchases.length > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === "purchases" ? "bg-stone-950 text-amber-400" : "bg-amber-500 text-stone-950"}`}>
                  {purchases.length}
                </span>
              )}
            </button>

            <button 
              onClick={() => setActiveTab("favorites")} 
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 relative flex items-center gap-2 ${activeTab === "favorites" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-lg shadow-amber-500/25 scale-105" : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/50"}`}
            >
              <span>{text.favoritesTab}</span>
              {favorites.length > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === "favorites" ? "bg-stone-950 text-amber-400" : "bg-amber-500 text-stone-950"}`}>
                  {favorites.length}
                </span>
              )}
            </button>

            <button 
              onClick={() => setActiveTab("fines")} 
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 relative flex items-center gap-2 ${activeTab === "fines" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-lg shadow-amber-500/25 scale-105" : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/50"}`}
            >
              <span>{text.finesTab}</span>
              {fines.filter((f: any) => f.status === "PENDING").length > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === "fines" ? "bg-stone-950 text-rose-400" : "bg-rose-900/90 text-rose-200 border border-rose-700/50"}`}>
                  {fines.filter((f: any) => f.status === "PENDING").length}
                </span>
              )}
            </button>

            <button 
              onClick={() => setActiveTab("contact")} 
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${activeTab === "contact" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-lg shadow-amber-500/25 scale-105" : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/50"}`}
            >
              {text.contactTab}
            </button>

            <button 
              onClick={() => setActiveTab("ai")} 
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === "ai" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-lg shadow-amber-500/25 scale-105" : "text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"}`}
            >
              <div className="relative flex items-center justify-center w-5 h-5 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-stone-950 shadow-sm">
                <Sparkles className="w-3 h-3 text-stone-950 animate-pulse"/>
              </div>
              <span>{text.aiTab}</span>
            </button>

            {user?.role === "ADMIN" && (
              <button 
                onClick={() => setActiveTab("admin")} 
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${activeTab === "admin" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-lg shadow-amber-500/25 scale-105" : "text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"}`}
              >
                <ShieldAlert className="w-3.5 h-3.5"/>
                <span>{text.adminTab}</span>
              </button>
            )}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-3">
              <button 
                onClick={toggleLanguage} 
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold border transition-all duration-300 flex items-center gap-1.5 ${isDark ? "bg-stone-900/90 border-amber-500/20 text-amber-400 hover:bg-stone-800" : "bg-white border-amber-300 text-amber-800 shadow-sm"}`}
              >
                <Globe className="w-3.5 h-3.5"/>
                <span>{lang === "en" ? "عربي" : "EN"}</span>
              </button>

              <button 
                onClick={toggleTheme} 
                className={`p-2.5 rounded-xl border transition-all duration-300 ${isDark ? "bg-stone-900/90 border-amber-500/20 text-amber-400 hover:bg-stone-800" : "bg-white border-amber-300 text-amber-800 shadow-sm"}`}
              >
                {isDark ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}
              </button>
            </div>

            <button 
              onClick={hardLogout} 
              className={`p-2.5 rounded-xl border transition-all duration-300 ${isDark ? "bg-stone-900/90 border-stone-800 text-stone-400 hover:text-rose-400 hover:border-rose-800/40" : "bg-white border-amber-200 text-stone-600 hover:text-rose-700"}`}
              title="Logout"
            >
              <LogOut className="w-4 h-4"/>
            </button>

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className={`lg:hidden p-2.5 rounded-xl border transition-all duration-300 ${isDark ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20" : "bg-amber-500/20 border-amber-300 text-amber-800"}`}
            >
              {mobileMenuOpen ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }} 
              className={`lg:hidden absolute top-full left-0 right-0 p-4 rounded-b-3xl border-t-0 border backdrop-blur-2xl shadow-2xl space-y-2.5 ${isDark ? "bg-stone-950/95 border-amber-500/20" : "bg-white/95 border-amber-200"}`}
            >
              <button 
                onClick={() => { setActiveTab("catalog"); setMobileMenuOpen(false); }} 
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-left flex items-center justify-between transition ${activeTab === "catalog" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950" : "text-stone-300 hover:bg-stone-900"}`}
              >
                <span>{text.catalogTab}</span>
                <BookOpen className="w-4 h-4"/>
              </button>

              <button 
                onClick={() => { setActiveTab("mybooks"); setMobileMenuOpen(false); }} 
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-left flex items-center justify-between transition ${activeTab === "mybooks" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950" : "text-stone-300 hover:bg-stone-900"}`}
              >
                <span>{text.myBooksTab}</span>
                <Library className="w-4 h-4"/>
              </button>

              <button 
                onClick={() => { setActiveTab("purchases"); setMobileMenuOpen(false); }} 
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-left flex items-center justify-between transition ${activeTab === "purchases" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950" : "text-stone-300 hover:bg-stone-900"}`}
              >
                <span>{text.myPurchasesTab}</span>
                <ShoppingBag className="w-4 h-4"/>
              </button>

              <button 
                onClick={() => { setActiveTab("favorites"); setMobileMenuOpen(false); }} 
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-left flex items-center justify-between transition ${activeTab === "favorites" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950" : "text-stone-300 hover:bg-stone-900"}`}
              >
                <span>{text.favoritesTab}</span>
                <Heart className="w-4 h-4 text-amber-400"/>
              </button>

              <button 
                onClick={() => { setActiveTab("fines"); setMobileMenuOpen(false); }} 
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-left flex items-center justify-between transition ${activeTab === "fines" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950" : "text-stone-300 hover:bg-stone-900"}`}
              >
                <span>{text.finesTab}</span>
                <CreditCard className="w-4 h-4"/>
              </button>

              <button 
                onClick={() => { setActiveTab("contact"); setMobileMenuOpen(false); }} 
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-left flex items-center justify-between transition ${activeTab === "contact" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950" : "text-stone-300 hover:bg-stone-900"}`}
              >
                <span>{text.contactTab}</span>
                <Mail className="w-4 h-4"/>
              </button>

              <button 
                onClick={() => { setActiveTab("ai"); setMobileMenuOpen(false); }} 
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-left flex items-center justify-between transition ${activeTab === "ai" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950" : "text-amber-400 hover:bg-stone-900"}`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4"/>
                  <span>{text.aiTab}</span>
                </div>
              </button>

              {user?.role === "ADMIN" && (
                <button 
                  onClick={() => { setActiveTab("admin"); setMobileMenuOpen(false); }} 
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-left flex items-center justify-between transition ${activeTab === "admin" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950" : "text-orange-400 hover:bg-stone-900"}`}
                >
                  <span>{text.adminTab}</span>
                  <ShieldAlert className="w-4 h-4"/>
                </button>
              )}

              <div className="pt-3 border-t border-stone-800/80 flex sm:hidden items-center justify-between gap-2">
                <button 
                  onClick={toggleLanguage} 
                  className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold border transition flex items-center justify-center gap-2 ${isDark ? "bg-stone-900 border-amber-500/20 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-900"}`}
                >
                  <Globe className="w-4 h-4"/>
                  <span>{lang === "en" ? "عربي" : "English"}</span>
                </button>

                <button 
                  onClick={toggleTheme} 
                  className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold border transition flex items-center justify-center gap-2 ${isDark ? "bg-stone-900 border-amber-500/20 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-900"}`}
                >
                  {isDark ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}
                  <span>{isDark ? "Light" : "Dark"}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {msg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setMsg(null)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: 30, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-[360px] rounded-[22px] shadow-[0_20px_60px_rgba(0,0,0,0.25)] border overflow-hidden ${isDark ? "bg-[#11100f] border-stone-800" : "bg-white border-stone-200"}`}
            >
              <div className="px-7 pt-8 pb-7 flex flex-col items-center text-center">
                <div className="relative w-[88px] h-[88px] mb-5">
                  <div className={`absolute inset-0 rounded-full ${msg.type === "error" ? "bg-rose-100 dark:bg-rose-950/50" : "bg-orange-100 dark:bg-amber-950/40"}`} />
                  <div className={`absolute inset-0 rounded-full ${msg.type === "error" ? "bg-rose-50" : "bg-amber-50"} scale-[1.18] -z-10`} />
                  <div className={`relative w-[88px] h-[88px] rounded-full flex items-center justify-center shadow-inner ${msg.type === "error" ? "bg-[#ef4444]" : "bg-gradient-to-br from-amber-500 to-orange-500 shadow-[0_8px_24px_rgba(255,138,76,0.4)]"}`}>
                    {msg.type === "error" ? (
                      <X className="w-10 h-10 text-white" strokeWidth={3} />
                    ) : (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: "spring", stiffness: 400 }}>
                        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12.5L10 17.5L19 7.5" />
                        </svg>
                      </motion.div>
                    )}
                  </div>
                </div>
                <h3 className={`text-[17px] font-bold leading-snug tracking-tight ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>
                  {msg.text}
                </h3>
                <p className={`mt-2 text-[13px] leading-relaxed ${isDark ? "text-stone-400" : "text-stone-500"}`}>
                  {msg.type === "error" ? (lang === "ar" ? "حاول مرة أخرى" : "Please try again") : (lang === "ar" ? "تمت العملية بنجاح" : "Operation completed successfully")}
                </p>
                <div className="mt-6 flex items-center gap-2.5 w-full">
                  <button
                    onClick={() => setMsg(null)}
                    className={`flex-1 h-11 rounded-xl text-sm font-bold transition ${msg.type === "error" ? "bg-stone-900 text-white hover:bg-black dark:bg-white dark:text-stone-900 dark:hover:bg-stone-100" : "bg-[#11100f] text-white hover:bg-black dark:bg-white dark:text-stone-900 dark:hover:bg-stone-100"}`}
                  >
                    {lang === "ar" ? "حسنا" : "Okay"}
                  </button>
                </div>
              </div>
              <div className={`h-1.5 w-full ${msg.type === "error" ? "bg-rose-500" : "bg-gradient-to-r from-amber-500 to-orange-500"}`} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={() => setConfirmModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 400 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-[380px] rounded-[24px] shadow-[0_24px_64px_rgba(0,0,0,0.35)] border overflow-hidden ${isDark ? "bg-[#161412] border-stone-800" : "bg-white border-stone-200"}`}
            >
              <div className="px-7 pt-8 pb-6 flex flex-col items-center text-center">
                <div className="relative w-[72px] h-[72px] mb-5">
                  <div className={`absolute inset-0 rounded-full ${confirmModal.type === "danger" ? "bg-rose-100 dark:bg-rose-950/40" : confirmModal.type === "warning" ? "bg-amber-100 dark:bg-amber-950/40" : "bg-blue-100 dark:bg-blue-950/40"}`} />
                  <div className={`relative w-[72px] h-[72px] rounded-full flex items-center justify-center ${confirmModal.type === "danger" ? "bg-gradient-to-br from-rose-500 to-red-600 shadow-[0_8px_24px_rgba(239,68,68,0.35)]" : confirmModal.type === "warning" ? "bg-gradient-to-br from-amber-500 to-orange-500 shadow-[0_8px_24px_rgba(245,158,11,0.35)]" : "bg-gradient-to-br from-blue-500 to-indigo-600"}`}>
                    {confirmModal.type === "danger" ? (
                      <Trash2 className="w-8 h-8 text-white" strokeWidth={2.5} />
                    ) : confirmModal.type === "warning" ? (
                      <AlertTriangle className="w-8 h-8 text-white" strokeWidth={2.5} />
                    ) : (
                      <HelpCircle className="w-8 h-8 text-white" strokeWidth={2.5} />
                    )}
                  </div>
                </div>
                <h3 className={`text-[18px] font-black leading-tight tracking-tight ${isDark ? "text-white" : "text-[#1a1a1a]"}`}>
                  {confirmModal.title}
                </h3>
                <p className={`mt-3 text-[13px] leading-relaxed ${isDark ? "text-stone-400" : "text-stone-600"}`}>
                  {confirmModal.message}
                </p>
                <div className="mt-7 flex items-center gap-3 w-full">
                  <button
                    onClick={() => setConfirmModal(null)}
                    className={`flex-1 h-[46px] rounded-xl text-[14px] font-bold border transition-all duration-200 ${isDark ? "bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-800 hover:text-white" : "bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200"}`}
                  >
                    {lang === "ar" ? "إلغاء" : "Cancel"}
                  </button>
                  <button
                    onClick={confirmModal.onConfirm}
                    className={`flex-1 h-[46px] rounded-xl text-[14px] font-black text-white transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] ${confirmModal.type === "danger" ? "bg-gradient-to-br from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-rose-500/25" : confirmModal.type === "warning" ? "bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/25" : "bg-gradient-to-br from-blue-500 to-indigo-600"}`}
                  >
                    {lang === "ar" ? "تأكيد" : "Confirm"}
                  </button>
                </div>
              </div>
              <div className={`h-1.5 w-full ${confirmModal.type === "danger" ? "bg-gradient-to-r from-rose-500 to-red-600" : confirmModal.type === "warning" ? "bg-gradient-to-r from-amber-500 to-orange-500" : "bg-gradient-to-r from-blue-500 to-indigo-600"}`} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 pb-24 sm:pb-10">
        {activeTab === "catalog" && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
              <div>
                <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-stone-900"}`}>{text.catalogTitle}</h2>
                <p className="text-xs text-stone-400 mt-0.5">{text.catalogDesc}</p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative shrink-0 w-full sm:w-48">
                  <button
                    type="button"
                    onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                    className={`w-full h-10 rounded-xl px-4 text-xs font-bold transition flex items-center justify-between border ${
                      isDark 
                        ? "bg-stone-900/90 border-stone-800 text-amber-400 hover:border-amber-500/40" 
                        : "bg-white border-amber-200 text-stone-900 shadow-sm hover:border-amber-400"
                    }`}
                  >
                    <span className="truncate">
                      {getCategoryLabel(selectedCategory, lang)}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-amber-500 transition-transform duration-300 ${categoryDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {categoryDropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-20" 
                          onClick={() => setCategoryDropdownOpen(false)} 
                        />

                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          className={`absolute left-0 right-0 top-12 z-30 py-1.5 rounded-2xl border shadow-2xl backdrop-blur-2xl max-h-60 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] ${
                            isDark 
                              ? "bg-stone-950/95 border-amber-500/20 shadow-amber-500/10" 
                              : "bg-white/95 border-amber-200 shadow-stone-300/50"
                          }`}
                        >
                          {categories.map((cat) => {
                            const isSelected = selectedCategory === cat;
                            return (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => {
                                  setSelectedCategory(cat);
                                  setCategoryDropdownOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-all duration-200 transform hover:translate-x-1.5 flex items-center justify-between ${
                                  isSelected
                                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-bold translate-x-1.5 shadow-md"
                                    : isDark
                                    ? "text-stone-300 hover:bg-amber-500/20 hover:text-amber-400"
                                    : "text-stone-700 hover:bg-amber-500/10 hover:text-amber-600"
                                }`}
                              >
                                <span>{getCategoryLabel(cat, lang)}</span>
                                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-stone-950"/>}
                              </button>
                            );
                          })}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2"/>
                  <input 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    placeholder={text.searchPlaceholder} 
                    className={`w-full h-10 rounded-xl pl-10 pr-4 text-xs focus:outline-none focus:border-amber-500 transition border ${
                      isDark ? "bg-stone-900/90 border-stone-800 text-white" : "bg-white border-amber-200 text-stone-900 shadow-sm"
                    }`} 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
              {paginatedBooks.map((book: any) => {
                const av = getAvail(book);
                const tot = getTotal(book);
                const isOutOfStock = av === 0;
                const favActive = isFavorite(getBookId(book));
                const purchased = isPurchased(getBookId(book));
                const pendingPurchase = isPurchasePending(getBookId(book));

                return (
                  <motion.div key={getBookId(book)} whileHover={{ y: -6 }} transition={{ duration: 0.3 }} className={`group relative rounded-2xl border overflow-hidden flex flex-col justify-between hover:border-amber-500/60 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] transition-all duration-300 ${isDark ? "bg-stone-900/40 border-stone-800/80 backdrop-blur-sm" : "bg-white border-amber-200 shadow-sm"}`}>
                    <div className="aspect-[4/5] relative overflow-hidden bg-stone-950">
                      <img key={`${getBookId(book)}-${book.coverUrl}`}
                      src={getCover(book)} className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent" />
                      
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
                        <button 
                          onClick={() => toggleFavorite(getBookId(book))}
                          className={`p-2.5 rounded-xl backdrop-blur-md border transition shadow-lg ${favActive ? "bg-amber-500 text-stone-950 border-amber-400" : "bg-stone-950/80 text-stone-300 border-stone-800 hover:text-amber-400"}`}
                          title="Favorite"
                        >
                          <Heart className={`w-4 h-4 ${favActive ? "fill-stone-950 text-stone-950" : ""}`} />
                        </button>

                        {user?.role === "ADMIN" && (
                          <>
                            <button onClick={() => { setEditingBook({ ...book }); setEditCoverFile(null); }} className="p-2.5 rounded-xl bg-stone-950/80 hover:bg-amber-500 text-amber-400 hover:text-stone-950 border border-stone-800 backdrop-blur-md transition shadow-md" title="Edit Book">
                              <Edit3 className="w-4 h-4"/>
                            </button>
                            <button onClick={() => deleteBook(getBookId(book))} className="p-2.5 rounded-xl bg-stone-950/80 hover:bg-rose-900 text-rose-300 hover:text-white border border-rose-800/50 backdrop-blur-md transition shadow-md" title="Delete Book">
                              <Trash2 className="w-4 h-4"/>
                            </button>
                          </>
                        )}
                      </div>

                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-stone-950/80 backdrop-blur-md border border-amber-500/20 text-[11px] font-mono text-amber-400">
                        {av}/{tot} {text.availableCopies}
                      </div>

                      {purchased && (
                        <div className="absolute bottom-3 left-3 right-3 text-center py-1.5 rounded-xl bg-amber-500 text-stone-950 text-[11px] font-bold shadow-md">
                          ✓ {text.ownedPermanently}
                        </div>
                      )}

                      {pendingPurchase && !purchased && (
                        <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-1.5 z-20">
                          <div className="text-center py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[11px] font-bold backdrop-blur-md shadow-md">
                            ⏳ {text.pendingApproval}
                          </div>
                          <button
                            onClick={() => cancelPurchaseAction(getBookId(book))}
                            className="w-full py-1 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-200 text-[11px] font-bold border border-rose-800/60 backdrop-blur-md transition shadow-md flex items-center justify-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            <span>{text.cancelRequestBtn}</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">{getCategoryLabel(book.category || "Programming", lang)}</span>
                        <h3 className={`font-bold text-sm sm:text-base mt-1 line-clamp-1 group-hover:text-amber-400 transition ${isDark ? "text-white" : "text-stone-900"}`}>{book.title}</h3>
                        <p className="text-[11px] sm:text-xs text-stone-400 mt-0.5">{book.author}</p>
                      </div>

                      <div className="mt-4 sm:mt-6 flex flex-col gap-3 border-t border-stone-800/60 pt-3 sm:pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= Math.min(av, 5) ? "bg-amber-400" : "bg-stone-800"}`} />
                            ))}
                          </div>
                        </div>

                        {/* تحسين أزرار الشراء والاستعارة لتكون احترافية ومتجاوبة */}
                        <div className="grid grid-cols-2 gap-2">
                          <motion.button 
                            whileTap={{ scale: 0.96 }}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => setHint(book)} 
                            disabled={isOutOfStock} 
                            className="w-full py-2.5 px-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-stone-950 text-xs font-black transition shadow-md flex items-center justify-center gap-1.5"
                          >
                            <BookOpen className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
                            <span className="truncate">{text.borrowBtn}</span>
                          </motion.button>

                          <motion.button 
                            whileTap={{ scale: 0.96 }}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => { setBuyHint(book); setBuyQuantity(1); setBuyError(""); setBuyPaymentMethod("CARD"); }} 
                            className={`w-full py-2.5 px-2 rounded-xl border text-xs font-black transition shadow-sm flex items-center justify-center gap-1.5 truncate ${
                              purchased 
                                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" 
                                : isDark 
                                ? "border-amber-500/30 bg-stone-900 text-amber-400 hover:bg-amber-500/10 hover:border-amber-400" 
                                : "border-amber-300 bg-white text-amber-800 hover:bg-amber-50"
                            }`}
                          >
                            <ShoppingBag className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
                            <span className="truncate">{purchased ? (lang === "ar" ? "شراء مجدد" : "Buy Again") : text.buyBtn}</span>
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 sm:mt-12 flex flex-col items-center gap-3 sm:gap-5 pb-6 sm:pb-0">
                <div className="w-full flex justify-center">
                  <div className="flex items-center gap-1.5 sm:gap-2.5 bg-white dark:bg-stone-900 rounded-2xl p-2 sm:p-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-stone-200 dark:border-stone-800 max-w-full overflow-x-auto scrollbar-hide">
                    <button
                      onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      disabled={currentPage === 1}
                      className={`shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-xl border flex items-center justify-center text-base sm:text-lg font-bold transition-all ${currentPage === 1 ? "opacity-30 cursor-not-allowed border-stone-200 bg-stone-50 text-stone-400 dark:border-stone-800 dark:bg-stone-900/50" : "border-stone-200 bg-white text-stone-700 hover:border-amber-400 hover:text-amber-600 shadow-sm dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:hover:border-amber-500/50"}`}
                    >
                      ‹
                    </button>
                    {(() => {
                      const pages: (number | string)[] = [];
                      if (totalPages <= 5) {
                        for (let i = 1; i <= totalPages; i++) pages.push(i);
                      } else {
                        if (currentPage <= 3) {
                          pages.push(1, 2, 3, "...", totalPages);
                        } else if (currentPage >= totalPages - 2) {
                          pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
                        } else {
                          pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
                        }
                      }
                      return pages.map((pageNum, idx) => {
                        if (pageNum === "...") {
                          return <span key={`ellipsis-${idx}`} className="w-7 sm:w-9 h-9 sm:h-11 flex items-center justify-center text-stone-400 text-sm">…</span>;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => { setCurrentPage(pageNum as number); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                            className={`shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-xl text-[13px] sm:text-[15px] font-bold border transition-all duration-200 ${currentPage === pageNum ? "bg-[#FF8A4C] border-[#FF8A4C] text-white shadow-[0_4px_14px_rgba(255,138,76,0.35)] scale-105" : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:text-stone-900 shadow-sm dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400 dark:hover:border-stone-600 dark:hover:text-white"}`}
                          >
                            {pageNum}
                          </button>
                        );
                      });
                    })()}
                    <button
                      onClick={() => { setCurrentPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      disabled={currentPage === totalPages}
                      className={`shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-xl border flex items-center justify-center text-base sm:text-lg font-bold transition-all ${currentPage === totalPages ? "opacity-30 cursor-not-allowed border-stone-200 bg-stone-50 text-stone-400 dark:border-stone-800 dark:bg-stone-900/50" : "border-stone-200 bg-white text-stone-700 hover:border-amber-400 hover:text-amber-600 shadow-sm dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:hover:border-amber-500/50"}`}
                    >
                      ›
                    </button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-[11px] sm:text-xs">
                  <span className={`px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full border text-[11px] sm:text-xs font-medium ${isDark ? "bg-stone-900 border-stone-800 text-stone-400" : "bg-white border-stone-200 text-stone-600 shadow-sm"}`}>
                    {text.page} {currentPage} {text.of} {totalPages}
                  </span>
                  <span className="hidden sm:block text-stone-400">•</span>
                  <span className="text-stone-500 font-medium text-[11px] sm:text-xs">{filtered.length} {lang === "ar" ? "كتاب" : "books"} • {BOOKS_PER_PAGE} {lang === "ar" ? "في الصفحة" : "/page"}</span>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "favorites" && (
          <section className="py-4">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-amber-500/10">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                  <Heart className="w-6 h-6 fill-amber-500"/>
                </div>
                <div>
                  <h2 className={`text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-stone-900"}`}>{text.favoritesTitle}</h2>
                  <p className="text-xs text-stone-400 mt-1">{text.favoritesDesc}</p>
                </div>
              </div>
              <span className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 font-mono font-bold">
                {favorites.length} Books
              </span>
            </div>

            {favorites.length === 0 ? (
              <div className={`p-12 text-center rounded-3xl border ${isDark ? "bg-stone-950/40 border-stone-800" : "bg-white border-amber-200"}`}>
                <Heart className="w-12 h-12 text-amber-500/40 mx-auto mb-4"/>
                <p className="text-sm text-stone-400 mb-4">{text.noFavorites}</p>
                <button onClick={() => setActiveTab("catalog")} className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition shadow-lg shadow-amber-500/20">
                  {text.exploreBtn}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                {favorites.map((book: any) => {
                  const av = getAvail(book);
                  const tot = getTotal(book);

                  return (
                    <motion.div key={getBookId(book)} whileHover={{ y: -6 }} transition={{ duration: 0.3 }} className={`group relative rounded-2xl border overflow-hidden flex flex-col justify-between hover:border-amber-500/60 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] transition-all duration-300 ${isDark ? "bg-stone-900/40 border-stone-800/80 backdrop-blur-sm" : "bg-white border-amber-200 shadow-sm"}`}>
                      <div className="aspect-[4/5] relative overflow-hidden bg-stone-950">
                        <img key={`${getBookId(book)}-${book.coverUrl}`}
                      src={getCover(book)} className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent" />
                        
                        <button 
                          onClick={() => toggleFavorite(getBookId(book))}
                          className="absolute top-3 right-3 p-2.5 rounded-xl backdrop-blur-md border transition shadow-lg z-20 bg-amber-500 text-stone-950 border-amber-400"
                          title="Remove from favorites"
                        >
                          <Heart className="w-4 h-4 fill-stone-950 text-stone-950"/>
                        </button>

                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-stone-950/80 backdrop-blur-md border border-amber-500/20 text-[11px] font-mono text-amber-400">
                          {av}/{tot} {text.availableCopies}
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">{getCategoryLabel(book.category || "Programming", lang)}</span>
                          <h3 className={`font-bold text-base mt-1 line-clamp-1 group-hover:text-amber-400 transition ${isDark ? "text-white" : "text-stone-900"}`}>{book.title}</h3>
                          <p className="text-xs text-stone-400 mt-1">{book.author}</p>
                        </div>

                        <div className="mt-6 flex items-center justify-between border-t border-stone-800/60 pt-4">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= Math.min(av, 5) ? "bg-amber-400" : "bg-stone-800"}`} />
                            ))}
                          </div>

                          <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }} onClick={() => setHint(book)} disabled={av === 0} className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:bg-stone-800 text-stone-950 text-xs font-bold transition shadow-lg shadow-amber-500/20 flex items-center gap-1">
                            <BookmarkCheck className="w-3.5 h-3.5"/>
                            <span>{text.borrowBtn}</span>
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {activeTab === "mybooks" && (
          <section className="py-4">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-amber-500/10">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                  <Library className="w-6 h-6"/>
                </div>
                <div>
                  <h2 className={`text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-stone-900"}`}>{text.borrowedTitle}</h2>
                  <p className="text-xs text-stone-400 mt-1">{text.borrowedDesc}</p>
                </div>
              </div>
              <span className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500 font-mono font-bold">
                {borrows.length} {text.borrowedBooks}
              </span>
            </div>

            {borrows.length === 0 ? (
              <div className={`p-12 text-center rounded-3xl border ${isDark ? "bg-stone-950/40 border-stone-800" : "bg-white border-amber-200"}`}>
                <BookOpen className="w-12 h-12 text-amber-500/40 mx-auto mb-4"/>
                <p className="text-sm text-stone-400 mb-4">{text.noBorrows}</p>
                <button onClick={() => setActiveTab("catalog")} className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition shadow-lg shadow-amber-500/20">
                  {text.exploreBtn}
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {borrows.map((b: any) => {
                  const now = new Date("2026-10-25T00:00:00Z");
                  const due = b.dueDate ? new Date(b.dueDate) : new Date(now.getTime() + 14 * 86400000);
                  const isLate = now > due;
                  const diffDays = isLate ? Math.ceil((now.getTime() - due.getTime()) / 86400000) : 0;
                  const currentFine = diffDays * 5;

                  return (
                    <motion.div key={b.id || b.bookId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-6 rounded-3xl border backdrop-blur-xl flex flex-col justify-between shadow-xl ${isDark ? "bg-stone-900/60 border-amber-500/20" : "bg-white border-amber-200"}`}>
                      <div className="flex gap-5">
                        <img key={`${getBookId(b.book)}-${b.book?.coverUrl}`}
                      src={getCover(b.book)} className="w-20 h-28 rounded-2xl object-cover shadow-lg" />
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">{getCategoryLabel(b.book?.category || "PROGRAMMING", lang)}</span>
                            <h4 className={`font-bold text-base mt-1 line-clamp-1 ${isDark ? "text-white" : "text-stone-900"}`}>{b.book?.title || b.bookId}</h4>
                            <p className="text-xs text-stone-400 mt-1">{b.book?.author || "Robert Martin"}</p>
                          </div>
                          <div className="mt-4 flex flex-col gap-1.5">
                            <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl w-fit">
                              <Clock className="w-3.5 h-3.5"/>
                              <span>{text.dueDate} {due.toISOString().split("T")[0].split("-").reverse().join("/")}</span>
                            </div>
                            {isLate && (
                              <div className="text-[11px] font-bold text-rose-400 bg-rose-950/80 border border-rose-800/60 px-3 py-1 rounded-xl w-fit">
                                Overdue by {diffDays} days! Fine: {currentFine} EGP
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <button onClick={() => doReturn(b)} className={`mt-6 w-full py-3 rounded-xl text-xs font-bold border transition ${isDark ? "bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-white border-stone-700" : "bg-amber-100 hover:bg-amber-500 hover:text-white text-amber-900 border-amber-200"}`}>
                        {text.returnBtn}
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {activeTab === "purchases" && (
          <section className="py-4">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-amber-500/10">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                  <ShoppingBag className="w-6 h-6"/>
                </div>
                <div>
                  <h2 className={`text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-stone-900"}`}>{text.purchasesTitle}</h2>
                  <p className="text-xs text-stone-400 mt-1">{text.purchasesDesc}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 font-mono font-bold block">
                  {text.grandTotal}: {grandTotalPurchases} EGP
                </span>
              </div>
            </div>

            {purchases.length === 0 ? (
              <div className={`p-12 text-center rounded-3xl border ${isDark ? "bg-stone-950/40 border-stone-800" : "bg-white border-amber-200"}`}>
                <ShoppingBag className="w-12 h-12 text-amber-500/40 mx-auto mb-4"/>
                <p className="text-sm text-stone-400 mb-4">{text.noPurchases}</p>
                <button onClick={() => setActiveTab("catalog")} className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition shadow-lg shadow-amber-500/20">
                  {text.exploreBtn}
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {purchasesByCategory.map((group) => (
                  <div key={group.category} className={`p-6 rounded-3xl border ${isDark ? "bg-stone-900/40 border-stone-800" : "bg-white border-amber-200 shadow-sm"}`}>
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-amber-500/10">
                      <h3 className="text-lg font-black text-amber-400 uppercase tracking-wider">{getCategoryLabel(group.category, lang)}</h3>
                      <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
                        {text.categorySubtotal}: {group.subtotal} EGP
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {group.items.map((p: any) => (
                        <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-5 rounded-2xl border backdrop-blur-xl flex flex-col justify-between shadow-lg ${isDark ? "bg-stone-900/80 border-amber-500/20" : "bg-amber-50/50 border-amber-200"}`}>
                          <div className="flex gap-4">
                            <img src={getCover(p.book)} className="w-16 h-24 rounded-xl object-cover shadow-md" />
                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                <h4 className={`font-bold text-sm line-clamp-1 ${isDark ? "text-white" : "text-stone-900"}`}>{p.book?.title}</h4>
                                <p className="text-[11px] text-stone-400 mt-0.5">{p.book?.author}</p>
                                <p className="text-[11px] font-mono text-amber-400 mt-1">Copies: {p.quantity || 1} | Price: {p.price} EGP</p>
                              </div>
                              <div className={`mt-2 text-[10px] border px-2.5 py-1 rounded-lg w-fit font-bold ${p.status === 'PAID' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-orange-400 bg-orange-500/10 border-orange-500/20'}`}>
                                {p.status === 'PAID' ? `✓ ${text.ownedPermanently}` : `⏳ ${text.pendingApproval}`}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "fines" && (
          <section className="py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-amber-500/10">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500">
                  <CreditCard className="w-6 h-6"/>
                </div>
                <div>
                  <h2 className={`text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-stone-900"}`}>{text.finesTitle}</h2>
                  <p className="text-xs text-stone-400 mt-1">{text.finesDesc}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative shrink-0 w-full sm:w-48">
                  <button
                    type="button"
                    onClick={() => setFineDropdownOpen(!fineDropdownOpen)}
                    className={`w-full h-10 rounded-xl px-4 text-xs font-bold transition flex items-center justify-between border ${
                      isDark 
                        ? "bg-stone-900/90 border-stone-800 text-amber-400 hover:border-amber-500/40" 
                        : "bg-white border-amber-200 text-stone-900 shadow-sm hover:border-amber-400"
                    }`}
                  >
                    <span className="truncate">
                      {fineFilter === "ALL" ? "All Fines" : fineFilter === "PENDING" ? `Pending (${fines.filter((f: any) => f.status === "PENDING").length})` : "Paid"}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-amber-500 transition-transform duration-300 ${fineDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {fineDropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-20" 
                          onClick={() => setFineDropdownOpen(false)} 
                        />

                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          className={`absolute left-0 right-0 top-12 z-30 py-1.5 rounded-2xl border shadow-2xl backdrop-blur-2xl overflow-hidden ${
                            isDark 
                              ? "bg-stone-950/95 border-amber-500/20 shadow-amber-500/10" 
                              : "bg-white/95 border-amber-200 shadow-stone-300/50"
                          }`}
                        >
                          {[
                            { id: "ALL", label: "All Fines" },
                            { id: "PENDING", label: `Pending (${fines.filter((f: any) => f.status === "PENDING").length})` },
                            { id: "PAID", label: "Paid" }
                          ].map((item) => {
                            const isSelected = fineFilter === item.id;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                  setFineFilter(item.id as any);
                                  setFineDropdownOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-all duration-200 transform hover:translate-x-1.5 flex items-center justify-between ${
                                  isSelected
                                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-bold translate-x-1.5 shadow-md"
                                    : isDark
                                    ? "text-stone-300 hover:bg-amber-500/20 hover:text-amber-400"
                                    : "text-stone-700 hover:bg-amber-500/10 hover:text-amber-600"
                                }`}
                              >
                                <span>{item.label}</span>
                                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-stone-950"/>}
                              </button>
                            );
                          })}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {filteredFines.length === 0 ? (
              <div className={`p-12 text-center rounded-3xl border ${isDark ? "bg-stone-950/40 border-stone-800" : "bg-white border-amber-200"}`}>
                <CheckCircle2 className="w-12 h-12 text-emerald-500/60 mx-auto mb-4"/>
                <p className="text-sm text-stone-400 mb-4">{text.noFines}</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredFines.map((fine: any) => {
                    const isPaid = fine.status === "PAID";
                    return (
                      <motion.div
                        key={fine.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className={`p-6 rounded-3xl border backdrop-blur-xl flex flex-col justify-between shadow-xl relative group ${isDark ? "bg-stone-900/60 border-amber-500/20" : "bg-white border-amber-200"}`}
                      >
                        {isPaid && (
                          <button
                            onClick={() => dismissFineCard(fine.id)}
                            className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-800/80 hover:bg-rose-900 text-stone-400 hover:text-white transition opacity-60 group-hover:opacity-100 z-10"
                            title="Hide from view"
                          >
                            <X className="w-3.5 h-3.5"/>
                          </button>
                        )}

                        <div>
                          <div className={`flex items-center justify-between mb-3 ${isPaid ? "pr-8" : ""}`}>
                            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                              {getCategoryLabel(fine.borrowing?.book?.category || "PROGRAMMING", lang)}
                            </span>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isPaid ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-rose-950/80 text-rose-300 border border-rose-800/50"}`}>
                              {fine.status}
                            </span>
                          </div>
                          <h4 className={`font-bold text-base mb-1 line-clamp-1 ${isDark ? "text-white" : "text-stone-900"}`}>
                            {fine.borrowing?.book?.title || "Library Book"}
                          </h4>
                          <div className={`mt-4 p-4 rounded-2xl border space-y-2 text-xs ${isDark ? "bg-stone-950 border-stone-800 text-stone-300" : "bg-amber-50 border-amber-200 text-stone-700"}`}>
                            <div className="flex items-center justify-between">
                              <span>{text.daysLateLabel}</span>
                              <span className="font-bold text-orange-400">{fine.daysLate} Days</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>{text.amountLabel}</span>
                              <span className="font-bold text-amber-400">{fine.amount} EGP</span>
                            </div>
                          </div>
                        </div>

                        {!isPaid && (
                          <button onClick={() => { setSelectedFine(fine); setPaymentMethod("CARD"); }} className="mt-6 w-full py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 transition shadow-lg shadow-amber-500/20">
                            {text.payNow}
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </section>
        )}

        {activeTab === "ai" && (
          <div className="max-w-3xl mx-auto py-6">
            <div className={`p-8 rounded-3xl border shadow-2xl flex flex-col h-[600px] ${isDark ? "bg-stone-900/90 border-amber-500/20" : "bg-white border-amber-200"}`}>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-amber-500/20">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5"/>
                </div>
                <div>
                  <h3 className={`text-lg font-black ${isDark ? "text-white" : "text-stone-900"}`}>{text.aiTitle}</h3>
                  <p className="text-xs text-stone-400">{text.aiDesc}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
                {aiMessages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl ${m.role === "user" ? "bg-amber-500 text-stone-950 font-medium shadow-md" : "bg-stone-950 text-amber-100 border border-amber-500/20 shadow-lg"}`}>
                      {m.role === "user" ? (
                        <div 
                          dir="auto"
                          className="text-sm leading-6 whitespace-pre-wrap break-words"
                          style={{ unicodeBidi: 'plaintext', textAlign: 'start' as any }}
                        >
                          {m.text}
                        </div>
                      ) : (
                        <AiMessage text={m.text}/>
                      )}
                    </div>
                  </div>
                ))}
                {aiLoading && <div className="text-stone-500 text-xs italic">AI is generating accurate response...</div>}
              </div>

              <form onSubmit={sendAiMessage} className="flex gap-3 pt-4 border-t border-amber-500/20">
                <input
                  dir="auto"
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  placeholder={text.aiPlaceholder}
                  style={{ unicodeBidi: 'plaintext' } as any}
                  className={`flex-1 h-12 rounded-xl px-4 text-xs sm:text-sm focus:outline-none focus:border-amber-500 ${isDark ? "bg-stone-950 border-stone-800 text-white" : "bg-amber-50 border-amber-200 text-stone-900"}`}
                />
                <button className="px-6 h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-xs sm:text-sm transition shadow-lg shadow-amber-500/20 flex items-center gap-2">
                  <Send className="w-4 h-4"/>
                  <span>{text.aiSend}</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "contact" && (
          <div className="max-w-2xl mx-auto py-8">
            <div className={`p-8 lg:p-10 rounded-3xl border backdrop-blur-2xl shadow-2xl ${isDark ? "bg-stone-900/60 border-amber-500/20" : "bg-white border-amber-200"}`}>
              <div className="text-center mb-8">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6"/>
                </div>
                <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-stone-900"}`}>{text.contactTitle}</h2>
                <p className="text-xs text-stone-400 mt-1">{text.contactDesc}</p>
                <div className="mt-3 inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-mono font-bold">
                  dev.ghazaleco@gmail.com
                </div>
              </div>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-stone-300" : "text-stone-700"}`}>{text.name}</label>
                  <input value={contactForm.name} onChange={e => setContactForm({ ...contactForm, name: e.target.value })} required placeholder="Name" className={`w-full h-11 rounded-xl px-4 text-xs focus:outline-none focus:border-amber-500 ${isDark ? "bg-stone-950 border-stone-800 text-white" : "bg-amber-50/50 border-amber-200 text-stone-900"}`} />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-stone-300" : "text-stone-700"}`}>{text.email}</label>
                  <input value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} required type="email" placeholder="name@example.com" className={`w-full h-11 rounded-xl px-4 text-xs focus:outline-none focus:border-amber-500 ${isDark ? "bg-stone-950 border-stone-800 text-white" : "bg-amber-50/50 border-amber-200 text-stone-900"}`} />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-stone-300" : "text-stone-700"}`}>{text.messageLabel}</label>
                  <textarea value={contactForm.message} onChange={e => setContactForm({ ...contactForm, message: e.target.value })} required rows={4} placeholder="Type your message here..." className={`w-full rounded-xl p-4 text-xs focus:outline-none focus:border-amber-500 resize-none ${isDark ? "bg-stone-950 border-stone-800 text-white" : "bg-amber-50/50 border-amber-200 text-stone-900"}`} />
                </div>

                <button disabled={contactSent} className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-stone-950 font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20">
                  <Send className="w-4 h-4"/>
                  <span>{contactSent ? text.sendingBtn : text.sendBtn}</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "admin" && user?.role === "ADMIN" && (
          <div className="space-y-8">
            <div className={`p-8 rounded-3xl border shadow-2xl relative ${isDark ? "bg-stone-900/90 border-amber-500/20" : "bg-white border-amber-200"}`}>
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-amber-500/20">
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-6 h-6 text-amber-500"/>
                  <div>
                    <h3 className={`text-xl font-black ${isDark ? "text-white" : "text-stone-900"}`}>{text.adminTab}</h3>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div 
                  onClick={() => setShowBooksModal(true)}
                  className={`p-5 rounded-2xl border cursor-pointer hover:border-amber-500 transition shadow-lg ${isDark ? "bg-stone-950/60 border-stone-800 hover:bg-stone-900/80" : "bg-amber-50/50 border-amber-200 hover:bg-amber-100/50"}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-stone-400 flex items-center gap-1">
                      {text.totalBooks}
                      <span className="text-[10px] text-amber-500 font-bold">(Click)</span>
                    </span>
                    <BookOpen className="w-4 h-4 text-amber-500"/>
                  </div>
                  <div className={`text-2xl font-black ${isDark ? "text-white" : "text-stone-900"}`}>{books.length}</div>
                </div>

                <div 
                  onClick={() => setShowBorrowsModal(true)}
                  className={`p-5 rounded-2xl border cursor-pointer hover:border-amber-500 transition shadow-lg ${isDark ? "bg-stone-950/60 border-stone-800 hover:bg-stone-900/80" : "bg-amber-50/50 border-amber-200 hover:bg-amber-100/50"}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-stone-400 flex items-center gap-1">
                      {text.borrowedBooks}
                      <span className="text-[10px] text-amber-500 font-bold">(Click)</span>
                    </span>
                    <Library className="w-4 h-4 text-amber-500"/>
                  </div>
                  <div className="text-2xl font-black text-amber-500">{allBorrowsList.length}</div>
                </div>

                <div 
                  onClick={() => setShowUsersModal(true)}
                  className={`p-5 rounded-2xl border cursor-pointer hover:border-orange-500 transition shadow-lg ${isDark ? "bg-stone-950/60 border-stone-800 hover:bg-stone-900/80" : "bg-amber-50/50 border-amber-200 hover:bg-amber-100/50"}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-stone-400 flex items-center gap-1">
                      {text.totalUsers}
                      <span className="text-[10px] text-orange-500 font-bold">(Click)</span>
                    </span>
                    <Users className="w-4 h-4 text-orange-500"/>
                  </div>
                  <div className="text-2xl font-black text-orange-500">{usersList.length}</div>
                </div>

                <div className={`p-5 rounded-2xl border ${isDark ? "bg-stone-950/60 border-stone-800" : "bg-amber-50/50 border-amber-200"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-stone-400">{text.engagement}</span>
                    <TrendingUp className="w-4 h-4 text-emerald-500"/>
                  </div>
                  <div className="text-2xl font-black text-emerald-500">
                    {books.length > 0 ? Math.round((allBorrowsList.length / books.length) * 100) : 0}%
                  </div>
                </div>
              </div>

              <div className={`mb-8 p-6 rounded-2xl border ${isDark ? "bg-stone-950/40 border-stone-800" : "bg-amber-50/30 border-amber-200"}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <h4 className={`text-sm font-bold flex items-center gap-2 ${isDark ? "text-stone-200" : "text-stone-800"}`}>
                    <CreditCard className="w-4 h-4 text-amber-500"/> {text.cashApprovalsTitle}
                  </h4>

                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <div className="relative w-40">
                      <button
                        type="button"
                        onClick={() => setAdminMethodDropdownOpen(!adminMethodDropdownOpen)}
                        className={`w-full h-10 rounded-xl px-4 text-xs font-bold transition flex items-center justify-between border ${
                          isDark 
                            ? "bg-stone-900/90 border-stone-800 text-amber-400 hover:border-amber-500/40" 
                            : "bg-white border-amber-200 text-stone-900 shadow-sm hover:border-amber-400"
                        }`}
                      >
                        <span className="truncate">Method: {adminMethodFilter}</span>
                        <ChevronDown className={`w-4 h-4 text-amber-500 transition-transform duration-300 ${adminMethodDropdownOpen ? "rotate-180" : ""}`} />
                      </button>

                      <AnimatePresence>
                        {adminMethodDropdownOpen && (
                          <>
                            <div className="fixed inset-0 z-20" onClick={() => setAdminMethodDropdownOpen(false)} />
                            <motion.div
                              initial={{ opacity: 0, y: -8, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -8, scale: 0.98 }}
                              transition={{ duration: 0.15 }}
                              className={`absolute left-0 right-0 top-12 z-30 py-1.5 rounded-2xl border shadow-2xl backdrop-blur-2xl overflow-hidden ${
                                isDark ? "bg-stone-950/95 border-amber-500/20 shadow-amber-500/10" : "bg-white/95 border-amber-200 shadow-stone-300/50"
                              }`}
                            >
                              {(["ALL", "CASH", "CARD", "WALLET"] as const).map(m => (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => {
                                    setAdminMethodFilter(m);
                                    setAdminMethodDropdownOpen(false);
                                  }}
                                  className={`w-full text-left px-4 py-2 text-xs font-semibold transition flex items-center justify-between ${
                                    adminMethodFilter === m
                                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-bold shadow-md"
                                      : isDark ? "text-stone-300 hover:bg-amber-500/20 hover:text-amber-400" : "text-stone-700 hover:bg-amber-500/10 hover:text-amber-600"
                                  }`}
                                >
                                  <span>{m}</span>
                                  {adminMethodFilter === m && <CheckCircle2 className="w-3.5 h-3.5 text-stone-950"/>}
                                </button>
                              ))}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="relative w-40">
                      <button
                        type="button"
                        onClick={() => setAdminStatusDropdownOpen(!adminStatusDropdownOpen)}
                        className={`w-full h-10 rounded-xl px-4 text-xs font-bold transition flex items-center justify-between border ${
                          isDark 
                            ? "bg-stone-900/90 border-stone-800 text-amber-400 hover:border-amber-500/40" 
                            : "bg-white border-amber-200 text-stone-900 shadow-sm hover:border-amber-400"
                        }`}
                      >
                        <span className="truncate">Status: {adminStatusFilter}</span>
                        <ChevronDown className={`w-4 h-4 text-amber-500 transition-transform duration-300 ${adminStatusDropdownOpen ? "rotate-180" : ""}`} />
                      </button>

                      <AnimatePresence>
                        {adminStatusDropdownOpen && (
                          <>
                            <div className="fixed inset-0 z-20" onClick={() => setAdminStatusDropdownOpen(false)} />
                            <motion.div
                              initial={{ opacity: 0, y: -8, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -8, scale: 0.98 }}
                              transition={{ duration: 0.15 }}
                              className={`absolute left-0 right-0 top-12 z-30 py-1.5 rounded-2xl border shadow-2xl backdrop-blur-2xl overflow-hidden ${
                                isDark ? "bg-stone-950/95 border-amber-500/20 shadow-amber-500/10" : "bg-white/95 border-amber-200 shadow-stone-300/50"
                              }`}
                            >
                              {(["ALL", "PENDING", "PAID"] as const).map(s => (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => {
                                    setAdminStatusFilter(s);
                                    setAdminStatusDropdownOpen(false);
                                  }}
                                  className={`w-full text-left px-4 py-2 text-xs font-semibold transition flex items-center justify-between ${
                                    adminStatusFilter === s
                                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-bold shadow-md"
                                      : isDark ? "text-stone-300 hover:bg-amber-500/20 hover:text-amber-400" : "text-stone-700 hover:bg-amber-500/10 hover:text-amber-600"
                                  }`}
                                >
                                  <span>{s}</span>
                                  {adminStatusFilter === s && <CheckCircle2 className="w-3.5 h-3.5 text-stone-950"/>}
                                </button>
                              ))}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-3 max-h-[60vh] sm:max-h-64 overflow-y-auto pr-1 sm:pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-stone-900/50 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/80 scrollbar-thin">
                  <AnimatePresence>
                    {filteredAdminFines.length === 0 ? (
                      <p className="text-xs text-stone-400 text-center py-4">No matching transactions found.</p>
                    ) : (
                      filteredAdminFines.map((f: any) => (
                        <motion.div 
                          key={f.id} 
                          layout
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative group ${isDark ? "bg-stone-900 border-stone-800" : "bg-white border-amber-200"}`}
                        >
                          {f.status === 'PAID' && (
                            <button
                              onClick={() => dismissAdminFineCard(f.id)}
                              className="absolute top-3 right-3 p-1 rounded-full bg-stone-800/80 hover:bg-rose-900 text-stone-400 hover:text-white transition opacity-60 group-hover:opacity-100"
                              title="Hide transaction"
                            >
                              <X className="w-3.5 h-3.5"/>
                            </button>
                          )}

                          <div className={`flex-1 min-w-0 ${f.status === 'PAID' ? 'pr-8' : ''}`}>
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black tracking-wider border ${f.txType === 'PURCHASE' ? 'bg-amber-500/15 text-amber-400 border-amber-500/25' : 'bg-blue-500/15 text-blue-400 border-blue-500/25'}`}>
                                  {f.txType}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold border ${f.status === 'PAID' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' : 'bg-amber-500/15 text-amber-400 border-amber-500/25'}`}>
                                  {f.status}
                                </span>
                              </div>
                            </div>
                            
                            <div className="space-y-2.5">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-stone-800 flex items-center justify-center shrink-0">
                                  <span className="text-[10px] font-bold text-amber-400">{(f.user?.name || f.user?.email || "U")[0].toUpperCase()}</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className={`text-[11px] ${isDark ? "text-stone-500" : "text-stone-500"} leading-none`}>{text.userLabel}</div>
                                  <div className={`text-[13px] font-bold truncate ${isDark ? "text-white" : "text-stone-900"}`}>{f.user?.name || f.user?.email}</div>
                                </div>
                              </div>
                              
                              <div className={`p-3 rounded-xl border ${isDark ? "bg-stone-800/40 border-stone-700/30" : "bg-amber-50/50 border-amber-100"}`}>
                                <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-stone-500" : "text-stone-500"} mb-1`}>{text.bookLabel}</div>
                                <h4 className={`text-[14px] sm:text-[15px] font-bold leading-snug line-clamp-2 ${isDark ? "text-white" : "text-stone-900"}`}>{f.borrowing?.book?.title || f.book?.title || "Book"}</h4>
                              </div>
                            </div>

                            <div className="mt-4 space-y-2 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-2.5">
                              <div className={`flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-3 p-3 rounded-xl border ${isDark ? "bg-stone-900/60 border-stone-800" : "bg-white border-stone-200 shadow-sm"}`}>
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
                                    <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                                  </div>
                                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider sm:hidden">{lang === "ar" ? "المبلغ" : "Amount"}</span>
                                </div>
                                <div className="text-right sm:text-left">
                                  <div className="hidden sm:block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">{lang === "ar" ? "المبلغ" : "Amount"}</div>
                                  <div className="text-[14px] sm:text-[15px] font-black text-amber-500">{f.amount} EGP</div>
                                </div>
                              </div>
                              
                              <div className={`flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-3 p-3 rounded-xl border ${isDark ? "bg-stone-900/60 border-stone-800" : "bg-white border-stone-200 shadow-sm"}`}>
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center">
                                    <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                                  </div>
                                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider sm:hidden">{text.methodLabel}</span>
                                </div>
                                <div className="text-right sm:text-left min-w-0">
                                  <div className="hidden sm:block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">{text.methodLabel}</div>
                                  <div className="text-[13px] sm:text-[13px] font-bold text-stone-300 truncate max-w-[120px] sm:max-w-none">{f.method || "N/A"}</div>
                                </div>
                              </div>
                              
                              <div className={`flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-3 p-3 rounded-xl border ${isDark ? "bg-stone-900/60 border-stone-800" : "bg-white border-stone-200 shadow-sm"}`}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${f.status === 'PAID' ? 'bg-emerald-500/15' : 'bg-amber-500/15'}`}>
                                    <CheckCircle2 className={`w-3.5 h-3.5 ${f.status === 'PAID' ? 'text-emerald-400' : 'text-amber-400'}`} />
                                  </div>
                                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider sm:hidden">{text.statusLabel}</span>
                                </div>
                                <div className="text-right sm:text-left">
                                  <div className="hidden sm:block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">{text.statusLabel}</div>
                                  <div className={`text-[13px] font-black ${f.status === 'PAID' ? 'text-emerald-400' : 'text-amber-400'}`}>{f.status}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                          {f.status === 'PENDING' && (
                            <button onClick={() => approveCashPayment(f.id, f.txType)} className="mt-4 w-full sm:w-auto px-5 py-3 sm:py-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-[13px] sm:text-xs font-black tracking-wide transition-all duration-200 border border-emerald-500/30 shadow-[0_4px_12px_rgba(16,185,129,0.25)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.35)] active:scale-[0.98] flex items-center justify-center gap-2">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>{text.approveBtn}</span>
                            </button>
                          )}
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-2xl border ${isDark ? "bg-stone-950/40 border-stone-800" : "bg-amber-50/30 border-amber-200"}`}>
                  <h4 className={`text-[13px] sm:text-sm font-bold mb-3 sm:mb-4 flex items-center gap-2 ${isDark ? "text-stone-200" : "text-stone-800"}`}>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                      <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                    </div>
                    <span>{text.borrowRate}</span>
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-stone-400">Borrowed Books ratio</span>
                        <span className="text-amber-500 font-bold">
                          {books.length > 0 ? Math.round((allBorrowsList.length / books.length) * 100) : 0}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full" 
                          style={{ width: `${books.length > 0 ? Math.round((allBorrowsList.length / books.length) * 100) : 0}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`p-4 sm:p-6 rounded-2xl border ${isDark ? "bg-stone-950/40 border-stone-800" : "bg-amber-50/30 border-amber-200"}`}>
                  <h4 className={`text-[13px] sm:text-sm font-bold mb-3 sm:mb-4 flex items-center gap-2 ${isDark ? "text-stone-200" : "text-stone-800"}`}>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                      <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                    </div>
                    <span>{text.categoryDist}</span>
                  </h4>
                  <div className="space-y-4 max-h-48 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-stone-900/50 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/80 hover:[&::-webkit-scrollbar-thumb]:bg-amber-400 [&::-webkit-scrollbar-thumb]:rounded-full">
                    {categoryStats.map((stat, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-stone-400">{getCategoryLabel(stat.name, lang)} ({stat.count})</span>
                          <span className="text-amber-500 font-bold">{stat.percentage}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${stat.percentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className={`mb-8 p-4 sm:p-6 rounded-2xl border ${isDark ? "bg-stone-950/40 border-stone-800" : "bg-amber-50/30 border-amber-200"}`}>
                <h4 className={`text-sm font-bold mb-4 flex items-center gap-2 ${isDark ? "text-stone-200" : "text-stone-800"}`}>
                  <Plus className="w-4 h-4 text-amber-500"/> {text.addBookTitle}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide">{text.bookTitle}</label>
                    <input value={newBook.title} onChange={e => setNewBook({ ...newBook, title: e.target.value })} placeholder={text.bookTitle} className={`h-11 rounded-xl px-4 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 border transition-all ${isDark ? "bg-stone-900 border-stone-800 text-white placeholder:text-stone-500" : "bg-white border-amber-200 text-stone-900 placeholder:text-stone-400"}`} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide">{text.bookAuthor}</label>
                    <input value={newBook.author} onChange={e => setNewBook({ ...newBook, author: e.target.value })} placeholder={text.bookAuthor} className={`h-11 rounded-xl px-4 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 border transition-all ${isDark ? "bg-stone-900 border-stone-800 text-white placeholder:text-stone-500" : "bg-white border-amber-200 text-stone-900 placeholder:text-stone-400"}`} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide">{text.bookCategory}</label>
                    <input value={newBook.category} onChange={e => setNewBook({ ...newBook, category: e.target.value })} placeholder={text.bookCategory} className={`h-11 rounded-xl px-4 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 border transition-all ${isDark ? "bg-stone-900 border-stone-800 text-white placeholder:text-stone-500" : "bg-white border-amber-200 text-stone-900 placeholder:text-stone-400"}`} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide">{text.bookCopies}</label>
                    <input value={newBook.totalCopies} onChange={e => setNewBook({ ...newBook, totalCopies: parseInt(e.target.value) || 1 })} type="number" min={1} placeholder={text.bookCopies} className={`h-11 rounded-xl px-4 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 border transition-all ${isDark ? "bg-stone-900 border-stone-800 text-white placeholder:text-stone-500" : "bg-white border-amber-200 text-stone-900 placeholder:text-stone-400"}`} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide">{text.bookPrice}</label>
                    <input value={newBook.price} onChange={e => setNewBook({ ...newBook, price: parseFloat(e.target.value) || 0 })} type="number" min={0} step={0.01} placeholder={text.bookPrice} className={`h-11 rounded-xl px-4 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 border transition-all ${isDark ? "bg-stone-900 border-stone-800 text-white placeholder:text-stone-500" : "bg-white border-amber-200 text-stone-900 placeholder:text-stone-400"}`} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide">Cover Image</label>
                    <div className={`relative h-11 rounded-xl border flex items-center px-2 gap-2 overflow-hidden transition-all focus-within:ring-2 focus-within:ring-amber-500/30 focus-within:border-amber-500 ${isDark ? "bg-stone-900 border-stone-800" : "bg-white border-amber-200"}`}>
                      <label className="shrink-0 cursor-pointer px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-[11px] font-bold transition">
                        <span>Choose File</span>
                        <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files?.[0] || null)} className="hidden" />
                      </label>
                      <span className={`text-[11px] truncate flex-1 ${coverFile ? (isDark ? "text-white" : "text-stone-900") : "text-stone-500"}`}>{coverFile ? coverFile.name : "No file chosen"}</span>
                    </div>
                  </div>
                </div>
                <button onClick={addBook} className="mt-6 w-full h-12 sm:h-11 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98]">
                  <Plus className="w-4 h-4"/> {text.saveBook}
                </button>
              </div>

              <div className={`p-4 sm:p-6 rounded-2xl border ${isDark ? "bg-stone-950/40 border-stone-800" : "bg-amber-50/30 border-amber-200"}`}>
                <h4 className={`text-sm font-bold mb-4 flex items-center gap-2 ${isDark ? "text-stone-200" : "text-stone-800"}`}>
                  <BookOpen className="w-4 h-4 text-amber-500"/> {text.manageBooks}
                  <span className="ml-auto text-[11px] font-normal px-2.5 py-1 rounded-full bg-stone-800 text-stone-400">{books.length} books</span>
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-h-[65vh] sm:max-h-[70vh] overflow-y-auto pr-1 sm:pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-stone-900/50 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/80 hover:[&::-webkit-scrollbar-thumb]:bg-amber-400 [&::-webkit-scrollbar-thumb]:rounded-full">
                  {books.map((b: any) => (
                    <div key={`${getBookId(b)}-${b.coverUrl}`} className={`group flex flex-col xs:flex-row sm:flex-col md:flex-row items-start md:items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl border transition-all hover:shadow-md ${isDark ? "bg-stone-900 border-stone-800 hover:border-stone-700" : "bg-white border-amber-200 hover:border-amber-300"}`}>
                      <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0 w-full">
                        <img key={`${getBookId(b)}-${b.coverUrl}`} src={getCover(b)} alt={b.title} className="w-12 h-16 sm:w-11 sm:h-14 rounded-lg object-cover shrink-0 shadow-sm border border-stone-800/50" />
                        <div className="flex-1 min-w-0">
                          <div className={`text-[13px] sm:text-xs font-bold truncate leading-tight ${isDark ? "text-white" : "text-stone-900"}`} title={b.title}>{b.title}</div>
                          <div className="text-[11px] sm:text-[10px] text-stone-400 truncate mt-0.5" title={b.author}>{b.author}</div>
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${isDark ? "bg-stone-800 border-stone-700 text-stone-300" : "bg-amber-50 border-amber-200 text-stone-600"}`}>{getCategoryLabel(b.category || "Programming", lang)}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">{b.price ?? 0} EGP</span>
                            <span className="text-[9px] text-stone-500">{getAvail(b)}/{getTotal(b)} avail</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full xs:w-auto sm:w-full md:w-auto justify-end sm:justify-start md:justify-end shrink-0">
                        <button onClick={() => { setEditingBook({ ...b }); setEditCoverFile(null); }} className="flex-1 xs:flex-none sm:flex-1 md:flex-none justify-center px-3.5 py-2 sm:py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-stone-950 text-[11px] sm:text-xs font-semibold transition border border-amber-500/20 flex items-center gap-1.5">
                          <Edit3 className="w-3.5 h-3.5"/>
                          <span>{text.editBook}</span>
                        </button>
                        <button onClick={() => deleteBook(getBookId(b))} className="flex-1 xs:flex-none sm:flex-1 md:flex-none justify-center px-3.5 py-2 sm:py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900 text-rose-300 hover:text-white text-[11px] sm:text-xs font-semibold transition border border-rose-800/40 flex items-center gap-1.5">
                          <Trash2 className="w-3.5 h-3.5"/>
                          <span>{text.deleteBook}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {selectedFine && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} className={`border max-w-md w-full rounded-3xl p-6 shadow-2xl relative overflow-hidden ${isDark ? "bg-stone-900 border-amber-500/20" : "bg-white border-amber-200"}`}>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-800">
                <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-stone-900"}`}>
                  {text.finesTitle}
                </h3>
                <button onClick={() => setSelectedFine(null)} className="p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white transition">
                  <X className="w-4 h-4"/>
                </button>
              </div>

              <div className="space-y-4">
                <div className={`p-4 rounded-2xl border space-y-2 text-xs ${isDark ? "bg-stone-950 border-stone-800 text-stone-300" : "bg-amber-50 border-amber-200 text-stone-700"}`}>
                  <div className="flex justify-between"><span>Book:</span><span className="font-bold">{selectedFine.borrowing?.book?.title}</span></div>
                  <div className="flex justify-between"><span>{text.daysLateLabel}</span><span className="font-bold text-orange-400">{selectedFine.daysLate} Days</span></div>
                  <div className="flex justify-between"><span>{text.amountLabel}</span><span className="font-bold text-amber-400">{selectedFine.amount} EGP</span></div>
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-2 ${isDark ? "text-stone-300" : "text-stone-700"}`}>{text.paymentMethodLabel}</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button type="button" onClick={() => setPaymentMethod("CARD")} className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 ${paymentMethod === "CARD" ? "bg-amber-500 text-stone-950 border-amber-500" : isDark ? "bg-stone-950 border-stone-800 text-stone-300" : "bg-white border-amber-200 text-stone-700"}`}>
                      <CreditCard className="w-4 h-4"/>
                      <span>Card</span>
                    </button>
                    <button type="button" onClick={() => setPaymentMethod("WALLET")} className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 ${paymentMethod === "WALLET" ? "bg-amber-500 text-stone-950 border-amber-500" : isDark ? "bg-stone-950 border-stone-800 text-stone-300" : "bg-white border-amber-200 text-stone-700"}`}>
                      <Wallet className="w-4 h-4"/>
                      <span>Wallet</span>
                    </button>
                    <button type="button" onClick={() => setPaymentMethod("CASH")} className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 ${paymentMethod === "CASH" ? "bg-amber-500 text-stone-950 border-amber-500" : isDark ? "bg-stone-950 border-stone-800 text-stone-300" : "bg-white border-amber-200 text-stone-700"}`}>
                      <DollarSign className="w-4 h-4"/>
                      <span>Cash</span>
                    </button>
                  </div>
                </div>

                {paymentMethod !== "CASH" && (
                  <div className="text-[11px] text-stone-400 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                    🔒 You will be securely redirected to complete your online transaction safely.
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <button onClick={() => setSelectedFine(null)} disabled={isProcessingPayment} className="flex-1 h-11 rounded-xl bg-stone-800 text-stone-300 text-xs font-bold hover:bg-stone-700 transition">{text.cancel}</button>
                  <button onClick={payFineAction} disabled={isProcessingPayment} className="flex-1 h-11 rounded-xl bg-amber-500 text-stone-950 text-xs font-bold hover:bg-amber-400 transition shadow-lg shadow-amber-500/20">
                    {isProcessingPayment 
                      ? text.redirectingPay 
                      : paymentMethod === "CASH" 
                      ? "Submit Cash Request" 
                      : text.payConfirm}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingBook && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} className={`border max-w-md w-full rounded-3xl p-6 shadow-2xl relative overflow-hidden ${isDark ? "bg-stone-900 border-amber-500/20" : "bg-white border-amber-200"}`}>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-800">
                <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-stone-900"}`}>{text.editBookTitle}</h3>
                <button onClick={() => setEditingBook(null)} className="p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white transition">
                  <X className="w-4 h-4"/>
                </button>
              </div>

              <form onSubmit={updateBook} className="space-y-4">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDark ? "text-stone-300" : "text-stone-700"}`}>{text.bookTitle}</label>
                  <input value={editingBook.title || ""} onChange={e => setEditingBook({ ...editingBook, title: e.target.value })} required className={`w-full h-11 rounded-xl px-4 text-xs focus:outline-none focus:border-amber-500 ${isDark ? "bg-stone-950 border-stone-800 text-white" : "bg-amber-50 border-amber-200 text-stone-900"}`} />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDark ? "text-stone-300" : "text-stone-700"}`}>{text.bookAuthor}</label>
                  <input value={editingBook.author || ""} onChange={e => setEditingBook({ ...editingBook, author: e.target.value })} required className={`w-full h-11 rounded-xl px-4 text-xs focus:outline-none focus:border-amber-500 ${isDark ? "bg-stone-950 border-stone-800 text-white" : "bg-amber-50 border-amber-200 text-stone-900"}`} />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDark ? "text-stone-300" : "text-stone-700"}`}>{text.bookCategory}</label>
                  <input value={editingBook.category || ""} onChange={e => setEditingBook({ ...editingBook, category: e.target.value })} required className={`w-full h-11 rounded-xl px-4 text-xs focus:outline-none focus:border-amber-500 ${isDark ? "bg-stone-950 border-stone-800 text-white" : "bg-amber-50 border-amber-200 text-stone-900"}`} />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDark ? "text-stone-300" : "text-stone-700"}`}>{text.bookCopies}</label>
                  <input type="number" value={editingBook.totalCopies ?? editingBook.total_copies ?? 5} onChange={e => setEditingBook({ ...editingBook, totalCopies: parseInt(e.target.value) || 1 })} required className={`w-full h-11 rounded-xl px-4 text-xs focus:outline-none focus:border-amber-500 ${isDark ? "bg-stone-950 border-stone-800 text-white" : "bg-amber-50 border-amber-200 text-stone-900"}`} />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDark ? "text-stone-300" : "text-stone-700"}`}>{text.bookPrice}</label>
                  <input type="number" step="0.01" value={editingBook.price ?? 0} onChange={e => setEditingBook({ ...editingBook, price: parseFloat(e.target.value) || 0 })} required className={`w-full h-11 rounded-xl px-4 text-xs focus:outline-none focus:border-amber-500 ${isDark ? "bg-stone-950 border-stone-800 text-white" : "bg-amber-50 border-amber-200 text-stone-900"}`} />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDark ? "text-stone-300" : "text-stone-700"}`}>Update Cover Image</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => setEditCoverFile(e.target.files?.[0] || null)} 
                    className={`w-full h-11 rounded-xl px-2 py-1.5 text-[11px] border file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-amber-500 file:text-stone-950 file:font-bold ${isDark ? "bg-stone-950 border-stone-800 text-stone-300" : "bg-amber-50 border-amber-200 text-stone-700"}`} 
                  />
                </div>

                <div className="mt-6 flex gap-3">
                  <button type="button" onClick={() => setEditingBook(null)} className="flex-1 h-11 rounded-xl bg-stone-800 text-stone-300 text-xs font-bold hover:bg-stone-700 transition">{text.cancel}</button>
                  <button type="submit" className="flex-1 h-11 rounded-xl bg-amber-500 text-stone-950 text-xs font-bold hover:bg-amber-400 transition shadow-lg shadow-amber-500/20">{text.updateBook}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBooksModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} className={`border max-w-3xl w-full rounded-3xl p-6 shadow-2xl relative overflow-hidden ${isDark ? "bg-stone-900 border-amber-500/20" : "bg-white border-amber-200"}`}>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-800">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-amber-500"/>
                  <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-stone-900"}`}>{text.totalBooks} ({books.length})</h3>
                </div>
                <button onClick={() => setShowBooksModal(false)} className="p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white transition">
                  <X className="w-4 h-4"/>
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-3 pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-stone-900/50 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/80 hover:[&::-webkit-scrollbar-thumb]:bg-amber-400 [&::-webkit-scrollbar-thumb]:rounded-full">
                {books.length === 0 ? (
                  <p className="text-xs text-stone-400 text-center py-6">No books found in the library.</p>
                ) : (
                  books.map((b: any) => (
                    <div key={getBookId(b)} className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${isDark ? "bg-stone-950 border-stone-800" : "bg-amber-50 border-amber-200"}`}>
                      <div className="flex items-center gap-3">
                        <img src={getCover(b)} className="w-12 h-14 object-cover rounded-xl shadow-md" />
                        <div>
                          <div className={`text-sm font-bold ${isDark ? "text-white" : "text-stone-900"}`}>{b.title}</div>
                          <div className="text-xs text-stone-400">{b.author} • <span className="text-amber-500 font-semibold">{getCategoryLabel(b.category || "Programming", lang)}</span> • Price: <span className="text-amber-400 font-bold">{b.price ?? 0} EGP</span></div>
                        </div>
                      </div>
                      <div className="text-right font-mono text-xs text-amber-400">
                        Available: {getAvail(b)} / Total: {getTotal(b)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUsersModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} className={`border max-w-2xl w-full rounded-3xl p-6 shadow-2xl relative ${isDark ? "bg-stone-900 border-orange-500/20" : "bg-white border-amber-200"}`}>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-800">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-orange-500"/>
                  <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-stone-900"}`}>{text.totalUsers} ({usersList.length})</h3>
                </div>
                <button onClick={() => setShowUsersModal(false)} className="p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white transition">
                  <X className="w-4 h-4"/>
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-3 pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-stone-900/50 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/80 hover:[&::-webkit-scrollbar-thumb]:bg-amber-400 [&::-webkit-scrollbar-thumb]:rounded-full">
                {usersList.length === 0 ? (
                  <p className="text-xs text-stone-400 text-center py-6">No registered users found.</p>
                ) : (
                  usersList.map((u: any) => {
                    const userId = u.id || u._id;
                    const userRole = u.role || "USER";
                    const isMenuOpen = activeUserMenu === userId;

                    return (
                      <div key={userId} className={`p-4 rounded-2xl border flex items-center justify-between gap-4 relative ${isDark ? "bg-stone-950 border-stone-800" : "bg-amber-50 border-amber-200"}`}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl border ${userRole === "ADMIN" ? "bg-amber-500/10 border-amber-500/30 text-amber-500" : "bg-stone-800 border-stone-700 text-stone-400"}`}>
                            {userRole === "ADMIN" ? <ShieldCheck className="w-4 h-4"/> : <UserCheck className="w-4 h-4"/>}
                          </div>
                          <div>
                            <div className={`text-sm font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-stone-900"}`}>
                              <span>{u.name || "No Name"}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${userRole === "ADMIN" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-stone-800 text-stone-400 border border-stone-700"}`}>
                                {userRole}
                              </span>
                            </div>
                            <div className="text-xs text-stone-400">{u.email}</div>
                          </div>
                        </div>

                        <div className="relative">
                          <button
                            onClick={() => setActiveUserMenu(isMenuOpen ? null : userId)}
                            className={`p-2 rounded-xl border transition-all duration-200 ${
                              isMenuOpen 
                                ? "bg-amber-500 text-stone-950 border-amber-400" 
                                : isDark 
                                ? "bg-stone-900 border-stone-800 text-stone-400 hover:text-white hover:border-amber-500/40" 
                                : "bg-white border-amber-200 text-stone-600 hover:text-stone-900"
                            }`}
                            title="Manage User"
                          >
                            <Edit3 className="w-4 h-4"/>
                          </button>

                          <AnimatePresence>
                            {isMenuOpen && (
                              <>
                                <div className="fixed inset-0 z-30" onClick={() => setActiveUserMenu(null)} />
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                  transition={{ duration: 0.15 }}
                                  className={`absolute right-0 top-11 z-40 w-52 p-1.5 rounded-2xl border shadow-2xl backdrop-blur-2xl space-y-1 ${
                                    isDark ? "bg-stone-950/95 border-amber-500/30 shadow-amber-500/10" : "bg-white/95 border-amber-200 shadow-stone-300/50"
                                  }`}
                                >
                                  <button
                                    onClick={() => updateUserRole(userId, userRole)}
                                    className={`w-full px-3 py-2 rounded-xl text-xs font-semibold text-left transition flex items-center gap-2.5 ${
                                      isDark 
                                        ? "text-stone-300 hover:bg-amber-500/20 hover:text-amber-400" 
                                        : "text-stone-700 hover:bg-amber-50/80 hover:text-amber-800"
                                    }`}
                                  >
                                    <UserCog className="w-4 h-4 text-amber-500"/>
                                    <span>Make {userRole === "ADMIN" ? "USER" : "ADMIN"}</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setEmailUserTarget(u);
                                      setEmailSubject("Notice from ShelfLoop Library Admin");
                                      setEmailMessage("");
                                      setActiveUserMenu(null);
                                    }}
                                    className={`w-full px-3 py-2 rounded-xl text-xs font-semibold text-left transition flex items-center gap-2.5 ${
                                      isDark 
                                        ? "text-stone-300 hover:bg-orange-500/20 hover:text-orange-400" 
                                        : "text-stone-700 hover:bg-orange-50/80 hover:text-orange-800"
                                    }`}
                                  >
                                    <Mail className="w-4 h-4 text-orange-500"/>
                                    <span>Send Direct Email</span>
                                  </button>

                                  <button
                                    onClick={() => deleteUser(userId)}
                                    className={`w-full px-3 py-2 rounded-xl text-xs font-semibold text-left transition flex items-center gap-2.5 ${
                                      isDark 
                                        ? "text-rose-400 hover:bg-rose-950/60 hover:text-rose-300" 
                                        : "text-rose-600 hover:bg-rose-50/80 hover:text-rose-700"
                                    }`}
                                  >
                                    <Trash2 className="w-4 h-4 text-rose-500"/>
                                    <span>Delete User</span>
                                  </button>
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {emailUserTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} className={`border max-w-md w-full rounded-3xl p-6 shadow-2xl relative overflow-hidden ${isDark ? "bg-stone-900 border-amber-500/20" : "bg-white border-amber-200"}`}>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center">
                    <Mail className="w-5 h-5"/>
                  </div>
                  <div>
                    <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-stone-900"}`}>Send Email Warning</h3>
                    <p className="text-[11px] text-stone-400">To: <span className="text-amber-400 font-semibold">{emailUserTarget.email}</span></p>
                  </div>
                </div>
                <button onClick={() => setEmailUserTarget(null)} className="p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white transition">
                  <X className="w-4 h-4"/>
                </button>
              </div>

              <form onSubmit={handleSendDirectEmail} className="space-y-4">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDark ? "text-stone-300" : "text-stone-700"}`}>Subject</label>
                  <input 
                    value={emailSubject} 
                    onChange={e => setEmailSubject(e.target.value)} 
                    required 
                    placeholder="e.g. Overdue Borrow Warning / Payment Notification" 
                    className={`w-full h-11 rounded-xl px-4 text-xs focus:outline-none focus:border-amber-500 ${isDark ? "bg-stone-950 border-stone-800 text-white" : "bg-amber-50 border-amber-200 text-stone-900"}`} 
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDark ? "text-stone-300" : "text-stone-700"}`}>Message Content</label>
                  <textarea 
                    value={emailMessage} 
                    onChange={e => setEmailMessage(e.target.value)} 
                    required 
                    rows={4} 
                    placeholder="Type warning message or late fine notification details..." 
                    className={`w-full rounded-xl p-4 text-xs focus:outline-none focus:border-amber-500 resize-none ${isDark ? "bg-stone-950 border-stone-800 text-white" : "bg-amber-50 border-amber-200 text-stone-900"}`} 
                  />
                </div>

                <div className="mt-6 flex gap-3">
                  <button type="button" onClick={() => setEmailUserTarget(null)} disabled={isSendingEmail} className="flex-1 h-11 rounded-xl bg-stone-800 text-stone-300 text-xs font-bold hover:bg-stone-700 transition">{text.cancel}</button>
                  <button type="submit" disabled={isSendingEmail} className="flex-1 h-11 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 text-xs font-bold hover:from-amber-400 hover:to-orange-400 transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2">
                    <Send className="w-3.5 h-3.5"/>
                    <span>{isSendingEmail ? "Sending..." : "Send Email"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBorrowsModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} className={`border max-w-3xl w-full rounded-3xl p-6 shadow-2xl relative overflow-hidden ${isDark ? "bg-stone-900 border-amber-500/20" : "bg-white border-amber-200"}`}>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-800">
                <div className="flex items-center gap-3">
                  <Library className="w-5 h-5 text-amber-500"/>
                  <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-stone-900"}`}>{text.borrowedBooks} ({allBorrowsList.length})</h3>
                </div>
                <button onClick={() => setShowBorrowsModal(false)} className="p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white transition">
                  <X className="w-4 h-4"/>
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-3 pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-stone-900/50 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500/80 hover:[&::-webkit-scrollbar-thumb]:bg-amber-400 [&::-webkit-scrollbar-thumb]:rounded-full">
                {allBorrowsList.length === 0 ? (
                  <p className="text-xs text-stone-400 text-center py-6">No currently borrowed books.</p>
                ) : (
                  allBorrowsList.map((item: any) => (
                    <div key={item.id} className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${isDark ? "bg-stone-950 border-stone-800" : "bg-amber-50 border-amber-200"}`}>
                      <div className="flex items-center gap-3">
                        <img src={getCover(item.book)} className="w-12 h-14 object-cover rounded-xl shadow-md" />
                        <div>
                          <div className={`text-sm font-bold ${isDark ? "text-white" : "text-stone-900"}`}>{item.book?.title || "Book"}</div>
                          <div className="text-xs text-stone-400">Borrowed by: <span className="text-amber-400 font-medium">{item.user?.name || item.user?.email || "User"}</span></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-mono text-amber-500 block">
                          Due: {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "14 days"}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${item.isReturned ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                          {item.isReturned ? "Returned" : "Active Borrow"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hint && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} className={`border max-w-md w-full rounded-3xl p-6 shadow-2xl relative overflow-hidden ${isDark ? "bg-stone-900 border-amber-500/20" : "bg-white border-amber-200"}`}>
              <img src={getCover(hint)} className="w-full h-40 object-cover rounded-2xl mb-4" />
              <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-stone-900"}`}>{text.confirmBorrowTitle}: "{hint.title}"</h3>
              
              <div className={`mt-4 p-4 rounded-2xl border space-y-2 text-xs ${isDark ? "bg-stone-950 border-stone-800 text-stone-300" : "bg-amber-50 border-amber-200 text-stone-700"}`}>
                <div className="flex items-center justify-between"><span>{text.period}</span><span className="font-bold text-amber-500">{text.days}</span></div>
                <div className="flex items-center justify-between"><span>{text.fine}</span><span className="font-bold text-orange-500">{text.fineVal}</span></div>
              </div>

              <div className="mt-6 flex gap-3">
                <button onClick={() => setHint(null)} disabled={isProcessingBorrow} className="flex-1 h-11 rounded-xl bg-stone-800 text-stone-300 text-xs font-bold hover:bg-stone-700 transition">{text.cancel}</button>
                <button onClick={confirmBorrow} disabled={isProcessingBorrow} className="flex-1 h-11 rounded-xl bg-amber-500 text-stone-950 text-xs font-bold hover:bg-amber-400 transition shadow-lg shadow-amber-500/20">
                  {isProcessingBorrow ? "Processing..." : text.confirm}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {buyHint && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} className={`border max-w-md w-full rounded-3xl p-6 shadow-2xl relative overflow-hidden ${isDark ? "bg-stone-900 border-amber-500/20" : "bg-white border-amber-200"}`}>
              <img src={getCover(buyHint)} className="w-full h-40 object-cover rounded-2xl mb-4" />
              <h3 className={`text-lg font-bold mb-2 ${isDark ? "text-white" : "text-stone-900"}`}>{text.confirmBuyTitle}: "{buyHint.title}"</h3>
              
              <div className="space-y-4">
                <div className={`p-4 rounded-2xl border space-y-2 text-xs ${isDark ? "bg-stone-950 border-stone-800 text-stone-300" : "bg-amber-50 border-amber-200 text-stone-700"}`}>
                  <div className="flex justify-between items-center font-bold text-sm">
                    <span>{text.unitPriceLabel}:</span>
                    <span className="text-amber-400 text-base">{buyHint.price ?? 150} EGP</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-sm">
                    <span>{text.availableCopiesLabel}:</span>
                    <span className="text-emerald-400 text-base">{getAvail(buyHint)}</span>
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-stone-300" : "text-stone-700"}`}>{text.numberOfCopiesLabel}</label>
                  <input 
                    type="number" 
                    min={1} 
                    max={getAvail(buyHint)}
                    value={buyQuantity} 
                    onChange={e => {
                      const val = parseInt(e.target.value) || 1;
                      setBuyQuantity(val);
                      if (val > getAvail(buyHint)) {
                        setBuyError(`Error: Requested quantity (${val}) exceeds available copies (${getAvail(buyHint)}).`);
                      } else {
                        setBuyError("");
                      }
                    }} 
                    className={`w-full h-11 rounded-xl px-4 text-sm font-bold focus:outline-none focus:border-amber-500 ${isDark ? "bg-stone-950 border-stone-800 text-amber-400" : "bg-amber-50 border-amber-200 text-stone-900"}`} 
                  />
                </div>

                {buyError && (
                  <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/40 text-rose-300 text-xs font-bold flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0"/>
                    <span>{buyError}</span>
                  </div>
                )}

                <div className={`p-3 rounded-xl border flex justify-between items-center text-xs font-bold ${isDark ? "bg-stone-950 border-stone-800 text-amber-300" : "bg-amber-50 border-amber-200 text-amber-900"}`}>
                  <span>{text.totalCalculatedPriceLabel}:</span>
                  <span className="text-base text-amber-400">{(buyHint.price ?? 150) * buyQuantity} EGP</span>
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-2 ${isDark ? "text-stone-300" : "text-stone-700"}`}>{text.paymentMethodLabel}</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button type="button" onClick={() => setBuyPaymentMethod("CARD")} className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 ${buyPaymentMethod === "CARD" ? "bg-amber-500 text-stone-950 border-amber-500" : isDark ? "bg-stone-950 border-stone-800 text-stone-300" : "bg-white border-amber-200 text-stone-700"}`}>
                      <CreditCard className="w-4 h-4"/>
                      <span>{text.cardMethod}</span>
                    </button>
                    <button type="button" onClick={() => setBuyPaymentMethod("WALLET")} className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 ${buyPaymentMethod === "WALLET" ? "bg-amber-500 text-stone-950 border-amber-500" : isDark ? "bg-stone-950 border-stone-800 text-stone-300" : "bg-white border-amber-200 text-stone-700"}`}>
                      <Wallet className="w-4 h-4"/>
                      <span>{text.walletMethod}</span>
                    </button>
                    <button type="button" onClick={() => setBuyPaymentMethod("CASH")} className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 ${buyPaymentMethod === "CASH" ? "bg-amber-500 text-stone-950 border-amber-500" : isDark ? "bg-stone-950 border-stone-800 text-stone-300" : "bg-white border-amber-200 text-stone-700"}`}>
                      <DollarSign className="w-4 h-4"/>
                      <span>{text.cashMethod}</span>
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button onClick={() => { setBuyHint(null); setBuyError(""); }} disabled={isProcessingBuy} className="flex-1 h-11 rounded-xl bg-stone-800 text-stone-300 text-xs font-bold hover:bg-stone-700 transition">{text.cancel}</button>
                  <button onClick={confirmPurchase} disabled={isProcessingBuy || Boolean(buyError)} className="flex-1 h-11 rounded-xl bg-amber-500 disabled:opacity-50 text-stone-950 text-xs font-bold hover:bg-amber-400 transition shadow-lg shadow-amber-500/20">
                    {isProcessingBuy 
                      ? text.redirectingPay 
                      : buyPaymentMethod === "CASH" 
                      ? text.submitCashPurchase 
                      : text.confirmBuyBtn}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-24 border-t border-stone-800/80 bg-stone-950 text-stone-400 text-xs">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-stone-950 font-bold">
                  <Library className="w-4 h-4"/>
                </div>
                <span className="text-base font-bold text-white tracking-tight">ShelfLoop</span>
              </div>
              <p className="text-stone-500 max-w-sm leading-relaxed">
                {text.footerDesc}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-stone-200 mb-3 tracking-wide text-[11px] uppercase">{text.platform}</h4>
              <ul className="space-y-2.5">
                <li><button onClick={() => setActiveTab("catalog")} className="hover:text-amber-400 transition">{text.catalogTab}</button></li>
                <li><button onClick={() => setActiveTab("mybooks")} className="hover:text-amber-400 transition">{text.myBooksTab}</button></li>
                <li><button onClick={() => setActiveTab("purchases")} className="hover:text-amber-400 transition">{text.myPurchasesTab}</button></li>
                <li><button onClick={() => setActiveTab("favorites")} className="hover:text-amber-400 transition">{text.favoritesTab}</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-stone-200 mb-3 tracking-wide text-[11px] uppercase">{text.services}</h4>
              <ul className="space-y-2.5">
                <li><button onClick={() => setActiveTab("fines")} className="hover:text-amber-400 transition">{text.finesTab}</button></li>
                <li><button onClick={() => setActiveTab("ai")} className="hover:text-amber-400 transition">{text.aiTab}</button></li>
                <li><button onClick={() =>setActiveTab("contact")} className="hover:text-amber-400 transition">{text.contactTab}</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-stone-200 mb-3 tracking-wide text-[11px] uppercase">{text.system}</h4>
              <ul className="space-y-2.5 text-stone-500">
                <li><span>{text.apiVer}</span></li>
                <li><span>{text.secureGateway}</span></li>
                <li><span className="text-amber-400 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"/> {text.operational}</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-stone-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-stone-500 text-[11px]">
            <p>© {new Date().getFullYear()} ShelfLoop Inc. {text.allRights}</p>
            <div className="flex items-center gap-6">
              <span className="hover:text-stone-300 cursor-pointer transition">{text.privacyPolicy}</span>
              <span className="hover:text-stone-300 cursor-pointer transition">{text.termsOfService}</span>
              <span className="hover:text-stone-300 cursor-pointer transition">{text.security}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
