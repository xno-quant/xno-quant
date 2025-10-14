const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Brevo API configuration
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const FROM_EMAIL = process.env.NEXT_PUBLIC_BREVO_FROM_EMAIL || 'hello@xnoquant.vn';
const FROM_NAME = process.env.NEXT_PUBLIC_BREVO_FROM_NAME || 'XNO Quant';
let BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
if (BASE_URL && !/^https?:\/\//.test(BASE_URL)) {
    BASE_URL = `https://${BASE_URL}`;
}

// === Path to event info markdown file ===
const EVENT_MARKDOWN_PATH = path.join(__dirname, '..', 'content', 'events', '3-ai-ml-du-bao-bien-dong.md');

// === Configurable path to email list CSV ===
const EMAIL_LIST_CSV_PATH = path.join(__dirname, '..', 'data', 'registration-confirmation-test.csv');

// Để dùng ảnh từ markdown hoặc fallback mặc định
// const EMAIL_COVER_IMAGE = null;

// Hoặc khai báo URL ảnh tùy chỉnh 
// const EMAIL_COVER_IMAGE = 'https://example.com/your-cover-image.jpg';

// Hoặc dùng ảnh local trong project - không hoạt động
const EMAIL_COVER_IMAGE = `https://quant-events.netlify.app/images/email-cover-workshop-3-survey.jpg`;

// === Extract event info from markdown frontmatter ===
function extractFrontmatter(markdown) {
    const match = markdown.match(/^---([\s\S]*?)---/);
    if (!match) return {};
    const yaml = match[1];
    const lines = yaml.split(/\r?\n/);
    const result = {};
    lines.forEach(line => {
        // Skip lines that start with whitespace (nested properties) or comments
        if (line.trim().startsWith('#') || line.startsWith(' ') || line.startsWith('\t')) {
            return;
        }

        const idx = line.indexOf(':');
        if (idx > -1) {
            const key = line.slice(0, idx).trim();
            let value = line.slice(idx + 1).trim();

            // Only set if key doesn't exist yet (keep first occurrence)
            if (!result.hasOwnProperty(key)) {
                // Remove quotes if present
                if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                result[key] = value;
            }
        }
    });
    return result;
}

// === Easily configurable email subject templates ===
function getSubjectTemplates(eventTitle) {
    return {
        'past-attendee': `🎉 Sự kiện mới từ XNO Quant dành cho bạn: ${eventTitle}`,
        'registered-only': `⚡ Đừng bỏ lỡ Workshop lần này từ XNO Quant: ${eventTitle}`,
        'new-prospect': `🚀 Chào mừng đến với XNO Quant: ${eventTitle}`,
        'xnoquant-user': `🎉 "Sự kiện mới từ XNO Quant dành riêng cho bạn: ${eventTitle}`
    };
}

if (!BREVO_API_KEY) {
    console.error('❌ BREVO_API_KEY not found in environment variables');
    process.exit(1);
}

/**
 * Send email using Brevo API
 */
