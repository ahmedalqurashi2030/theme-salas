'use strict';

/**
 * restructure-twilight.js
 * ========================
 * يُعيد ترتيب مصفوفة settings في twilight.json
 * بإضافة عناوين مجموعات (static title) وفواصل (static line) 
 * وهي الطريقة الرسمية المدعومة من سلة لتنظيم الإعدادات.
 *
 * الاستخدام:
 *   node restructure-twilight.js            (تطبيق التغييرات)
 *   node restructure-twilight.js --dry-run  (معاينة فقط، لا يكتب)
 *
 * ينشئ نسخة احتياطية: twilight.json.backup تلقائياً قبل التعديل
 */

const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');
const FILE_PATH = path.join(__dirname, 'twilight.json');
const BACKUP = path.join(__dirname, 'twilight.json.backup');

// ─── أدوات مساعدة ───────────────────────────────────────────────────────────

function makeTitle(id, label, icon = 'sicon-format-text') {
    return { id, type: 'static', format: 'title', value: label, variant: 'h6', icon };
}

function makeLine(id) {
    return { id, type: 'static', format: 'line', label: 'Line', icon: 'sicon-minus' };
}

function addDesc(field, desc) {
    if (desc && (!field.description || field.description === null)) {
        return { ...field, description: desc };
    }
    return field;
}

// ─── قراءة الملف ─────────────────────────────────────────────────────────────

const raw = fs.readFileSync(FILE_PATH, 'utf8');
const twilight = JSON.parse(raw);
const all = twilight.settings || [];

// ─── تصفية الحقول الحقيقية فقط (بدون عناصر static) ─────────────────────────

function isRealField(s) {
    return s && s.type !== 'static';
}

// ─── جلب حقل بـ id مع الاحتفاظ بجميع خصائصه الأصلية ────────────────────────

function field(id) {
    const f = all.find(s => s.id === id);
    if (!f) { console.warn(`  ⚠️  لم يُعثر على الحقل: ${id}`); }
    return f || null;
}

// ─── تعريف مجموعات الإعدادات ────────────────────────────────────────────────

const GROUPS = {
    colors: [
        addDesc(field('enable_dark_mode'), 'Enable switching between light and dark modes for visitors.'),
        addDesc(field('force_dark_mode'), 'Force dark mode as the default storefront appearance.'),
        addDesc(field('main_bg_color'), 'Global background color for storefront pages.'),
        addDesc(field('secondary_bg_color'), 'Background color used in sections and card blocks.'),
        addDesc(field('primary_brand_color'), 'Used in buttons, links, and key interactive elements.'),
        addDesc(field('primary_text_color'), 'Applied to all headings and bold text in the store.'),
        addDesc(field('secondary_text_color'), 'Applied to description text and secondary content.'),
        addDesc(field('header_bg_color'), 'Top navigation bar background color.'),
    ],
    header: [
        addDesc(field('header_is_sticky'), 'يُنصح بإلغاء التفعيل عند وجود كثير من بنود القائمة المنسدلة.'),
        addDesc(field('topnav_is_dark'), 'فعّل عندما يتطلب تصميم متجرك شريطاً علوياً داكن اللون.'),
        addDesc(field('important_links'), 'عرض روابط المدونة والصفحات التعريفية في الشريط العلوي.'),
    ],
    homepage: [
        addDesc(field('squar_photo_bg_image_size'), 'Contain: عرض الصورة كاملة — Cover: ملء المساحة بالكامل.'),
        addDesc(field('vertical_fixed_products'), 'مفيد عند عرض قائمة منتجات ثابتة بتخطيط عمودي.'),
        addDesc(field('is_more_button_enabled'), 'يتيح للزوار الانتقال السريع لعرض جميع المنتجات.'),
    ],
    product: [
        addDesc(field('sticky_add_to_cart'), 'تحسين تجربة الشراء على الجوال بتثبيت زر الإضافة للسلة.'),
        addDesc(field('show_tags'), 'إظهار وسوم المنتج (Tags) في صفحة تفاصيل المنتج.'),
        addDesc(field('slider_background_size'), 'Contain: الصورة كاملة — Cover: تغطية مساحة السليدر.'),
        addDesc(field('imageZoom'), 'يتيح تكبير صور المنتج عند تمرير مؤشر الفأرة عليها.'),
    ],
    footer: [
        addDesc(field('footer_is_dark'), 'فعّل لعرض الفوتر بخلفية داكنة مناسبة للهويات البصرية القوية.'),
    ],
};

// ─── جميع الحقول التي لم تُصنَّف تذهب إلى آخر القائمة ──────────────────────

