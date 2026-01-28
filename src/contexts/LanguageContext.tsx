import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// English translations
const en: Record<string, string> = {
    // Header
    'header.deliverTo': 'Deliver to',
    'header.location': 'Cairo & Giza',
    'header.searchPlaceholder': 'Search products...',
    'header.all': 'All',
    'header.hello': 'Hello',
    'header.signIn': 'sign in',
    'header.accountAndLists': 'Account & Lists',
    'header.alerts': 'Alerts',
    'header.cart': 'Cart',
    'header.todaysDeals': "Today's Deals",
    'header.customerService': 'Customer Service',
    'header.registry': 'Registry',
    'header.giftCards': 'Gift Cards',
    'header.sell': 'Sell',
    'header.home': 'Home',
    'header.browseProducts': 'Browse Products',
    'header.signOut': 'Sign Out',
    'header.createAccount': 'Create Account',
    'header.departments': 'Departments',
    'header.adminDashboard': 'Admin Dashboard',
    'header.newCustomer': 'New customer?',
    'header.createNewAccount': 'Create new account',
    'header.yourAccount': 'Your Account',
    'header.yourOrders': 'Your Orders',
    'header.yourLists': 'Your Lists',

    // Categories
    'category.pcs': 'PCs',
    'category.laptops': 'Laptops',
    'category.mice': 'Mice',
    'category.keyboards': 'Keyboards',
    'category.headphones': 'Headphones',
    'category.cables': 'Cables',
    'category.mousePads': 'Mouse Pads',
    'category.hardDrives': 'Hard Drives',
    'category.books': 'Books',
    'category.fashion': 'Fashion',
    'category.homeKitchen': 'Home & Kitchen',

    // Auth
    'auth.welcomeBack': 'Welcome Back',
    'auth.signInToAccount': 'Sign in to your account',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.forgotPassword': 'Forgot password?',
    'auth.signingIn': 'Signing in...',
    'auth.newCustomer': 'New customer?',
    'auth.createAccount': 'Create account',
    'auth.emailVerified': 'Email verified! You can now sign in.',
    'auth.createYourAccount': 'Create Your Account',
    'auth.joinUs': 'Join us today',
    'auth.name': 'Name',
    'auth.confirmPassword': 'Confirm Password',
    'auth.creatingAccount': 'Creating account...',
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.signInHere': 'Sign in here',

    // Home Page
    'home.shopByCategory': 'Shop by Category',
    'home.viewAll': 'View all',
    'home.dealsOfTheDay': 'Deals of the Day',
    'home.seeAllDeals': 'See all deals',
    'home.inspiredByHistory': 'Inspired by your browsing history',
    'home.trendingInElectronics': 'Trending in Electronics',
    'home.signUpForBestExperience': 'Sign up for the best experience',
    'home.signUp': 'Sign Up',
    'home.pcAccessories': 'PC Accessories & Peripherals',
    'home.topRatedProducts': 'Top Rated Products',

    // Product
    'product.addToCart': 'Add to Cart',
    'product.buyNow': 'Buy Now',
    'product.inStock': 'In Stock',
    'product.outOfStock': 'Out of Stock',
    'product.prime': 'Prime',
    'product.freeDelivery': 'FREE Delivery',
    'product.quantity': 'Quantity',
    'product.reviews': 'reviews',
    'product.rating': 'rating',
    'product.price': 'Price',
    'product.originalPrice': 'Original Price',
    'product.savings': 'You Save',
    'product.description': 'Description',
    'product.specifications': 'Specifications',
    'product.customerReviews': 'Customer Reviews',

    // Cart
    'cart.shoppingCart': 'Shopping Cart',
    'cart.empty': 'Your cart is empty',
    'cart.subtotal': 'Subtotal',
    'cart.items': 'items',
    'cart.proceedToCheckout': 'Proceed to Checkout',
    'cart.continueShopping': 'Continue Shopping',
    'cart.remove': 'Remove',
    'cart.price': 'Price',
    'cart.qty': 'Qty',

    // Checkout
    'checkout.secureCheckout': 'Secure Checkout',
    'checkout.checkout': 'Checkout',
    'checkout.shippingAddress': 'Shipping address',
    'checkout.paymentMethod': 'Payment method',
    'checkout.reviewOrder': 'Review items and shipping',
    'checkout.fullName': 'Full Name',
    'checkout.address': 'Address',
    'checkout.city': 'City',
    'checkout.state': 'State',
    'checkout.zipCode': 'ZIP Code',
    'checkout.phone': 'Phone Number',
    'checkout.continueToPayment': 'Continue to payment',
    'checkout.change': 'Change',
    'checkout.creditCard': 'Credit or debit card',
    'checkout.paypal': 'PayPal',
    'checkout.giftCard': 'Gift Card',
    'checkout.cardNumber': 'Card number',
    'checkout.nameOnCard': 'Name on card',
    'checkout.expirationDate': 'Expiration date',
    'checkout.securityCode': 'Security code',
    'checkout.continue': 'Continue',
    'checkout.shippingSpeed': 'Choose your shipping speed:',
    'checkout.freeDelivery': 'FREE Delivery',
    'checkout.standardDelivery': 'Standard Delivery',
    'checkout.expressDelivery': 'Express Delivery',
    'checkout.arrives': 'Arrives',
    'checkout.tomorrow': 'Tomorrow',
    'checkout.itemsInOrder': 'Items in your order:',
    'checkout.placeOrder': 'Place your order',
    'checkout.orderSummary': 'Order Summary',
    'checkout.shippingHandling': 'Shipping & handling',
    'checkout.estimatedTax': 'Estimated tax',
    'checkout.orderTotal': 'Order total',
    'checkout.free': 'FREE',
    'checkout.agreeTerms': 'By placing your order, you agree to our privacy notice and conditions of use.',

    // Order Confirmation
    'confirmation.orderPlaced': 'Order Placed Successfully!',
    'confirmation.thankYou': 'Thank you for your order!',
    'confirmation.emailConfirmation': 'You will receive an email confirmation shortly.',
    'confirmation.orderDetails': 'Order Details',
    'confirmation.orderNumber': 'Order Number',
    'confirmation.orderDate': 'Order Date',
    'confirmation.estimatedDelivery': 'Estimated Delivery',
    'confirmation.viewOrders': 'View Orders',

    // Footer
    'footer.getToKnowUs': 'Get to Know Us',
    'footer.aboutUs': 'About Us',
    'footer.careers': 'Careers',
    'footer.pressReleases': 'Press Releases',
    'footer.makeMoneyWithUs': 'Make Money with Us',
    'footer.sellOnShop': 'Sell on Shop',
    'footer.becomeAffiliate': 'Become an Affiliate',
    'footer.advertiseProducts': 'Advertise Your Products',
    'footer.paymentProducts': 'Payment Products',
    'footer.shopCard': 'Shop Card',
    'footer.currencyConverter': 'Shop Currency Converter',
    'footer.letUsHelpYou': 'Let Us Help You',
    'footer.returnsCenter': 'Returns Center',
    'footer.help': 'Help',
    'footer.copyright': '© 2026 Shop.com, Inc. or its affiliates',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.apply': 'Apply',
    'common.clear': 'Clear',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.close': 'Close',
    'common.submit': 'Submit',
    'common.signInRequired': 'Please sign in to continue checkout',

    // Customer Service
    'customerService.title': 'Customer Service',
    'customerService.howCanWeHelp': 'How can we help you?',

    // Gift Cards
    'giftCards.title': 'Gift Cards',
    'giftCards.subtitle': 'Give the perfect gift',

    // Registry
    'registry.title': 'Registry',
    'registry.subtitle': 'Create and manage your registries',

    // Sell
    'sell.title': 'Sell on Shop',
    'sell.subtitle': 'Start selling your products today',

    // Orders
    'orders.title': 'Your Orders',
    'orders.noOrders': 'You have no orders yet',

    // Account
    'account.title': 'Your Account',
    'account.settings': 'Account Settings',

    // Lists
    'lists.title': 'Your Lists',
    'lists.noLists': 'You have no lists yet',
    'lists.createList': 'Create a List',
};