async function sendEmail(to, subject, htmlContent) {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': BREVO_API_KEY,
        },
        body: JSON.stringify({
            sender: {
                email: FROM_EMAIL,
                name: FROM_NAME,
            },
            to: [{ email: to.email, name: to.name }],
            subject: subject,
            htmlContent: htmlContent,
        }),
    });

    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Brevo API error: ${response.status} - ${errorData} `);
    }

    return await response.json();
}

/**
 * Load and process email template
 */
function loadTemplate(templateName, data) {
    const templatePath = path.join(__dirname, '..', 'public', 'template', `${templateName}.html`);

    if (!fs.existsSync(templatePath)) {
        throw new Error(`Template not found: ${templatePath} `);
    }

    let template = fs.readFileSync(templatePath, 'utf8');

    // Replace all placeholders
    const replacements = {
        ...data,
        year: new Date().getFullYear(),
        unsubscribeUrl: data.unsubscribeUrl || '#'
    };

    for (const [key, value] of Object.entries(replacements)) {
        const placeholder = `{ {${key} } } `;
        template = template.replaceAll(placeholder, value || '');
    }

    return template;
}

/**
 * Get template name based on user type
 */
function getTemplateForUserType(userType) {
    const templates = {
        'past-attendee': 'past-attendee-invite',
        'registered-only': 'registered-only-invite',
        'new-prospect': 'new-prospect-invite',
        'xnoquant-user': 'xno-user-notification',
        'registration-confirmation': 'registration-confirmation-script', // Map to the correct template file
        'other': 'other-template' // thêm nếu có template khác
    };
    return templates[userType] || 'new-prospect-invite';
}

/**
 * Parse CSV data
 */
function parseCSV(csvContent) {
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let j = 0; j < lines[i].length; j++) {
            const char = lines[i][j];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());

        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index] || '';
        });
        data.push(row);
    }

    return data;
}

/**
 * Generate event data for templates
 */
function getEventData() {
    if (!fs.existsSync(EVENT_MARKDOWN_PATH)) {
        throw new Error(`Event markdown file not found: ${EVENT_MARKDOWN_PATH} `);
    }
    const markdown = fs.readFileSync(EVENT_MARKDOWN_PATH, 'utf8');
    const fm = extractFrontmatter(markdown);

    // Use EMAIL_COVER_IMAGE first, then coverImage from markdown, then image field, or fallback to event URL path
    const baseUrl = BASE_URL || 'https://xnoquant.vn';
    const coverImage = EMAIL_COVER_IMAGE || fm.coverImage || fm.image || `${baseUrl} /images/workshop_3_email_cover.jpg`;

    // Format eventDate for Vietnamese: show time first, then day/month/year
    let eventDateRaw = fm.date || '';
    let eventDateFormatted = eventDateRaw;
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(eventDateRaw)) {
        const [datePart, timePart] = eventDateRaw.split(' ');
        const [year, month, day] = datePart.split('-');
        eventDateFormatted = `${timePart} ngày ${day} /${month}/${year} `;
    }

    return {
        eventTitle: fm.title || '',
        tagline: fm.tagline || '',
        eventDate: eventDateFormatted,
        eventTime: fm.time || '',
        eventLocation: fm.location || '',
        eventDuration: fm.duration || '',
        eventUrl: fm.url || baseUrl,
        registrationUrl: fm.registrationUrl || baseUrl,
        calendarUrl: fm.calendarUrl || 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Workshop%20AI%20%26%20ML%20XNO%20Quant',
        coverImage: coverImage
    };
}

/**
 * Generate email subject based on user type
 */
function getSubjectForUserType(userType, eventTitle) {
    const templates = getSubjectTemplates(eventTitle);
    return templates[userType] || templates['new-prospect'];
}

/**
 * Add delay between emails to respect rate limits
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main function to send marketing emails
 */
async function sendMarketingEmails() {
    console.log('🚀 Starting email marketing campaign...\n');

    // Try CSV first, then JSON

    let emailList;
    let dataSource;

    if (fs.existsSync(EMAIL_LIST_CSV_PATH)) {
        console.log('📄 Loading CSV data...');
        try {
            const csvContent = fs.readFileSync(EMAIL_LIST_CSV_PATH, 'utf8');
            emailList = parseCSV(csvContent);
            dataSource = 'CSV';
        } catch (error) {
            console.error('❌ Error parsing CSV file:', error.message);
            process.exit(1);
        }
    } else {
        // Prompt user for CSV path if not found
        const readline = require('readline-sync');
        const customPath = readline.question('❓ Không tìm thấy file email-list.csv. Vui lòng nhập đường dẫn file CSV dữ liệu: ');
        if (customPath && fs.existsSync(customPath)) {
            try {
                const csvContent = fs.readFileSync(customPath, 'utf8');
                emailList = parseCSV(csvContent);
                dataSource = 'CSV (custom path)';
            } catch (error) {
                console.error('❌ Error parsing custom CSV file:', error.message);
                process.exit(1);
            }
        } else {
            console.error('❌ Không tìm thấy file dữ liệu email. Vui lòng kiểm tra lại đường dẫn.');
            process.exit(1);
        }
    }

    if (!Array.isArray(emailList) || emailList.length === 0) {
        console.error('❌ Email list is empty or invalid format');
        process.exit(1);
    }

    console.log(`📊 Found ${emailList.length} recipients(from ${dataSource})`);

    // Group by user type for reporting
    const typeGroups = {};
    emailList.forEach(user => {
        typeGroups[user.userType] = (typeGroups[user.userType] || 0) + 1;
    });

    console.log('📈 Recipients by type:');
    Object.entries(typeGroups).forEach(([type, count]) => {
        console.log(`   ${type}: ${count} users`);
    });
    console.log('');

    const eventData = getEventData();
    const results = {
        sent: 0,
        failed: 0,
        errors: []
    };

    // Process each email
    for (let i = 0; i < emailList.length; i++) {
        const user = emailList[i];
        const progress = `[${i + 1}/${emailList.length}]`;

        try {
            console.log(`${progress} Processing: ${user.name} (${user.email}) - ${user.userType} `);

            // Validate required fields
            if (!user.email || !user.name || !user.userType) {
                throw new Error('Missing required fields: email, name, or userType');
            }

            // Get template and generate content
            const templateName = getTemplateForUserType(user.userType);
            const subject = getSubjectForUserType(user.userType, eventData.eventTitle);

            const templateData = {
                ...eventData,
                name: user.name,
                customText: user.customText || ''
            };

            const htmlContent = loadTemplate(templateName, templateData);

            // Send email
            const response = await sendEmail(
                { email: user.email, name: user.name },
                subject,
                htmlContent
            );

            console.log(`   ✅ Sent successfully(ID: ${response.messageId})`);
            results.sent++;

            // Rate limiting: wait 1 second between emails
            if (i < emailList.length - 1) {
                await delay(1000);
            }

        } catch (error) {
            console.log(`   ❌ Failed: ${error.message} `);
            results.failed++;
            results.errors.push({
                user: user.email,
                error: error.message
            });
        }
    }

    // Final report
    console.log('\n📊 Campaign Summary:');
    console.log(`✅ Successfully sent: ${results.sent} `);
    console.log(`❌ Failed: ${results.failed} `);
    console.log(`📈 Success rate: ${((results.sent / emailList.length) * 100).toFixed(1)}% `);

    if (results.errors.length > 0) {
        console.log('\n❌ Errors:');
        results.errors.forEach(error => {
            console.log(`   ${error.user}: ${error.error} `);
        });
    }

    console.log('\n🎉 Campaign completed!');
}

// Run the script
if (require.main === module) {
    sendMarketingEmails().catch(error => {
        console.error('💥 Fatal error:', error.message);
        process.exit(1);
    });
}

module.exports = { sendMarketingEmails, loadTemplate, getEventData };