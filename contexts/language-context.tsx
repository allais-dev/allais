"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Define the available languages
export type Language = "en" | "ar"

// Define the translation data structure
type Translations = {
  [key in Language]: {
    [key: string]: string
  }
}

// Define the language context type
interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
  dir: "ltr" | "rtl"
}

// Define translations
const translations: Translations = {
  en: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.chat": "Chat",
    "nav.pages": "Pages",
    "nav.settings": "Settings",
    "nav.profile": "Profile",
    "nav.subscription": "Subscription",
    "nav.signOut": "Sign Out",
    "nav.support": "Support",

    // Chat
    "chat.placeholder": "Type a message...",
    "chat.send": "Send",
    "chat.newChat": "New Chat",
    "chat.suggestions": "Suggestions",
    "chat.history": "Chat History",
    "chat.clearHistory": "Clear History",
    "chat.recentChats": "Recent Chats",
    "chat.loadingChats": "Loading recent chats...",
    "chat.noChats": "No recent chats",
    "chat.untitledChat": "Untitled Chat",
    "chat.deleteConfirm": "Are you sure you want to delete this conversation?",
    "chat.deleted": "Conversation deleted",
    "chat.deletedDesc": "The conversation has been deleted",
    "chat.deleteError": "Failed to delete conversation",
    "chat.loginRequired": "Login required",
    "chat.loginRequiredDesc": "You need to be logged in to access this feature",
    "chat.welcome": "Welcome to Allais",
    "chat.startPrompt": "How can I help you today?",
    "chat.disclaimer": "Allais may make mistakes. Please use with discretion.",
    "chat.askFollowUp": "Ask a follow-up...",
    "chat.typeMessage": "Type a message...",
    "chat.clear": "Clear",
    "chat.retry": "Retry",
    "chat.copy": "Copy",
    "chat.retrying": "Retrying...",
    "chat.dailyLimitReached": "You've reached your daily limit ({count}/{max})",
    "chat.upgrade": "Upgrade",
    "chat.freeLimit": "Free users have limited messages per day.",
    "chat.upgradeToSendMore": "Upgrade to send more messages",
    "chat.somethingWentWrong": "Something went wrong",
    "chat.offlineWarning": "You are offline. Messages will be sent when you reconnect.",
    "chat.aiInOnePlaceTitle": "ChatGPT & Gemini in One Place",
    "chat.askMeAnything": "Ask me anything",
    "chat.processingRequest": "Processing your request...",

    // Placeholder messages
    "placeholder.noResponseContent": "No response content",
    "placeholder.thinking": "I'm thinking about this...",
    "placeholder.working": "Working on your question...",
    "placeholder.processing": "Processing your request...",
    "placeholder.analyzing": "Let me analyze that...",

    // Suggestions
    "suggestions.blogPost": "Blog Post",
    "suggestions.blogPostDesc": "Write a blog post about...",
    "suggestions.codeHelp": "Code Help",
    "suggestions.codeHelpDesc": "Help me debug this code",
    "suggestions.draftMessage": "Draft Message",
    "suggestions.draftMessageDesc": "Draft a professional response",
    "suggestions.generateIdeas": "Generate Ideas",
    "suggestions.generateIdeasDesc": "Generate ideas for...",
    "suggestions.coldEmail": "Cold Email",
    "suggestions.coldEmailDesc": "Help me write a cold email",
    "suggestions.newsletter": "Newsletter",
    "suggestions.newsletterDesc": "Write a newsletter about...",
    "suggestions.summarize": "Summarize",
    "suggestions.summarizeDesc": "Summarize this text",
    "suggestions.studyVocabulary": "Study Vocabulary",
    "suggestions.studyVocabularyDesc": "Create vocabulary cards",
    "suggestions.workoutPlan": "Workout Plan",
    "suggestions.workoutPlanDesc": "Create a workout plan",
    "suggestions.translate": "Translate",
    "suggestions.translateDesc": "Translate this text",
    "suggestions.analyzeBook": "Analyze Book",
    "suggestions.analyzeBookDesc": "Analyze this book content",
    "suggestions.learnCoding": "Learn Coding",
    "suggestions.learnCodingDesc": "How can I learn coding?",
    "suggestions.createMenu": "Create Menu",
    "suggestions.createMenuDesc": "Create a 4 course menu",
    "suggestions.writeStory": "Write Story",
    "suggestions.writeStoryDesc": "Help me write a story",

    // Settings
    "settings.title": "Settings",
    "settings.theme": "Theme",
    "settings.language": "Language",
    "settings.notifications": "Notifications",
    "settings.privacy": "Privacy",
    "settings.dark": "Dark",
    "settings.light": "Light",
    "settings.system": "System",
    "settings.english": "English",
    "settings.arabic": "Arabic",
    "settings.userInformation": "User Information",
    "settings.userId": "User ID",
    "settings.accountCreated": "Account Created",

    // Buttons
    "button.save": "Save",
    "button.cancel": "Cancel",
    "button.delete": "Delete",
    "button.edit": "Edit",
    "button.add": "Add",
    "button.remove": "Remove",
    "button.upload": "Upload",
    "button.download": "Download",
    "button.search": "Search",
    "button.filter": "Filter",
    "button.sort": "Sort",
    "button.clear": "Clear",
    "button.apply": "Apply",
    "button.reset": "Reset",
    "button.next": "Next",
    "button.previous": "Previous",
    "button.submit": "Submit",

    // Pages
    "pages.title": "Pages",
    "pages.new": "New Page",
    "pages.edit": "Edit Page",
    "pages.delete": "Delete Page",
    "pages.empty": "No pages found",
    "pages.myPages": "My Pages",
    "pages.loading": "Loading pages...",
    "pages.noPages": "No pages yet",
    "pages.create": "Create Page",
    "pages.untitled": "Untitled",
    "pages.deleteConfirm": "Are you sure you want to delete this page?",
    "pages.deleteSuccess": "Page deleted successfully",
    "pages.deleteError": "Failed to delete page",
    "pages.createFirstPage": "Create your first page to get started",

    // Profile
    "profile.title": "Profile",
    "profile.name": "Name",
    "profile.email": "Email",
    "profile.password": "Password",
    "profile.changePassword": "Change Password",
    "profile.saveChanges": "Save Changes",

    // Subscription
    "subscription.title": "Subscription Plans",
    "subscription.current": "Current Plan",
    "subscription.upgrade": "Upgrade",
    "subscription.downgrade": "Downgrade",
    "subscription.cancel": "Cancel Subscription",
    "subscription.free": "Free",
    "subscription.premium": "Premium",
    "subscription.enterprise": "Enterprise",
    "subscription.selectPlan": "Select the plan that best fits your needs. Upgrade anytime to unlock more features.",
    "subscription.newBillingCycle": "A new billing cycle will begin for your changes to take effect.",
    "subscription.freePlan": "Free Plan - $0/month",
    "subscription.fullAccess": "Full access to all features",
    "subscription.unlimitedMessages": "Unlimited messages",
    "subscription.unlimitedPages": "Unlimited page notes",
    "subscription.accessToAI": "Access to all AI models",
    "subscription.prioritySupport": "Priority support",
    "subscription.earlyAccess": "Early access to new features",
    "subscription.enjoyFree": "Enjoy all features completely free!",
    "subscription.currentPlanDetails": "Current Plan Details",
    "subscription.plan": "Plan",
    "subscription.status": "Status",
    "subscription.active": "Active",
    "subscription.inactive": "Inactive",
    "subscription.nextBillingDate": "Next billing date",
    "subscription.price": "Price",
    "subscription.month": "month",
    "subscription.successTitle": "Subscription successful!",
    "subscription.successDescription": "Your subscription has been updated successfully.",
    "subscription.canceledTitle": "Subscription canceled",
    "subscription.canceledDescription": "You have canceled the subscription process.",
    "subscription.allSetTitle": "You're all set!",
    "subscription.allSetDescription": "You already have access to all features for free.",
    "subscription.loading": "Loading...",

    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.welcome": "Welcome",
    "dashboard.summary": "Summary",
    "dashboard.activity": "Recent Activity",
    "dashboard.stats": "Statistics",
    "dashboard.notifications": "Notifications",

    // Placeholders
    "placeholder.search": "Search...",
    "placeholder.email": "Email",
    "placeholder.password": "Password",
    "placeholder.name": "Name",

    // Errors
    "error.general": "Something went wrong",
    "error.notFound": "Not found",
    "error.unauthorized": "Unauthorized",
    "error.forbidden": "Forbidden",
    "error.badRequest": "Bad request",

    // Success
    "success.saved": "Successfully saved",
    "success.deleted": "Successfully deleted",
    "success.updated": "Successfully updated",
    "success.created": "Successfully created",

    // Confirmation
    "confirm.delete": "Are you sure you want to delete this?",
    "confirm.cancel": "Are you sure you want to cancel?",
    "confirm.discard": "Are you sure you want to discard changes?",

    // Time
    "time.now": "Just now",
    "time.minute": "minute ago",
    "time.minutes": "minutes ago",
    "time.hour": "hour ago",
    "time.hours": "hours ago",
    "time.day": "day ago",
    "time.days": "days ago",
    "time.week": "week ago",
    "time.weeks": "weeks ago",
    "time.month": "month ago",
    "time.months": "months ago",
    "time.year": "year ago",
    "time.years": "years ago",

    // User
    "user.free": "Free",
    "user.preferences": "Preferences",
    "user.language": "Language",

    // Language
    "language.english": "English",
    "language.arabic": "Arabic",

    // Actions
    "action.login": "Sign in",
    "action.signOut": "Sign Out",
    "action.newChat": "New Chat",
    "action.startChat": "Start a new chat",

    // Login
    "login.subtitle": "Your gateway to AI-powered conversations",
    "login.welcomeBack": "Welcome back",
    "login.signInToContinue": "Sign in to continue to your dashboard",
    "login.rememberMe": "Remember me",
    "login.forgotPassword": "Forgot password?",
    "login.signingIn": "Signing in...",
    "login.orContinueWith": "Or continue with",
    "login.connecting": "Connecting...",
    "login.signInWithGoogle": "Sign in with Google",
    "login.noAccount": "Don't have an account?",
    "login.signUpNow": "Sign up now",
    "login.allRightsReserved": "All rights reserved.",
    "login.googleError": "Failed to initialize Google sign in",

    // Register
    "register.createAccount": "Create an account",
    "register.joinUsers": "Join thousands of users exploring AI possibilities",
    "register.displayName": "Display Name",
    "register.confirmPassword": "Confirm Password",
    "register.passwordsDoNotMatch": "Passwords do not match",
    "register.agreeToTerms": "I agree to the",
    "register.termsOfService": "Terms of Service",
    "register.and": "and",
    "register.privacyPolicy": "Privacy Policy",
    "register.creatingAccount": "Creating account...",
    "register.signUpWithGoogle": "Sign up with Google",
    "register.alreadyHaveAccount": "Already have an account?",
    "register.signInInstead": "Sign in instead",
    "register.successTitle": "Registration successful!",
    "register.successMessage": "Your account has been created. You will be redirected to the login page shortly.",
    "register.goToLogin": "Go to login",
    "register.googleError": "Failed to initialize Google sign up",
  },
  ar: {
    // Navigation
    "nav.dashboard": "لوحة التحكم",
    "nav.chat": "الدردشة",
    "nav.pages": "الصفحات",
    "nav.settings": "الإعدادات",
    "nav.profile": "الملف الشخصي",
    "nav.subscription": "الاشتراك",
    "nav.signOut": "تسجيل الخروج",
    "nav.support": "الدعم",

    // Chat
    "chat.placeholder": "اكتب رسالة...",
    "chat.send": "إرسال",
    "chat.newChat": "دردشة جديدة",
    "chat.suggestions": "اقتراحات",
    "chat.history": "سجل الدردشة",
    "chat.clearHistory": "مسح السجل",
    "chat.recentChats": "المحادثات الأخيرة",
    "chat.loadingChats": "جارٍ تحميل المحادثات الأخيرة...",
    "chat.noChats": "لا توجد محادثات حديثة",
    "chat.untitledChat": "محادثة بدون عنوان",
    "chat.deleteConfirm": "هل أنت متأكد أنك تريد حذف هذه المحادثة؟",
    "chat.deleted": "تم حذف المحادثة",
    "chat.deletedDesc": "تم حذف المحادثة",
    "chat.deleteError": "فشل في حذف المحادثة",
    "chat.loginRequired": "تسجيل الدخول مطلوب",
    "chat.loginRequiredDesc": "تحتاج إلى تسجيل الدخول للوصول إلى هذه الميزة",
    "chat.welcome": "مرحبًا بك في Allais",
    "chat.startPrompt": "كيف يمكنني مساعدتك اليوم؟",
    "chat.disclaimer": "قد يرتكب Allais أخطاء. يرجى استخدامه بحذر.",
    "chat.askFollowUp": "اطرح سؤالاً متابعاً...",
    "chat.typeMessage": "اكتب رسالة...",
    "chat.clear": "مسح",
    "chat.retry": "إعادة المحاولة",
    "chat.copy": "نسخ",
    "chat.retrying": "جارٍ إعادة المحاولة...",
    "chat.dailyLimitReached": "لقد وصلت إلى الحد اليومي ({count}/{max})",
    "chat.upgrade": "ترقية",
    "chat.freeLimit": "المستخدمون المجانيون لديهم رسائل محدودة يوميًا.",
    "chat.upgradeToSendMore": "قم بالترقية لإرسال المزيد من الرسائل",
    "chat.somethingWentWrong": "حدث خطأ ما",
    "chat.offlineWarning": "أنت غير متصل بالإنترنت. سيتم إرسال الرسائل عند إعادة الاتصال.",
    "chat.aiInOnePlaceTitle": "ChatGPT و Gemini في مكان واحد",
    "chat.askMeAnything": "اسألني أي شيء",
    "chat.processingRequest": "جاري معالجة طلبك...",

    // Placeholder messages
    "placeholder.noResponseContent": "لا يوجد محتوى للرد",
    "placeholder.thinking": "أنا أفكر في هذا...",
    "placeholder.working": "أعمل على سؤالك...",
    "placeholder.processing": "جاري معالجة طلبك...",
    "placeholder.analyzing": "دعني أحلل ذلك...",

    // Suggestions
    "suggestions.blogPost": "مقال مدونة",
    "suggestions.blogPostDesc": "اكتب مقالاً حول...",
    "suggestions.codeHelp": "مساعدة برمجية",
    "suggestions.codeHelpDesc": "ساعدني في تصحيح هذا الكود",
    "suggestions.draftMessage": "صياغة رسالة",
    "suggestions.draftMessageDesc": "صياغة رد احترافي",
    "suggestions.generateIdeas": "توليد أفكار",
    "suggestions.generateIdeasDesc": "توليد أفكار لـ...",
    "suggestions.coldEmail": "بريد تسويقي",
    "suggestions.coldEmailDesc": "ساعدني في كتابة بريد تسويقي",
    "suggestions.newsletter": "نشرة إخبارية",
    "suggestions.newsletterDesc": "اكتب نشرة إخبارية حول...",
    "suggestions.summarize": "تلخيص",
    "suggestions.summarizeDesc": "لخص هذا النص",
    "suggestions.studyVocabulary": "مفردات دراسية",
    "suggestions.studyVocabularyDesc": "إنشاء بطاقات مفردات",
    "suggestions.workoutPlan": "خطة تمرين",
    "suggestions.workoutPlanDesc": "إنشاء خطة تمرين",
    "suggestions.translate": "ترجمة",
    "suggestions.translateDesc": "ترجم هذا النص",
    "suggestions.analyzeBook": "تحليل كتاب",
    "suggestions.analyzeBookDesc": "تحليل محتوى هذا الكتاب",
    "suggestions.learnCoding": "تعلم البرمجة",
    "suggestions.learnCodingDesc": "كيف يمكنني تعلم البرمجة؟",
    "suggestions.createMenu": "إنشاء قائمة طعام",
    "suggestions.createMenuDesc": "إنشاء قائمة من 4 أطباق",
    "suggestions.writeStory": "كتابة قصة",
    "suggestions.writeStoryDesc": "ساعدني في كتابة قصة",

    // Settings
    "settings.title": "الإعدادات",
    "settings.theme": "المظهر",
    "settings.language": "اللغة",
    "settings.notifications": "الإشعارات",
    "settings.privacy": "الخصوصية",
    "settings.dark": "داكن",
    "settings.light": "فاتح",
    "settings.system": "حسب النظام",
    "settings.english": "الإنجليزية",
    "settings.arabic": "العربية",
    "settings.userInformation": "معلومات المستخدم",
    "settings.userId": "معرف المستخدم",
    "settings.accountCreated": "تاريخ إنشاء الحساب",

    // Buttons
    "button.save": "حفظ",
    "button.cancel": "إلغاء",
    "button.delete": "حذف",
    "button.edit": "تعديل",
    "button.add": "إضافة",
    "button.remove": "إزالة",
    "button.upload": "رفع",
    "button.download": "تحميل",
    "button.search": "بحث",
    "button.filter": "تصفية",
    "button.sort": "ترتيب",
    "button.clear": "مسح",
    "button.apply": "تطبيق",
    "button.reset": "إعادة ضبط",
    "button.next": "التالي",
    "button.previous": "السابق",
    "button.submit": "إرسال",

    // Pages
    "pages.title": "الصفحات",
    "pages.new": "صفحة جديدة",
    "pages.edit": "تعديل الصفحة",
    "pages.delete": "حذف الصفحة",
    "pages.empty": "لم يتم العثور على صفحات",
    "pages.myPages": "صفحاتي",
    "pages.loading": "جارٍ تحميل الصفحات...",
    "pages.noPages": "لا توجد صفحات بعد",
    "pages.create": "إنشاء صفحة",
    "pages.untitled": "بدون عنوان",
    "pages.deleteConfirm": "هل أنت متأكد أنك تريد حذف هذه الصفحة؟",
    "pages.deleteSuccess": "تم حذف الصفحة بنجاح",
    "pages.deleteError": "فشل في حذف الصفحة",
    "pages.createFirstPage": "أنشئ صفحتك الأولى للبدء",

    // Profile
    "profile.title": "الملف الشخصي",
    "profile.name": "الاسم",
    "profile.email": "البريد الإلكتروني",
    "profile.password": "كلمة المرور",
    "profile.changePassword": "تغيير كلمة المرور",
    "profile.saveChanges": "حفظ التغييرات",

    // Subscription
    "subscription.title": "خطط الاشتراك",
    "subscription.current": "الخطة الحالية",
    "subscription.upgrade": "ترقية",
    "subscription.downgrade": "تخفيض",
    "subscription.cancel": "إلغاء الاشتراك",
    "subscription.free": "مجاني",
    "subscription.premium": "مميز",
    "subscription.enterprise": "مؤسسة",
    "subscription.selectPlan": "اختر الخطة التي تناسب احتياجاتك. قم بالترقية في أي وقت لفتح المزيد من الميزات.",
    "subscription.newBillingCycle": "ستبدأ دورة فوترة جديدة لتفعيل التغييرات.",
    "subscription.freePlan": "الخطة المجانية - $0/شهر",
    "subscription.fullAccess": "وصول كامل لجميع الميزات",
    "subscription.unlimitedMessages": "��سائل غير محدودة",
    "subscription.unlimitedPages": "ملاحظات صفحات غير محدودة",
    "subscription.accessToAI": "الوصول إلى جميع نماذج الذكاء الاصطناعي",
    "subscription.prioritySupport": "دعم ذو أولوية",
    "subscription.earlyAccess": "وصول مبكر للميزات الجديدة",
    "subscription.enjoyFree": "استمتع بجميع الميزات مجانًا تمامًا!",
    "subscription.currentPlanDetails": "تفاصيل الخطة الحالية",
    "subscription.plan": "الخطة",
    "subscription.status": "الحالة",
    "subscription.active": "نشط",
    "subscription.inactive": "غير نشط",
    "subscription.nextBillingDate": "تاريخ الفوترة التالي",
    "subscription.price": "السعر",
    "subscription.month": "شهر",
    "subscription.successTitle": "تم الاشتراك بنجاح!",
    "subscription.successDescription": "تم تحديث اشتراكك بنجاح.",
    "subscription.canceledTitle": "تم إلغاء الاشتراك",
    "subscription.canceledDescription": "لقد ألغيت عملية الاشتراك.",
    "subscription.allSetTitle": "أنت جاهز!",
    "subscription.allSetDescription": "لديك بالفعل وصول إلى جميع الميزات مجانًا.",
    "subscription.loading": "جارٍ التحميل...",

    // Dashboard
    "dashboard.title": "لوحة التحكم",
    "dashboard.welcome": "مرحبًا",
    "dashboard.summary": "ملخص",
    "dashboard.activity": "النشاط الأخير",
    "dashboard.stats": "الإحصائيات",
    "dashboard.notifications": "الإشعارات",

    // Placeholders
    "placeholder.search": "بحث...",
    "placeholder.email": "البريد الإلكتروني",
    "placeholder.password": "كلمة المرور",
    "placeholder.name": "الاسم",

    // Errors
    "error.general": "حدث خطأ ما",
    "error.notFound": "غير موجود",
    "error.unauthorized": "غير مصرح",
    "error.forbidden": "محظور",
    "error.badRequest": "طلب غير صالح",

    // Success
    "success.saved": "تم الحفظ بنجاح",
    "success.deleted": "تم الحذف بنجاح",
    "success.updated": "تم التحديث بنجاح",
    "success.created": "تم الإنشاء بنجاح",

    // Confirmation
    "confirm.delete": "هل أنت متأكد أنك تريد حذف هذا؟",
    "confirm.cancel": "هل أنت متأكد أنك تريد الإلغاء؟",
    "confirm.discard": "هل أنت متأكد أنك تريد تجاهل التغييرات؟",

    // Time
    "time.now": "الآن",
    "time.minute": "دقيقة مضت",
    "time.minutes": "دقائق مضت",
    "time.hour": "ساعة مضت",
    "time.hours": "ساعات مضت",
    "time.day": "يوم مضى",
    "time.days": "أيام مضت",
    "time.week": "أسبوع مضى",
    "time.weeks": "أسابيع مضت",
    "time.month": "شهر مضى",
    "time.months": "أشهر مضت",
    "time.year": "سنة مضت",
    "time.years": "سنوات مضت",

    // User
    "user.free": "مجاني",
    "user.preferences": "التفضيلات",
    "user.language": "اللغة",

    // Language
    "language.english": "الإنجليزية",
    "language.arabic": "العربية",

    // Actions
    "action.login": "تسجيل الدخول",
    "action.signOut": "تسجيل الخروج",
    "action.newChat": "محادثة جديدة",
    "action.startChat": "بدء محادثة جديدة",

    // Login
    "login.subtitle": "بوابتك إلى المحادثات المدعومة بالذكاء الاصطناعي",
    "login.welcomeBack": "مرحبًا بعودتك",
    "login.signInToContinue": "سجل الدخول للمتابعة إلى لوحة التحكم",
    "login.rememberMe": "تذكرني",
    "login.forgotPassword": "نسيت كلمة المرور؟",
    "login.signingIn": "جاري تسجيل الدخول...",
    "login.orContinueWith": "أو تابع باستخدام",
    "login.connecting": "جاري الاتصال...",
    "login.signInWithGoogle": "تسجيل الدخول باستخدام جوجل",
    "login.noAccount": "ليس لديك حساب؟",
    "login.signUpNow": "سجل الآن",
    "login.allRightsReserved": "جميع الحقوق محفوظة.",
    "login.googleError": "فشل في بدء تسجيل الدخول باستخدام جوجل",

    // Register
    "register.createAccount": "إنشاء حساب",
    "register.joinUsers": "انضم إلى آلاف المستخدمين الذين يستكشفون إمكانيات الذكاء الاصطناعي",
    "register.displayName": "اسم العرض",
    "register.confirmPassword": "تأكيد كلمة المرور",
    "register.passwordsDoNotMatch": "كلمات المرور غير متطابقة",
    "register.agreeToTerms": "أوافق على",
    "register.termsOfService": "شروط الخدمة",
    "register.and": "و",
    "register.privacyPolicy": "سياسة الخصوصية",
    "register.creatingAccount": "جاري إنشاء الحساب...",
    "register.signUpWithGoogle": "التسجيل باستخدام جوجل",
    "register.alreadyHaveAccount": "لديك حساب بالفعل؟",
    "register.signInInstead": "سجل الدخول بدلاً من ذلك",
    "register.successTitle": "تم التسجيل بنجاح!",
    "register.successMessage": "تم إنشاء حسابك. سيتم توجيهك إلى صفحة تسجيل الدخول قريبًا.",
    "register.goToLogin": "الذهاب إلى تسجيل الدخول",
    "register.googleError": "فشل في بدء التسجيل باستخدام جوجل",
  },
}