const allGroupedIds = new Set(
    Object.values(GROUPS).flat().filter(Boolean).map(f => f.id)
);

const uncategorized = all.filter(s => isRealField(s) && !allGroupedIds.has(s.id));

// ─── بناء مصفوفة الإعدادات الجديدة ─────────────────────────────────────────

const newSettings = [
    // ── 🎨 الألوان والمظهر ──────────────────────────────────────────────────
    makeTitle('g-colors-title', '🎨  الألوان والمظهر العام', 'sicon-format-fill'),
    ...GROUPS.colors.filter(Boolean),
    makeLine('g-colors-line'),

    // ── 🔝 الشريط العلوي (Header) ───────────────────────────────────────────
    makeTitle('g-header-title', '🔝  إعدادات الشريط العلوي', 'sicon-grid-4'),
    ...GROUPS.header.filter(Boolean),
    makeLine('g-header-line'),

    // ── 🏠 الصفحة الرئيسية ──────────────────────────────────────────────────
    makeTitle('g-home-title', '🏠  إعدادات الصفحة الرئيسية', 'sicon-home'),
    ...GROUPS.homepage.filter(Boolean),
    makeLine('g-home-line'),

    // ── 🛍️ صفحة المنتج ──────────────────────────────────────────────────────
    makeTitle('g-product-title', '🛍️  إعدادات صفحة المنتج', 'sicon-shopping-cart'),
    ...GROUPS.product.filter(Boolean),
    makeLine('g-product-line'),

    // ── 🔻 الفوتر ────────────────────────────────────────────────────────────
    makeTitle('g-footer-title', '🔻  إعدادات أسفل الصفحة (الفوتر)', 'sicon-layout-1'),
    ...GROUPS.footer.filter(Boolean),

    // ── ⚙️ إعدادات أخرى ──────────────────────────────────────────────────────
    ...(uncategorized.length > 0 ? [
        makeLine('g-other-line'),
        makeTitle('g-other-title', '⚙️  إعدادات عامة أخرى', 'sicon-settings'),
        ...uncategorized,
    ] : []),
];

// ─── التحقق من الناتج ────────────────────────────────────────────────────────

const allNewFieldCount = newSettings.filter(isRealField).length;
const originalFieldCount = all.filter(isRealField).length;

console.log('');
console.log('📋 تقرير إعادة الهيكلة:');
console.log(`   الحقول الأصلية:  ${originalFieldCount}`);
console.log(`   الحقول الجديدة: ${allNewFieldCount}`);

if (allNewFieldCount < originalFieldCount) {
    const missing = all
        .filter(s => isRealField(s) && !newSettings.find(n => n.id === s.id))
        .map(s => s.id);
    console.warn(`   ⚠️ حقول لم تُضف للقائمة الجديدة (${missing.length}): ${missing.join(', ')}`);
}

// ─── كتابة الملف ─────────────────────────────────────────────────────────────

twilight.settings = newSettings;
const output = JSON.stringify(twilight, null, 4);

// التحقق النهائي من صحة الـ JSON
JSON.parse(output);

if (DRY_RUN) {
    console.log('');
    console.log('🔍 وضع المعاينة (Dry Run) — لم يتم كتابة أي تغييرات.');
    console.log('   لتطبيق التغييرات: node restructure-twilight.js');
} else {
    fs.writeFileSync(BACKUP, raw, 'utf8');
    fs.writeFileSync(FILE_PATH, output, 'utf8');
    console.log('');
    console.log('✅  تمت إعادة الهيكلة بنجاح!');
    console.log(`💾  النسخة الاحتياطية: twilight.json.backup`);
    console.log('');
    console.log('   📂 مجموعات الإعدادات الجديدة:');
    console.log(`      🎨 الألوان والمظهر:   ${GROUPS.colors.filter(Boolean).length} إعدادات`);
    console.log(`      🔝 الشريط العلوي:     ${GROUPS.header.filter(Boolean).length} إعدادات`);
    console.log(`      🏠 الصفحة الرئيسية:  ${GROUPS.homepage.filter(Boolean).length} إعدادات`);
    console.log(`      🛍️ صفحة المنتج:       ${GROUPS.product.filter(Boolean).length} إعدادات`);
    console.log(`      🔻 الفوتر:            ${GROUPS.footer.filter(Boolean).length} إعداد`);
    console.log(`      ⚙️ أخرى غير مصنفة:   ${uncategorized.length} إعدادات`);
    console.log('');
    console.log('⚠️  يمكنك حذف هذا الملف بعد التأكد من النتيجة.');
}
