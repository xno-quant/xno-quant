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

// === Configurable path to attendee list CSV ===
const ATTENDEE_LIST_CSV_PATH = path.join(__dirname, '..', 'data', 'registration-confirmation.csv');

// === Email cover image for post-event ===
const POST_EVENT_COVER_IMAGE = `https://quant-events.netlify.app/images/workshop_3_email_cover.jpg`;

// === Post-event email subject ===
const EMAIL_SUBJECT = '🎉 Cảm ơn bạn đã tham gia Workshop XNO Quant - Tài liệu & Phản hồi';

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
        throw new Error(`Brevo API error: ${response.status} - ${errorData}`);
    }

    return await response.json();
}

/**
 * Load and process post-event email template
 */
function loadPostEventTemplate(data) {
    const templatePath = path.join(__dirname, '..', 'public', 'template', 'post-event-thank-you.html');

    if (!fs.existsSync(templatePath)) {
        throw new Error(`Post-event template not found: ${templatePath}`);
    }

    let template = fs.readFileSync(templatePath, 'utf8');

    // Replace all placeholders
    const replacements = {
        ...data,
        year: new Date().getFullYear(),
        unsubscribeUrl: data.unsubscribeUrl || '#'
    };

    for (const [key, value] of Object.entries(replacements)) {
        const placeholder = `{{${key}}}`;
        template = template.replaceAll(placeholder, value || '');
    }

    return template;
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
 * Generate event data for post-event template
 */
function getEventData() {
    if (!fs.existsSync(EVENT_MARKDOWN_PATH)) {
        throw new Error(`Event markdown file not found: ${EVENT_MARKDOWN_PATH}`);
    }
    const markdown = fs.readFileSync(EVENT_MARKDOWN_PATH, 'utf8');
    const fm = extractFrontmatter(markdown);

    const baseUrl = BASE_URL || 'https://quant-events.netlify.app';

    return {
        eventTitle: fm.title || 'Workshop XNO Quant',
        tagline: fm.tagline || '',
        eventDate: fm.date || '',
        eventTime: fm.time || '',
        eventLocation: fm.location || '',
        eventUrl: `${baseUrl}/events/${fm.slug || 'ai-ml-du-bao-bien-dong'}`,
        feedbackUrl: `${baseUrl}/events/${fm.slug || 'ai-ml-du-bao-bien-dong'}#feedback-section`,
        coverImage: POST_EVENT_COVER_IMAGE || fm.coverImage || `${baseUrl}/images/workshop_3_email_cover.jpg`
    };
}

/**
 * Add delay between emails to respect rate limits
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main function to send post-event thank you emails
 */
async function sendPostEventEmails() {
    console.log('🎉 Starting post-event thank you email campaign...\n');

    // Load attendee list
    let attendeeList;
    let dataSource = 'CSV';

    if (fs.existsSync(ATTENDEE_LIST_CSV_PATH)) {
        console.log('📄 Loading attendee CSV data...');
        try {
            const csvContent = fs.readFileSync(ATTENDEE_LIST_CSV_PATH, 'utf8');
            attendeeList = parseCSV(csvContent);
        } catch (error) {
            console.error('❌ Error parsing CSV file:', error.message);
            process.exit(1);
        }
    } else {
        // Prompt user for CSV path if not found
        console.log(`❌ Attendee list not found at: ${ATTENDEE_LIST_CSV_PATH}`);
        const readline = require('readline-sync');
        const customPath = readline.question('❓ Vui lòng nhập đường dẫn file CSV danh sách người tham gia: ');
        if (customPath && fs.existsSync(customPath)) {
            try {
                const csvContent = fs.readFileSync(customPath, 'utf8');
                attendeeList = parseCSV(csvContent);
                dataSource = 'CSV (custom path)';
            } catch (error) {
                console.error('❌ Error parsing custom CSV file:', error.message);
                process.exit(1);
            }
        } else {
            console.error('❌ Không tìm thấy file dữ liệu người tham gia. Vui lòng kiểm tra lại đường dẫn.');
            process.exit(1);
        }
    }

    if (!Array.isArray(attendeeList) || attendeeList.length === 0) {
        console.error('❌ Attendee list is empty or invalid format');
        process.exit(1);
    }

    console.log(`📊 Found ${attendeeList.length} attendees (from ${dataSource})`);
    console.log(`📧 Email subject: "${EMAIL_SUBJECT}"`);
    console.log('');

    const eventData = getEventData();
    const results = {
        sent: 0,
        failed: 0,
        errors: []
    };

    console.log('🎯 Event details:');
    console.log(`   Title: ${eventData.eventTitle}`);
    console.log(`   Event URL: ${eventData.eventUrl}`);
    console.log(`   Feedback URL: ${eventData.feedbackUrl}`);
    console.log('');

    // Process each email
    for (let i = 0; i < attendeeList.length; i++) {
        const attendee = attendeeList[i];
        const progress = `[${i + 1}/${attendeeList.length}]`;

        try {
            console.log(`${progress} Processing: ${attendee.name} (${attendee.email})`);

            // Validate required fields
            if (!attendee.email || !attendee.name) {
                throw new Error('Missing required fields: email or name');
            }

            // Generate template data
            const templateData = {
                ...eventData,
                name: attendee.name
            };

            const htmlContent = loadPostEventTemplate(templateData);

            // Send email
            const response = await sendEmail(
                { email: attendee.email, name: attendee.name },
                EMAIL_SUBJECT,
                htmlContent
            );

            console.log(`   ✅ Sent successfully (ID: ${response.messageId})`);
            results.sent++;

            // Rate limiting: wait 1 second between emails
            if (i < attendeeList.length - 1) {
                await delay(1000);
            }

        } catch (error) {
            console.log(`   ❌ Failed: ${error.message}`);
            results.failed++;
            results.errors.push({
                attendee: attendee.email,
                error: error.message
            });
        }
    }

    // Final report
    console.log('\n📊 Post-Event Email Campaign Summary:');
    console.log(`✅ Successfully sent: ${results.sent}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📈 Success rate: ${((results.sent / attendeeList.length) * 100).toFixed(1)}%`);

    if (results.errors.length > 0) {
        console.log('\n❌ Errors:');
        results.errors.forEach(error => {
            console.log(`   ${error.attendee}: ${error.error}`);
        });
    }

    console.log('\n🎉 Post-event email campaign completed!');
    console.log('📈 Attendees will now have access to:');
    console.log('   - Workshop materials and videos');
    console.log('   - Feedback form to share their experience');
    console.log('   - Links to community groups');
}

// Run the script
if (require.main === module) {
    sendPostEventEmails().catch(error => {
        console.error('💥 Fatal error:', error.message);
        process.exit(1);
    });
}

module.exports = { sendPostEventEmails, loadPostEventTemplate, getEventData };