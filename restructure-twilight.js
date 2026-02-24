'use strict';

const fs = require('fs');
const path = require('path');

const args = new Set(process.argv.slice(2));
const force = args.has('--force');
const dryRun = args.has('--dry-run');
const fileArg = process.argv.slice(2).find(arg => arg.startsWith('--file='));

const defaultFile = path.join(__dirname, 'twilight.json');
const targetFile = path.resolve(fileArg ? fileArg.slice('--file='.length) : defaultFile);

const SETTINGS_METADATA = {
    enable_dark_mode: {
        tab: 'appearance',
        group: 'theme-mode',
        info: 'Recommended when your text colors have enough contrast in both modes.'
    },
    force_dark_mode: {
        tab: 'appearance',
        group: 'theme-mode',
        info: 'Best for brands that rely on a dark visual identity.'
    },
    main_bg_color: {
        tab: 'appearance',
        group: 'colors',
        info: 'Choose a comfortable tone that keeps content readable.'
    },
    secondary_bg_color: {
        tab: 'appearance',
        group: 'colors',
        info: 'Use a subtle contrast against the main background.'
    },
    primary_brand_color: {
        tab: 'appearance',
        group: 'colors',
        info: 'This color is heavily used in interactive elements.'
    },
    primary_text_color: {
        tab: 'appearance',
        group: 'colors',
        info: 'Ensure strong contrast with the background color.'
    },
    secondary_text_color: {
        tab: 'appearance',
        group: 'colors',
        info: 'Keep it slightly softer than the primary text color.'
    },
    header_bg_color: {
        tab: 'appearance',
        group: 'colors',
        info: 'Use a color consistent with your brand style.'
    },
    squar_photo_bg_image_size: {
        tab: 'homepage',
        group: 'layout',
        info: 'Use Contain to preserve full image, or Cover to fill available space.'
    },
    vertical_fixed_products: {
        tab: 'homepage',
        group: 'layout',
        info: 'Useful when showcasing more products in vertical sections.'
    },
    is_more_button_enabled: {
        tab: 'homepage',
        group: 'layout',
        info: 'Helps users navigate quickly to full listings.'
    },
    header_is_sticky: {
        tab: 'header',
        group: 'behavior',
        info: 'Keep header visible while scrolling.'
    },
    topnav_is_dark: {
        tab: 'header',
        group: 'style',
        info: 'Use when your brand style fits a dark top bar.'
    },
    important_links: {
        tab: 'header',
        group: 'behavior',
        info: 'Show important page links in the top strip.'
    },
    footer_is_dark: {
        tab: 'footer',
        group: 'style',
        info: 'Useful when footer needs stronger visual contrast.'
    },
    sticky_add_to_cart: {
        tab: 'product',
        group: 'behavior',
        info: 'Can improve mobile add-to-cart conversion.'
    },
    show_tags: {
        tab: 'product',
        group: 'display',
        info: 'Helps visitors identify product context quickly.'
    },
    slider_background_size: {
        tab: 'product',
        group: 'gallery',
        info: 'Use Cover for full area fill, or Contain to preserve full image.'
    },
    imageZoom: {
        tab: 'product',
        group: 'gallery',
        info: 'Enable zoom interaction in product image slider.'
    }
};

const COMPONENT_METADATA = {
    'home.enhanced-slider|is_fullwidth': {
        tab: 'homepage',
        group: 'hero-slider',
        info: 'Useful for wide hero banners.'
    },
    'home.main-links|links.icon': {
        tab: 'homepage',
        group: 'quick-links',
        info: 'Example: sicon-store2 or sicon-packed-box'
    },
    'home.th-store-features|features.icon': {
        tab: 'homepage',
        group: 'store-features',
        info: 'Pick a clear icon that matches the feature meaning.'
    },
    'home.th-moving-announcement-bar|bg_color': {
        tab: 'homepage',
        group: 'announcement-bar',
        info: 'Use enough contrast with text color for readability.'
    },
    'home.th-moving-announcement-bar|text_color': {
        tab: 'homepage',
        group: 'announcement-bar',
        info: 'Ensure text remains readable on selected background.'
    },
    'home.th-faq|faq_items.Icon': {
        tab: 'homepage',
        group: 'faq',
        info: 'You can use an icon such as sicon-help-circle.'
    }
};