// Arabic translations
const ar: Record<string, string> = {
    // Header
    'header.deliverTo': 'التوصيل إلى',
    'header.location': 'القاهرة والجيزة',
    'header.searchPlaceholder': 'ابحث عن المنتجات...',
    'header.all': 'الكل',
    'header.hello': 'مرحباً',
    'header.signIn': 'تسجيل الدخول',
    'header.accountAndLists': 'الحساب والقوائم',
    'header.alerts': 'التنبيهات',
    'header.cart': 'السلة',
    'header.todaysDeals': 'عروض اليوم',
    'header.customerService': 'خدمة العملاء',
    'header.registry': 'السجل',
    'header.giftCards': 'بطاقات الهدايا',
    'header.sell': 'بيع',
    'header.home': 'الرئيسية',
    'header.browseProducts': 'تصفح المنتجات',
    'header.signOut': 'تسجيل الخروج',
    'header.createAccount': 'إنشاء حساب',
    'header.departments': 'الأقسام',
    'header.adminDashboard': 'لوحة التحكم',
    'header.newCustomer': 'عميل جديد؟',
    'header.createNewAccount': 'إنشاء حساب جديد',
    'header.yourAccount': 'حسابك',
    'header.yourOrders': 'طلباتك',
    'header.yourLists': 'قوائمك',

    // Categories
    'category.pcs': 'أجهزة الكمبيوتر',
    'category.laptops': 'أجهزة اللابتوب',
    'category.mice': 'الفأرات',
    'category.keyboards': 'لوحات المفاتيح',
    'category.headphones': 'سماعات الرأس',
    'category.cables': 'الكابلات',
    'category.mousePads': 'وسائد الماوس',
    'category.hardDrives': 'الأقراص الصلبة',
    'category.books': 'الكتب',
    'category.fashion': 'الموضة',
    'category.homeKitchen': 'المنزل والمطبخ',

    // Auth
    'auth.welcomeBack': 'مرحباً بعودتك',
    'auth.signInToAccount': 'تسجيل الدخول إلى حسابك',
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.forgotPassword': 'نسيت كلمة المرور؟',
    'auth.signingIn': 'جاري تسجيل الدخول...',
    'auth.newCustomer': 'عميل جديد؟',
    'auth.createAccount': 'إنشاء حساب',
    'auth.emailVerified': 'تم التحقق من البريد الإلكتروني! يمكنك الآن تسجيل الدخول.',
    'auth.createYourAccount': 'إنشاء حسابك',
    'auth.joinUs': 'انضم إلينا اليوم',
    'auth.name': 'الاسم',
    'auth.confirmPassword': 'تأكيد كلمة المرور',
    'auth.creatingAccount': 'جاري إنشاء الحساب...',
    'auth.alreadyHaveAccount': 'لديك حساب بالفعل؟',
    'auth.signInHere': 'تسجيل الدخول هنا',

    // Home Page
    'home.shopByCategory': 'تسوق حسب الفئة',
    'home.viewAll': 'عرض الكل',
    'home.dealsOfTheDay': 'عروض اليوم',
    'home.seeAllDeals': 'عرض جميع العروض',
    'home.inspiredByHistory': 'مستوحى من سجل تصفحك',
    'home.trendingInElectronics': 'الأكثر رواجاً في الإلكترونيات',
    'home.signUpForBestExperience': 'سجل للحصول على أفضل تجربة',
    'home.signUp': 'سجل الآن',
    'home.pcAccessories': 'إكسسوارات الكمبيوتر والملحقات',
    'home.topRatedProducts': 'المنتجات الأعلى تقييماً',

    // Product
    'product.addToCart': 'أضف إلى السلة',
    'product.buyNow': 'اشتري الآن',
    'product.inStock': 'متوفر',
    'product.outOfStock': 'غير متوفر',
    'product.prime': 'برايم',
    'product.freeDelivery': 'توصيل مجاني',
    'product.quantity': 'الكمية',
    'product.reviews': 'تقييمات',
    'product.rating': 'تقييم',
    'product.price': 'السعر',
    'product.originalPrice': 'السعر الأصلي',
    'product.savings': 'وفرت',
    'product.description': 'الوصف',
    'product.specifications': 'المواصفات',
    'product.customerReviews': 'تقييمات العملاء',

    // Cart
    'cart.shoppingCart': 'سلة التسوق',
    'cart.empty': 'سلة التسوق فارغة',
    'cart.subtotal': 'المجموع الفرعي',
    'cart.items': 'منتجات',
    'cart.proceedToCheckout': 'متابعة الدفع',
    'cart.continueShopping': 'متابعة التسوق',
    'cart.remove': 'إزالة',
    'cart.price': 'السعر',
    'cart.qty': 'الكمية',

    // Checkout
    'checkout.secureCheckout': 'الدفع الآمن',
    'checkout.checkout': 'الدفع',
    'checkout.shippingAddress': 'عنوان الشحن',
    'checkout.paymentMethod': 'طريقة الدفع',
    'checkout.reviewOrder': 'مراجعة المنتجات والشحن',
    'checkout.fullName': 'الاسم الكامل',
    'checkout.address': 'العنوان',
    'checkout.city': 'المدينة',
    'checkout.state': 'المحافظة',
    'checkout.zipCode': 'الرمز البريدي',
    'checkout.phone': 'رقم الهاتف',
    'checkout.continueToPayment': 'متابعة للدفع',
    'checkout.change': 'تغيير',
    'checkout.creditCard': 'بطاقة ائتمان أو خصم',
    'checkout.paypal': 'باي بال',
    'checkout.giftCard': 'بطاقة هدايا',
    'checkout.cardNumber': 'رقم البطاقة',
    'checkout.nameOnCard': 'الاسم على البطاقة',
    'checkout.expirationDate': 'تاريخ الانتهاء',
    'checkout.securityCode': 'رمز الأمان',
    'checkout.continue': 'متابعة',
    'checkout.shippingSpeed': 'اختر سرعة الشحن:',
    'checkout.freeDelivery': 'توصيل مجاني',
    'checkout.standardDelivery': 'توصيل عادي',
    'checkout.expressDelivery': 'توصيل سريع',
    'checkout.arrives': 'يصل',
    'checkout.tomorrow': 'غداً',
    'checkout.itemsInOrder': 'المنتجات في طلبك:',
    'checkout.placeOrder': 'تأكيد الطلب',
    'checkout.orderSummary': 'ملخص الطلب',
    'checkout.shippingHandling': 'الشحن والتوصيل',
    'checkout.estimatedTax': 'الضريبة المقدرة',
    'checkout.orderTotal': 'إجمالي الطلب',
    'checkout.free': 'مجاني',
    'checkout.agreeTerms': 'بتأكيد طلبك، فإنك توافق على سياسة الخصوصية وشروط الاستخدام.',

    // Order Confirmation
    'confirmation.orderPlaced': 'تم تأكيد الطلب بنجاح!',
    'confirmation.thankYou': 'شكراً لطلبك!',
    'confirmation.emailConfirmation': 'ستتلقى تأكيداً بالبريد الإلكتروني قريباً.',
    'confirmation.orderDetails': 'تفاصيل الطلب',
    'confirmation.orderNumber': 'رقم الطلب',
    'confirmation.orderDate': 'تاريخ الطلب',
    'confirmation.estimatedDelivery': 'التوصيل المتوقع',
    'confirmation.viewOrders': 'عرض الطلبات',

    // Footer
    'footer.getToKnowUs': 'تعرف علينا',
    'footer.aboutUs': 'من نحن',
    'footer.careers': 'الوظائف',
    'footer.pressReleases': 'البيانات الصحفية',
    'footer.makeMoneyWithUs': 'اربح معنا',
    'footer.sellOnShop': 'بيع على المتجر',
    'footer.becomeAffiliate': 'كن شريكاً',
    'footer.advertiseProducts': 'أعلن عن منتجاتك',
    'footer.paymentProducts': 'منتجات الدفع',
    'footer.shopCard': 'بطاقة المتجر',
    'footer.currencyConverter': 'محول العملات',
    'footer.letUsHelpYou': 'دعنا نساعدك',
    'footer.returnsCenter': 'مركز الإرجاع',
    'footer.help': 'المساعدة',
    'footer.copyright': '© 2026 Shop.com، جميع الحقوق محفوظة',

    // Common
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ',
    'common.success': 'نجاح',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.sort': 'ترتيب',
    'common.apply': 'تطبيق',
    'common.clear': 'مسح',
    'common.yes': 'نعم',
    'common.no': 'لا',
    'common.back': 'رجوع',
    'common.next': 'التالي',
    'common.previous': 'السابق',
    'common.close': 'إغلاق',
    'common.submit': 'إرسال',
    'common.signInRequired': 'يرجى تسجيل الدخول لمتابعة الدفع',

    // Customer Service
    'customerService.title': 'خدمة العملاء',
    'customerService.howCanWeHelp': 'كيف يمكننا مساعدتك؟',

    // Gift Cards
    'giftCards.title': 'بطاقات الهدايا',
    'giftCards.subtitle': 'قدم الهدية المثالية',

    // Registry
    'registry.title': 'السجل',
    'registry.subtitle': 'إنشاء وإدارة سجلاتك',

    // Sell
    'sell.title': 'بيع على المتجر',
    'sell.subtitle': 'ابدأ ببيع منتجاتك اليوم',

    // Orders
    'orders.title': 'طلباتك',
    'orders.noOrders': 'لا توجد طلبات بعد',

    // Account
    'account.title': 'حسابك',
    'account.settings': 'إعدادات الحساب',

    // Lists
    'lists.title': 'قوائمك',
    'lists.noLists': 'لا توجد قوائم بعد',
    'lists.createList': 'إنشاء قائمة',
};

const translations: Record<Language, Record<string, string>> = { en, ar };

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>(() => {
        const saved = localStorage.getItem('language');
        return (saved === 'ar' || saved === 'en') ? saved : 'en';
    });

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
    };

    const t = (key: string): string => {
        return translations[language][key] || key;
    };

    const isRTL = language === 'ar';

    // Apply RTL direction to document
    useEffect(() => {
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
    }, [isRTL, language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
