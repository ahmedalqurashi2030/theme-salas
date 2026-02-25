const fs = require('fs');

const twilightPath = './twilight.json';
const twilightData = JSON.parse(fs.readFileSync(twilightPath, 'utf8'));

const newSettings = [
    {
        "id": "g-product-card-title",
        "type": "static",
        "format": "title",
        "value": "إعدادات بطاقة المنتج (الشبكة والسلايدر)",
        "variant": "h6",
        "icon": "sicon-box-board",
        "tab": "product",
        "group": "card_design"
    },
    {
        "id": "card_primary_icons",
        "type": "boolean",
        "format": "switch",
        "label": "تلوين الأزرار الدائرية (كالإضافة للسلة والمفضلة) باللون الأساسي للمتجر",
        "icon": "sicon-palette",
        "value": true,
        "selected": false,
        "required": false,
        "tab": "product",
        "group": "card_design"
    },
    {
        "id": "card_rounded_corners",
        "type": "boolean",
        "format": "switch",
        "label": "تفعيل الحواف الدائرية لبطاقات المنتجات",
        "icon": "sicon-border-radius",
        "value": true,
        "selected": false,
        "required": false,
        "tab": "product",
        "group": "card_design"
    },
    {
        "id": "card_show_discount_badge",
        "type": "boolean",
        "format": "switch",
        "label": "عرض نسبة الخصم على المنتجات الخاضعة للتخفيض",
        "icon": "sicon-discount",
        "value": true,
        "selected": false,
        "required": false,
        "tab": "product",
        "group": "card_design"
    },
    {
        "id": "card_show_rating",
        "type": "boolean",
        "format": "switch",
        "label": "عرض التقييم على بطاقات المنتجات الثابتة والمتحركة",
        "icon": "sicon-star",
        "value": true,
        "selected": false,
        "required": false,
        "tab": "product",
        "group": "card_design"
    },
    {
        "id": "add_to_cart_style",
        "type": "items",
        "format": "dropdown-list",
        "label": "نمط عرض زر إضافة للسلة",
        "description": "شكل الزر داخل بطاقة المنتج",
        "icon": "sicon-shopping-cart",
        "selected": [
            {
                "label": "أيقونة السلة المفرغة (الشكل الافتراضي البسيط)",
                "value": "icon_only"
            }
        ],
        "options": [
            {
                "label": "أيقونة السلة المفرغة (الشكل الافتراضي البسيط)",
                "value": "icon_only"
            },
            {
                "label": "أيقونة مع نص (إضافة للسلة) مدمج",
                "value": "icon_text"
            }
        ],
        "source": "Manual",
        "required": true,
        "tab": "product",
        "group": "card_design"
    },
    {
        "id": "desktop_products_per_row",
        "type": "items",
        "format": "dropdown-list",
        "label": "عدد المنتجات في الصف الواحد (للكمبيوتر فقط)",
        "description": "يتم تطبيقه على قسم المنتجات الثابتة وصفحات التصنيفات",
        "icon": "sicon-grid-4",
        "selected": [
            {
                "label": "4 منتجات",
                "value": "4"
            }
        ],
        "options": [
            { "label": "منتجين (2)", "value": "2" },
            { "label": "3 منتجات", "value": "3" },
            { "label": "4 منتجات (الافتراضي)", "value": "4" },
            { "label": "5 منتجات", "value": "5" },
            { "label": "6 منتجات", "value": "6" },
            { "label": "7 منتجات", "value": "7" },
            { "label": "8 منتجات", "value": "8" }
        ],
        "source": "Manual",
        "required": true,
        "tab": "product",
        "group": "card_design"
    }
];

// Ensure we don't add them twice
const existingSettingIndex = twilightData.settings.findIndex(s => s.id === 'g-product-card-title');
if (existingSettingIndex !== -1) {
    console.log("Settings already injected.");
} else {
    // Insert them at the end of the product tab
    // Find last setting in Tab 'product'
    let lastProductIndex = -1;
    for (let i = 0; i < twilightData.settings.length; i++) {
        if (twilightData.settings[i].tab === 'product') {
            lastProductIndex = i;
        }
    }

    if (lastProductIndex !== -1) {
        twilightData.settings.splice(lastProductIndex + 1, 0, ...newSettings);
        fs.writeFileSync(twilightPath, JSON.stringify(twilightData, null, 4));
        console.log("Successfully injected new product card settings to twilight.json");
    } else {
        console.error("Could not find product tab in settings array.");
    }
}