// Create the language context
const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key: string) => key,
  dir: "ltr",
})

// Create a provider component
export function LanguageProvider({ children }: { children: ReactNode }) {
  // Try to get the language from localStorage, fallback to browser language or 'en'
  const [language, setLanguage] = useState<Language>("en")
  const dir = language === "ar" ? "rtl" : "ltr"

  // Handle language change
  useEffect(() => {
    // Attempt to get language preference from localStorage
    const storedLanguage = localStorage.getItem("language") as Language

    // If stored language exists and is valid, use it
    if (storedLanguage && ["en", "ar"].includes(storedLanguage)) {
      setLanguage(storedLanguage)
    } else {
      // Otherwise, detect from browser
      const browserLanguage = navigator.language.split("-")[0]
      setLanguage(browserLanguage === "ar" ? "ar" : "en")
    }
  }, [])

  // Update localStorage and document direction when language changes
  useEffect(() => {
    localStorage.setItem("language", language)

    // Set the direction attribute on the html element
    document.documentElement.setAttribute("dir", dir)
    document.documentElement.setAttribute("lang", language)

    // Force font refresh when switching to Arabic
    if (language === "ar") {
      document.documentElement.style.fontFamily = '"Tajawal", sans-serif'
    } else {
      document.documentElement.style.fontFamily = ""
    }
  }, [language, dir])

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>{children}</LanguageContext.Provider>
}

// Create a custom hook to use the language context
export function useLanguage() {
  return useContext(LanguageContext)
}