function hasText(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

function applyMetadata(target, metadata, useForce) {
    let changed = false;

    for (const key of ['tab', 'group', 'info']) {
        const nextValue = metadata[key];
        if (!hasText(nextValue)) {
            continue;
        }

        const currentValue = target[key];
        const shouldWrite = useForce || !hasText(currentValue);

        if (shouldWrite && currentValue !== nextValue) {
            target[key] = nextValue;
            changed = true;
        }
    }

    return changed;
}

function applySettingsMetadata(settings, useForce) {
    const result = {
        totalFields: 0,
        mappedFields: 0,
        changedFields: 0
    };

    if (!Array.isArray(settings)) {
        return result;
    }

    for (const setting of settings) {
        if (!setting || typeof setting !== 'object') {
            continue;
        }

        if (setting.type === 'static') {
            continue;
        }

        result.totalFields += 1;

        const metadata = SETTINGS_METADATA[setting.id];
        if (!metadata) {
            continue;
        }

        result.mappedFields += 1;
        if (applyMetadata(setting, metadata, useForce)) {
            result.changedFields += 1;
        }
    }

    return result;
}

function applyComponentsMetadata(components, useForce) {
    const result = {
        totalFields: 0,
        mappedFields: 0,
        changedFields: 0
    };

    function walk(node, currentComponentPath) {
        if (!node) {
            return;
        }

        if (Array.isArray(node)) {
            for (const item of node) {
                walk(item, currentComponentPath);
            }
            return;
        }

        if (typeof node !== 'object') {
            return;
        }

        let componentPath = currentComponentPath;
        if (hasText(node.path)) {
            componentPath = node.path;
        }

        const isField = hasText(node.id) && hasText(node.type);
        if (isField) {
            result.totalFields += 1;
            const key = `${componentPath || ''}|${node.id}`;
            const metadata = COMPONENT_METADATA[key];

            if (metadata) {
                result.mappedFields += 1;
                if (applyMetadata(node, metadata, useForce)) {
                    result.changedFields += 1;
                }
            }
        }

        for (const value of Object.values(node)) {
            walk(value, componentPath);
        }
    }

    walk(components, '');
    return result;
}

function createBackup(filePath, source) {
    const stamp = new Date().toISOString().replace(/[:]/g, '-').replace(/\..+/, 'Z');
    const backupPath = `${filePath}.${stamp}.backup`;
    fs.writeFileSync(backupPath, source, 'utf8');
    return backupPath;
}

function main() {
    const source = fs.readFileSync(targetFile, 'utf8');
    const twilight = JSON.parse(source);

    const settingsResult = applySettingsMetadata(twilight.settings, force);
    const componentsResult = applyComponentsMetadata(twilight.components, force);

    const totalChanged = settingsResult.changedFields + componentsResult.changedFields;

    console.log('Twilight metadata normalization report');
    console.log(`- file: ${targetFile}`);
    console.log(`- mode: ${dryRun ? 'dry-run' : 'write'}`);
    console.log(`- force: ${force ? 'true' : 'false'}`);
    console.log(`- settings: mapped ${settingsResult.mappedFields}/${settingsResult.totalFields}, changed ${settingsResult.changedFields}`);
    console.log(`- components: mapped ${componentsResult.mappedFields}/${componentsResult.totalFields}, changed ${componentsResult.changedFields}`);

    if (totalChanged === 0) {
        console.log('- status: no changes needed');
        return;
    }

    const output = JSON.stringify(twilight, null, 4);
    JSON.parse(output);

    if (dryRun) {
        console.log('- status: dry-run completed (no file written)');
        return;
    }

    const backupPath = createBackup(targetFile, source);
    fs.writeFileSync(targetFile, output, 'utf8');

    console.log(`- backup: ${backupPath}`);
    console.log('- status: file updated successfully');
}

try {
    main();
} catch (error) {
    console.error('Failed to normalize twilight metadata.');
    console.error(error && error.message ? error.message : error);
    process.exit(1);
}
