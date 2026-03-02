# تقرير مراجعة ثيم ثراء (Tharaa) — UI/UX وبنية سلة Twilight

**تاريخ المراجعة:** 2025-03-03  
**الثيم:** Tharaa (ثراء)  
**الجمهور:** عطور فاخرة، إلكترونيات، ساعات، مجوهرات — RTL/عربي

---

## (1) تقرير الأخطاء (Audit Report)

| ID | النوع | الشدة | الوصف الدقيق | مكانه | سبب اعتباره خطأ | التوصية المختصرة |
|----|--------|--------|----------------|--------|------------------|-------------------|
| A1 | Salla-Structure | Medium | التوثيق يشير إلى `theme.font.url` بينما القالب يستخدم `theme.font.path` | `src/views/layouts/master.twig:85` | تعارض مع جدول المتغيرات في نفس الملف (سطر 47) | استخدام `theme.font.url\|default(theme.font.path)\|cdn` أو التأكد من أن Twilight يوفّر `.path` عند تفعيل ميزة الخطوط |
| A2 | Salla-Structure | Low | صفحة البحث و404: لم يُعثر على قوالب مخصصة (search.twig / 404.twig) | — | معايير سلة تتطلب رسالة واضحة عند عدم نتائج البحث و404 مع خيارات متابعة | إضافة قوالب البحث و404 إن كانت سلة تسمح بذلك، أو التأكد أن الافتراضي يلبّي المتطلبات |
| B1 | UI | Blocker | تعارض ألوان: `--color-primary` مُعرّفة مرتين بقيم مختلفة في `:root` | `src/assets/styles/01-settings/global.scss:13-14` | السطر الثاني يلغي الأول؛ ألوان عشوائية (#5cd5c4 ثم #414042) وتتعارض مع قيم master.twig | حذف التعريف المكرر والاعتماد على القيم القادمة من master (أو token واحد فقط) |
| B2 | UI | High | ألوان ثابتة (Hex) في ملف global.scss لا تستخدم متغيرات الثيم | `src/assets/styles/01-settings/global.scss` | #231f1e, #2b2d34, #272628, #676668, #ff6767, #7c8082, #c6c7ce1a, #f5f7f9, #eeeeee تمنع التحكم من لوحة التحكم | استبدال كل Hex بمتغيرات CSS من نظام الثيم (--th-*) أو حذف التعريفات المتعارضة مع master |
| B3 | UI | High | هيدر ثيم: ألوان وخلفيات ثابتة (#fff, #f8f9fb, #9ca3af) بدل متغيرات | `src/assets/styles/custom/header.scss` (متعدد الأسطر) | عدم توحيد مع theme.settings (مثل header_bg_color) يكسّر تجربة التخصيص | استخدام var(--th-header-bg), var(--th-bg-secondary), var(--th-text-secondary) بدل القيم المباشرة |
| B4 | UI | Medium | قيم radius/ظلال/انتقالات مكررة بين header.scss و th-ui-system.scss | `custom/header.scss`, `custom/th-ui-system.scss` | --th-primary في header مختلف عن --th-color-primary في master؛ تشتت النظام البصري | توحيد كل القيم في ملف tokens واحد ومرجعية المكونات له |
| B5 | UI | Medium | ألوان وحدود صلبة في product card (مثل #999, #e5e7eb, #fff) | `04-components/product.scss`, `04-components/_product-card.scss` | تباين وضعف توحيد مع باقي الثيم | استبدال بـ var(--th-ui-*) أو var(--th-border-soft) |
| C1 | UX / Accessibility | High | استخدام عناصر H2/H4 لعرض الأسعار (ليس عناوين أقسام) | `src/views/pages/product/single.twig:247,254,361,368` و`partials/product/card.twig:104,109,111` | يخلّ بتسلسل العناوين (Heading hierarchy) ويؤثر على القارئات والشاشات والـ SEO | استبدال H2/H4 للأسعار بـ `<span>` أو `<p>` مع class للتمييز البصري |
| C2 | UX / Accessibility | Medium | استخدام H2 لعنوان فرعي (subtitle) في صفحة المنتج | `src/views/pages/product/single.twig:231` | الـ subtitle ليس عنوان قسم؛ يجب أن يكون H1 فقط عنوان الصفحة | استبدال `<h2 class="product-entry__sub-title">` بـ `<p>` أو `<span>` |
| C3 | UX / Accessibility | Medium | تسلسل عناوين معكوس: H2 يظهر قبل H1 في صفحة المدونة | `src/views/pages/blog/index.twig:37,58,114` | H2 (تصنيفات) ثم لاحقاً H1 (عنوان الصفحة) يخالف أفضل الممارسات | جعل عنوان الصفحة H1 في أعلى المحتوى الرئيسي، والأقسام الجانبية H2 أو إبقاء H2 للتصنيفات مع H1 واضح أولاً |
| C4 | UX / Accessibility | Medium | صفحة العلامات: عنوان الصفحة H2 وعنوان "لا علامات" H1 | `src/views/pages/brands/index.twig:19,71` | يجب أن يكون عنوان الصفحة الرئيسي H1 و"لا علامات" نصاً عادياً أو H2 | جعل `page.title` في H1 و"non_brands" في `<p>` أو H2 |
| D1 | Responsive / RTL | Medium | breakpoints غير موحدة مع Tailwind الافتراضي (480, 768, 992, 1200) | `src/assets/styles/01-settings/breakpoints.scss` | قيم مثل 400px و 480px قد تتعارض مع تصميم Tailwind (sm:640, md:768, lg:1024) | توحيد الـ breakpoints مع tailwind أو توثيق الفرق واستخدامه بشكل متسق |
| D2 | RTL | Low | استخدام rtl:/ltr: بشكل صحيح في كثير من الملفات؛ بعض الهوامش لا تزال left/right | عدة ملفات SCSS | للامتثال الكامل لـ RTL يُفضّل استخدام logical properties حيث أمكن | مراجعة الأماكن المتبقية واستخدام margin-inline/padding-inline |
| E1 | Performance / CRO | Medium | تحميل خط إضافي (Tajawal) في header.scss دون تمرير من theme | `src/assets/styles/custom/header.scss:19` | خط ثابت يزيد الطلبات وقد يتعارض مع theme.font | إزالة الخط الثابت أو ربطه بمتغير ثيم (مثلاً theme.settings.get لخط الهيدر) |
| E2 | Performance | Low | صور بدون أبعاد صريحة (width/height) في بعض القوالب تزيد CLS | عدة قوالب (مثلاً product card, cart) | معايير سلة والأداء توصي بأبعاد واضحة للصور | إضافة width/height أو aspect-ratio حيث ينطبق |
| F1 | Accessibility | High | تباين: نصوص رمادية فاتحة (text-gray-400, text-gray-500) على خلفية بيضاء قد تقل عن 4.5:1 | منتشر في القوالب والـ SCSS | Lighthouse و WCAG AA يتطلبان 4.5:1 للنص العادي | رفع درجة لون النص الثانوي أو تقليل الاستخدام للنص المهم فقط |
| F2 | Accessibility | Medium | زر القائمة (hamburger) وزر البحث على الجوال يشاركان نفس aria-label تقريباً | `src/views/components/header/header.twig:29,42` | aria-label للمenu و search يجب أن يكونا مختلفين وواضحين | تمييز aria-label لزر القائمة عن زر فتح البحث |

---

## (2) نظام التصميم المقترح (Design Tokens)

يُنصح بإنشاء ملف واحد للمتغيرات (مثلاً `src/assets/styles/01-settings/_tokens.scss`) واستيراده في `app.scss` بعد `global` وقبل المكونات، مع ترك القيم الديناميكية (من theme.settings) داخل `master.twig` فقط.

### Colors
```css
:root {
  /* من master.twig (لا تنقل — تبقى inline) */
  /* --th-color-primary, --th-bg-main, --th-bg-secondary, --th-text-primary, --th-text-secondary, --th-header-bg */

  /* ثيم ثراء — توكنز ثابتة مكملة */
  --th-border-soft: #e5e7eb;
  --th-border-focus: #1e66f5;
  --th-on-promo-tag: #111827;
  --th-promo-tag-bg: #ffffff;
  --th-state-success: #059669;
  --th-state-error: #dc2626;
  --th-state-warning: #d97706;
}
```

### Typography
```css
:root {
  --th-font-main: var(--font-main, 'DINNextLTArabic', sans-serif);
  --th-font-heading: var(--th-font-main);
  --th-text-xs: 0.75rem;
  --th-text-sm: 0.875rem;
  --th-text-base: 1rem;
  --th-text-lg: 1.125rem;
  --th-text-xl: 1.25rem;
  --th-text-2xl: 1.5rem;
  --th-text-title-size: 1.75rem;
  --th-leading-tight: 1.25;
  --th-leading-normal: 1.5;
  --th-leading-relaxed: 1.625;
}
```

### Spacing
```css
:root {
  --th-space-1: 0.25rem;
  --th-space-2: 0.5rem;
  --th-space-3: 0.75rem;
  --th-space-4: 1rem;
  --th-space-5: 1.25rem;
  --th-space-6: 1.5rem;
  --th-space-8: 2rem;
  --th-space-10: 2.5rem;
  --th-space-12: 3rem;
}
```

### Radius
```css
:root {
  --th-radius-sm: 6px;
  --th-radius-md: 10px;
  --th-radius-lg: 14px;
  --th-radius-xl: 20px;
  --th-radius-full: 9999px;
}
```

### Shadows
```css
:root {
  --th-shadow-sm: 0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -1px rgba(15, 23, 42, 0.03);
  --th-shadow-default: 0 10px 22px rgba(15, 23, 42, 0.08);
  --th-shadow-hover: 0 14px 28px rgba(15, 23, 42, 0.12);
}
```

### Transitions
```css
:root {
  --th-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --th-duration-fast: 150ms;
  --th-duration-normal: 240ms;
  --th-duration-slow: 350ms;
}
```

---

## (3) خطة إصلاح مرتبة بالأولوية

### حرجة أولاً (Blockers / High)
1. **B1** — إصلاح تعارض `--color-primary` في `global.scss`.
2. **B2** — إزالة/استبدال الألوان الثابتة في `global.scss` بمتغيرات ثيم.
3. **C1** — استبدال H2/H4 للأسعار بـ span/p في صفحة المنتج وبطاقة المنتج.
4. **B3** — ربط ألوان الهيدر بمتغيرات الثيم (header.scss).
5. **F1** — تحسين تباين النص الثانوي (مراجعة gray-400/gray-500).

### متوسطة (Medium)
6. **A1** — توحيد استخدام theme.font (path vs url).
7. **C2** — تصحيح عنوان subtitle في صفحة المنتج (إزالة H2).
8. **C3** — تسلسل العناوين في blog/index (H1 ثم H2).
9. **C4** — تسلسل العناوين في brands/index.
10. **B4/B5** — توحيد radius/ظلال وألوان البطاقات مع التوكنز.

### منخفضة وتحسينات (Low)
11. **D1** — توثيق أو توحيد breakpoints.
12. **D2** — تعميم logical properties حيث يبقى left/right.
13. **E1** — خط الهيدر (Tajawal) من ثيم أو إزالته.
14. **E2** — أبعاد الصور لتقليل CLS.
15. **F2** — تحسين aria-label لأزرار الهيدر.
16. **A2** — التحقق من قوالب البحث و404.

---

## (4) باتشات عملية (Patch Suggestions)

### Patch 1: إصلاح global.scss (B1, B2)
**الملف:** `src/assets/styles/01-settings/global.scss`

**قبل:**
```scss
:root {
  --infinte-color: #c9c9c9;
  --main-text-color: #231f1e;
  --main-text-color-dark: #2b2d34;
  --color-primary: #5cd5c4;
  --color-primary: #414042;
  --color-primary-d: #272628;
  ...
}
```

**بعد:**
```scss
// لا تعرّف --color-primary هنا؛ تأتي من master.twig
:root {
  --infinte-color: var(--th-text-secondary, #6b7280);
  --main-text-color: var(--th-text-primary, #111827);
  --main-text-color-dark: var(--th-text-primary, #111827);
  --color-primary-d: var(--color-primary-dark, currentColor);
  --color-primary-l: var(--color-primary-light, currentColor);
  --color-primary-reverse: var(--color-primary-reverse, #111827);
  --color-text: var(--th-text-secondary, #6b7280);
  --bg-gray: var(--th-bg-secondary, #f8fafc);
  --color-grey: var(--th-bg-secondary, #f5f7f9);
  --color-light-grey: var(--th-border-soft, #e5e7eb);
  --font-sm: 0.8685714286rem;
  --font-main: var(--font-main, "DINNextLTArabic");
  --mm-ocd-width: calc(100% - 51px);
}
```

**ما الذي يتغير:** إزالة التعريف المكرر لـ --color-primary وربط بقية المتغيرات بمتغيرات الثيم من master أو tokens لضمان توحيد الألوان وعدم التعارض.

---

### Patch 2: عناوين الأسعار في صفحة المنتج (C1)
**الملف:** `src/views/pages/product/single.twig`

**قبل (مثال):**
```twig
<h4 class="text-red-800 font-bold text-xl inline-block">{{product.sale_price|money}}</h4>
...
<h2 class=" font-bold text-xl inline-block"> {{product.starting_price ? product.starting_price|money : product.price|money }}</h2>
```

**بعد:**
```twig
<span class="text-red-800 font-bold text-xl inline-block">{{ product.sale_price|money }}</span>
...
<span class="font-bold text-xl inline-block">{{ product.starting_price ? product.starting_price|money : product.price|money }}</span>
```

**تطبيق مماثل** لجميع استخدامات H2/H4 للأسعار في نفس الملف (السطور 247, 254, 361, 368) ثم في `src/views/pages/partials/product/card.twig` (104, 109, 111).

**ما الذي يتغير:** تصحيح تسلسل العناوين (H1 للمنتج فقط) وتحسين إمكانية الوصول والـ SEO.

---

### Patch 3: subtitle المنتج (C2)
**الملف:** `src/views/pages/product/single.twig`

**قبل:**
```twig
<h2 class="product-entry__sub-title text-sm text-gray-500 leading-6 mb-2.5">
    {{ product.subtitle }}
</h2>
```

**بعد:**
```twig
<p class="product-entry__sub-title text-sm text-gray-500 leading-6 mb-2.5">
    {{ product.subtitle }}
</p>
```

**ما الذي يتغير:** الـ subtitle ليس عنوان قسم؛ استخدام <p> يحافظ على الهيكل الدلالي.

---

### Patch 4: ربط الهيدر بمتغيرات الثيم (B3)
**الملف:** `src/assets/styles/custom/header.scss`

**قبل (أمثلة):**
```scss
.th-header { background: #fff; }
.th-topbar { background-color: #f8f9fb; color: var(--th-text-main); }
.th-main-header { background: #fff; }
```
```scss
--salla-color-placeholder: #9ca3af;
```

**بعد:**
```scss
.th-header { background: var(--th-header-bg, #ffffff); }
.th-topbar { background-color: var(--th-bg-secondary, #f8fafb); color: var(--th-text-primary, #1a1a1a); }
.th-main-header { background: var(--th-header-bg, #ffffff); }
```
```scss
--salla-color-placeholder: var(--th-text-secondary, #6b7280);
```

**ما الذي يتغير:** الهيدر يستجيب لألوان الثيم من لوحة التحكم دون كسر hooks أو layouts.

---

### Patch 5: theme.font في master.twig (A1)
**الملف:** `src/views/layouts/master.twig`

**قبل:**
```twig
<link rel="stylesheet" href="{{ theme.font.path|cdn }}"/>
```

**بعد (آمن إذا وُجد .path أو .url):**
```twig
<link rel="stylesheet" href="{{ theme.font.path|default(theme.font.url)|cdn }}"/>
```

**ما الذي يتغير:** دعم كلا الخاصيتين إن وُجدتا في كائن theme.font وتجنب خطأ عند اختلاف الوثائق عن التنفيذ.

---

## (5) قائمة تحقق نهائية قبل رفع الثيم لمتجر ثيمات سلة

- [ ] **بنية Twilight:** وجود `src/views/layouts/master.twig` مع blocks (content, styles, scripts) و hooks (head:start, head, head:end, body:classes, body:start, body:end).
- [ ] **توحيد UI:** عدم وجود ألوان/خطوط/مسافات عشوائية؛ استخدام tokens أو متغيرات من master/twilight.
- [ ] **العناوين:** H1 واحد فقط لكل صفحة؛ تسلسل H1 → H2 → H3 دون استخدام عناوين للأسعار أو النصوص العادية.
- [ ] **المكونات:** استخدام `<salla-add-product-button>` في البطاقة وصفحة المنتج؛ `<salla-search>`, `<salla-user-menu>`, `<salla-modal>` حيث ينطبق.
- [ ] **Responsive:** اختبار 375px, 768px, 1440px دون كسر تخطيط أو قص نصوص حرجة.
- [ ] **RTL:** dir من المستند صحيح؛ استخدام rtl:/ltr: أو logical properties؛ عدم انعكاس خاطئ للعناصر الاتجاهية.
- [ ] **إمكانية الوصول:** تباين ≥ 4.5:1 للنص؛ تسميات أزرار/حقول؛ مؤشر تركيز واضح؛ عدم احتجاز التبويب في المودال.
- [ ] **الأداء:** تقليل CLS (أبعاد صور/ aspect-ratio)؛ عدم تحميل خطوط أو سكربتات غير ضرورية تتعارض مع سياسة سلة.
- [ ] **عدم تعارض CSS:** تجنب إعادة تعريف أنماط Web Components الخاصة بسلة إلا عبر المتغيرات الموثقة (مثل --salla-*).
- [ ] **صفحات سلة الإلزامية:** المنتج، التجميعة، السلة، البحث، 404، العميل — كل منها يعرض العناصر المطلوبة ورسائل مناسبة عند الخلو.

---

*تم إعداد هذا التقرير بناءً على فحص مجلد `src` (Twig، SCSS، بنية المشروع) ووثائق سلة Twilight ومعايير UI/UX والوصول.*
