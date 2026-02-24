/**
 * restructure-twilight.js
 * ========================
 * يقرأ ملف twilight.json الحالي ويعيد بناءه باستخدام هيكلية الـ tabs و groups
 * المتوافقة مع معايير سوق سلة المتقدمة.
 *
 * الاستخدام: node restructure-twilight.js
 * سيتم إنشاء ملف twilight.json.backup للحماية أولاً.
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'twilight.json');
const backupPath = path.join(__dirname, 'twilight.json.backup');

// ─── 1. قراءة وحفظ نسخة احتياطية ────────────────────────────────────────────
const raw = fs.readFileSync(filePath, 'utf8');
fs.writeFileSync(backupPath, raw, 'utf8');
console.log('✅ تم حفظ نسخة احتياطية: twilight.json.backup');

const twilight = JSON.parse(raw);
const allSettings = twilight.settings || [];

// ─── 2. تصفية الإعدادات بإزالة العناصر الثابتة الزخرفية (عناوين وفواصل) ──────
function isRealField(s) {
    if (s.type === 'static') return false;
    return true;
}

// ─── 3. بناء هيكل الـ settings الجديد بتقسيم منطقي إلى groups ────────────────
// نحافظ على الـ flat settings لكن نزيل static lines و static titles
// ونضيف عناوين groups ترشيدية (Salla يدعم هذا النمط المنظم)

const colorsAndThemeFields = allSettings.filter(s => isRealField(s) && [
    'enable_dark_mode', 'force_dark_mode',
    'main_bg_color', 'secondary_bg_color',
    'primary_brand_color', 'primary_text_color',
    'secondary_text_color', 'header_bg_color',
].includes(s.id));

const headerFields = allSettings.filter(s => isRealField(s) && [
    'header_is_sticky', 'topnav_is_dark', 'important_links',
].includes(s.id));

const homePageFields = allSettings.filter(s => isRealField(s) && [
    'squar_photo_bg_image_size', 'vertical_fixed_products', 'is_more_button_enabled',
].includes(s.id));

const footerFields = allSettings.filter(s => isRealField(s) && [
    'footer_is_dark',
].includes(s.id));

const productPageFields = allSettings.filter(s => isRealField(s) && [
    'sticky_add_to_cart', 'show_tags', 'slider_background_size', 'imageZoom',
].includes(s.id));

// جميع الإعدادات المتبقية غير المصنفة
const knownIds = new Set([
    ...colorsAndThemeFields,
    ...headerFields,
    ...homePageFields,
    ...footerFields,
    ...productPageFields,
].map(s => s.id));

const otherFields = allSettings.filter(s => isRealField(s) && !knownIds.has(s.id));

// ─── 4. بناء الهيكل الجديد بنمط الـ groups ───────────────────────────────────
// سلة تدعم static "title" و "line" لتقسيم الإعدادات في "settings"
// سنبني نفس الـ flat settings لكن بترتيب منطقي ومجموعات واضحة

function makeTitle(id, label, icon = 'sicon-format-text') {
    return { id, type: 'static', format: 'title', value: label, variant: 'h6', icon };
}

function makeLine(id) {
    return { id, type: 'static', format: 'line', label: 'Line', icon: 'sicon-minus' };
}

function addDescriptionTo(field, desc) {
    return { ...field, description: desc };
}

// إضافة وصف إرشادي للحقول التي تفتقر إليه
const enhancedColors = colorsAndThemeFields.map(f => {
    if (f.id === 'main_bg_color') return addDescriptionTo(f, 'لون خلفية الصفحة الرئيسية وجميع صفحات المتجر');
    if (f.id === 'secondary_bg_color') return addDescriptionTo(f, 'لون خلفية الأقسام والبطاقات المميزة');
    if (f.id === 'primary_text_color') return addDescriptionTo(f, 'يُطبق على جميع العناوين الكبيرة والنصوص العريضة');
    if (f.id === 'secondary_text_color') return addDescriptionTo(f, 'يُطبق على النصوص الوصفية والتفاصيل الثانوية');
    if (f.id === 'header_bg_color') return addDescriptionTo(f, 'لون خلفية الشريط التنقلي العلوي (الهيدر)');
    return f;
});

const enhancedProduct = productPageFields.map(f => {
    if (f.id === 'slider_background_size') return addDescriptionTo(f, 'اختر كيف تُعرض صور المنتج في المعرض الجانبي');
    if (f.id === 'sticky_add_to_cart') return addDescriptionTo(f, 'يُثبت زر الإضافة للسلة أسفل الشاشة في الجوال لتسهيل الشراء');
    if (f.id === 'show_tags') return addDescriptionTo(f, 'إظهار وسوم المنتج (Tags) أسفل اسم المنتج في صفحة التفاصيل');
    return f;
});

// ─── 5. تجميع الـ settings النهائية بترتيب منطقي محسّن ──────────────────────
const newSettings = [
    // ─── قسم: الألوان والمظهر ─────────────────────────────────────────────────
    makeTitle('group-colors-title', '🎨  الألوان والمظهر العام', 'sicon-format-fill'),
    ...enhancedColors,
    makeLine('group-colors-line'),

    // ─── قسم: الشريط العلوي (Header) ─────────────────────────────────────────
    makeTitle('group-header-title', '🔝  إعدادات الشريط العلوي', 'sicon-format-text'),
    ...headerFields,
    makeLine('group-header-line'),

    // ─── قسم: الصفحة الرئيسية ────────────────────────────────────────────────
    makeTitle('group-home-title', '🏠  إعدادات الصفحة الرئيسية', 'sicon-home'),
    ...homePageFields,
    makeLine('group-home-line'),

    // ─── قسم: صفحة المنتج ───────────────────────────────────────────────────
    makeTitle('group-product-title', '🛍️  إعدادات صفحة المنتج', 'sicon-shopping-cart'),
    ...enhancedProduct,
    makeLine('group-product-line'),

    // ─── قسم: الذيل (Footer) ─────────────────────────────────────────────────
    makeTitle('group-footer-title', '🔻  إعدادات أسفل الصفحة (الفوتر)', 'sicon-layout-bottom'),
    ...footerFields,

    // ─── قسم: إعدادات أخرى غير مصنفة ────────────────────────────────────────
    ...(otherFields.length ? [
        makeLine('group-other-line'),
        makeTitle('group-other-title', '⚙️  إعدادات إضافية', 'sicon-settings'),
        ...otherFields
    ] : []),
];

// ─── 6. كتابة الملف المحدّث ──────────────────────────────────────────────────
twilight.settings = newSettings;
const output = JSON.stringify(twilight, null, 4);

// التحقق من صحة الـ JSON قبل الكتابة
try {
    JSON.parse(output);
} catch (e) {
    console.error('❌ خطأ: الناتج ليس JSON صحيحاً! لم يتم تعديل الملف.', e.message);
    process.exit(1);
}

fs.writeFileSync(filePath, output, 'utf8');
console.log('');
console.log('✅ تم إعادة هيكلة twilight.json بنجاح!');
console.log('');
console.log('📋 ملخص التقسيم الجديد:');
console.log(`   🎨 الألوان والمظهر: ${enhancedColors.length} إعداد`);
console.log(`   🔝 الشريط العلوي:  ${headerFields.length} إعدادات`);
console.log(`   🏠 الصفحة الرئيسية: ${homePageFields.length} إعدادات`);
console.log(`   🛍️ صفحة المنتج:    ${enhancedProduct.length} إعدادات`);
console.log(`   🔻 الفوتر:          ${footerFields.length} إعداد`);
console.log(`   ⚙️ أخرى:            ${otherFields.length} إعداد`);
console.log('');
console.log('💾 النسخة القديمة محفوظة في: twilight.json.backup');
console.log('');
console.log('⚠️  تذكر: احذف هذا الملف (restructure-twilight.js) بعد الانتهاء!');
