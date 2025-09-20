// Global variables
let currentFontSize = 'normal';
let noticesData = [];
let faqData = [];
let currentLanguage = 'en';
let gaConsentGiven = false;
let crossPageIndex = null;
let modalBackdrop = null;
let modalDialog = null;


// (Fixed: removed broken DOMContentLoaded handler, now handled below)
// (Fixed: removed broken DOMContentLoaded handler, now handled below)

// Accessibility Functions
function skipToContent() {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.focus();
        mainContent.scrollIntoView({ behavior: 'smooth' });
    }
}

function changeFontSize(size) {
    const body = document.body;
    
    // Remove existing font size classes
    body.classList.remove('font-small', 'font-normal', 'font-large');
    
    // Add new font size class
    body.classList.add(`font-${size}`);
    
    // Update current font size
    currentFontSize = size;
    
    // Store preference in localStorage
    localStorage.setItem('fontSize', size);
    
    // Update button states
    updateFontButtons();
}

function updateFontButtons() {
    const buttons = document.querySelectorAll('.font-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (
            (btn.textContent === 'A-' && currentFontSize === 'small') ||
            (btn.textContent === 'A' && currentFontSize === 'normal') ||
            (btn.textContent === 'A+' && currentFontSize === 'large')
        ) {
            btn.classList.add('active');
        }
    });
}

// Load saved font size preference
function loadFontSize() {
    const savedSize = localStorage.getItem('fontSize');
    if (savedSize) {
        changeFontSize(savedSize);
    }
}

// Translation Functions
async function translatePage(targetLanguage) {
    if (targetLanguage === 'en') {
        // If English is selected, reload the page to show original content
        location.reload();
        return;
    }
    
    try {
        // Get all text elements that should be translated
        const elementsToTranslate = document.querySelectorAll(
            'h1, h2, h3, h4, h5, h6, p, li, button:not(.font-btn), .btn, label, .notice-title, .notice-excerpt, .faq-question h3'
        );
        
        // Show loading indicator
        showTranslationLoading(true);
        
        const translations = [];
        
        for (let element of elementsToTranslate) {
            const originalText = element.textContent.trim();
            if (originalText && originalText.length > 0) {
                // Skip if text contains only symbols or numbers
                if (/^[0-9\s\-\+\(\)\[\]{}.,;:!?@#$%^&*"'`~]+$/.test(originalText)) {
                    continue;
                }
                
                try {
                    const translatedText = await translateText(originalText, targetLanguage);
                    if (translatedText && translatedText !== originalText) {
                        element.textContent = translatedText;
                    }
                } catch (error) {
                    console.log('Translation skipped for:', originalText.substring(0, 50));
                }
            }
            
            // Add small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Hide loading indicator
        showTranslationLoading(false);
        
        // Show success message
        showTranslationMessage('Page translated successfully!', 'success');
        
    } catch (error) {
        console.error('Translation error:', error);
        showTranslationMessage('Translation service temporarily unavailable. Please try again later.', 'error');
        showTranslationLoading(false);
    }
}

async function translateText(text, targetLang) {
    // Since we can't use external APIs in this environment, we'll simulate translation
    // In a real implementation, you would integrate with Google Translate API
    
    // For demonstration, we'll return a simulated translation for Hindi
    if (targetLang === 'hi') {
        const commonTranslations = {
            'Home': 'होम',
            'About': 'के बारे में',
            'Contact Us': 'संपर्क करें',
            'Search': 'खोजें',
            'DBT Aadhaar Seeding Awareness Portal': 'डीबीटी आधार सीडिंग जागरूकता पोर्टल',
            'Department of Social Justice & Empowerment': 'सामाजिक न्याय और अधिकारिता विभाग',
            'Government of India': 'भारत सरकार',
            'Notices & Circulars': 'सूचनाएं और परिपत्र',
            'FAQ': 'अक्सर पूछे जाने वाले प्रश्न',
            'Aadhaar Seeding Guide': 'आधार सीडिंग गाइड'
        };
        
        return commonTranslations[text] || text;
    }
    
    // For other languages, return original text for now
    return text;
}

function showTranslationLoading(show) {
    let loader = document.getElementById('translationLoader');
    if (show) {
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'translationLoader';
            loader.innerHTML = '<div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.8); color: white; padding: 20px; border-radius: 8px; z-index: 10000;">Translating page...</div>';
            document.body.appendChild(loader);
        }
        loader.style.display = 'block';
    } else {
        if (loader) {
            loader.style.display = 'none';
        }
    }
}

function showTranslationMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 6px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        background-color: ${type === 'success' ? '#059669' : '#dc2626'};
    `;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Search Functions
function handleSearch(event) {
    if (event.key === 'Enter') {
        performSearch();
    }
}

function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    
    if (!searchTerm) {
        return;
    }
    
    // Search logic based on current page
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    
    switch (currentPage) {
        case 'notices':
            searchNotices(searchTerm);
            break;
        case 'faq':
            searchFAQs(searchTerm);
            break;
        default:
            // General search - highlight matching text
            generalSearch(searchTerm);
            break;
    }
}

function generalSearch(searchTerm) {
    // Remove previous highlights
    removeHighlights();
    
    if (!searchTerm) return;
    
    // Find and highlight matching text
    const walker = document.createTreeWalker(
        document.getElementById('main-content'),
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    const textNodes = [];
    let node;
    
    while (node = walker.nextNode()) {
        textNodes.push(node);
    }
    
    let matchCount = 0;
    textNodes.forEach(textNode => {
        const text = textNode.textContent;
        const regex = new RegExp(searchTerm, 'gi');
        
        if (regex.test(text)) {
            const highlightedText = text.replace(regex, match => `<mark class="search-highlight">${match}</mark>`);
            const wrapper = document.createElement('span');
            wrapper.innerHTML = highlightedText;
            textNode.parentNode.replaceChild(wrapper, textNode);
            matchCount++;
        }
    });
    
    // Show search results
    showSearchResults(matchCount, searchTerm);
}

function removeHighlights() {
    const highlights = document.querySelectorAll('.search-highlight');
    highlights.forEach(highlight => {
        const parent = highlight.parentNode;
        parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
        parent.normalize();
    });
}

function showSearchResults(count, term) {
    // Remove existing search results message
    const existingResults = document.querySelector('.search-results');
    if (existingResults) {
        existingResults.remove();
    }
    
    // Create search results message
    const resultsDiv = document.createElement('div');
    resultsDiv.className = 'search-results';
    resultsDiv.style.cssText = `
        background: #dbeafe;
        border: 1px solid #2563eb;
        border-radius: 6px;
        padding: 15px;
        margin: 20px 0;
        text-align: center;
    `;
    
    if (count > 0) {
        resultsDiv.innerHTML = `
            <p><strong>${count}</strong> matches found for "<strong>${term}</strong>"</p>
            <button onclick="clearSearch()" style="background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-top: 10px;">Clear Search</button>
        `;
    } else {
        resultsDiv.innerHTML = `
            <p>No matches found for "<strong>${term}</strong>"</p>
            <button onclick="clearSearch()" style="background: #6b7280; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-top: 10px;">Clear</button>
        `;
    }
    
    const mainContent = document.getElementById('main-content');
    mainContent.insertBefore(resultsDiv, mainContent.firstChild);
}

function clearSearch() {
    removeHighlights();
    document.getElementById('searchInput').value = '';
    const searchResults = document.querySelector('.search-results');
    if (searchResults) {
        searchResults.remove();
    }
}

// Notices Page Functions
function initializeNotices() {
    // Get all notice items
    const noticeItems = document.querySelectorAll('.notice-item');
    noticesData = Array.from(noticeItems);
    
    // Set up event listeners
    setupNoticeFilters();
}

function setupNoticeFilters() {
    const typeFilter = document.getElementById('typeFilter');
    const yearFilter = document.getElementById('yearFilter');
    const sortSelect = document.getElementById('sortBy');
    
    if (typeFilter) typeFilter.addEventListener('change', filterNotices);
    if (yearFilter) yearFilter.addEventListener('change', filterNotices);
    if (sortSelect) sortSelect.addEventListener('change', sortNotices);
}

function filterNotices() {
    const typeFilter = document.getElementById('typeFilter').value;
    const yearFilter = document.getElementById('yearFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    const container = document.getElementById('noticesContainer');
    const noResults = document.getElementById('noResults');
    let visibleCount = 0;
    
    noticesData.forEach(notice => {
        const noticeType = notice.getAttribute('data-type');
        const noticeYear = notice.getAttribute('data-year');
        const noticeTitle = notice.querySelector('.notice-title').textContent.toLowerCase();
        const noticeExcerpt = notice.querySelector('.notice-excerpt').textContent.toLowerCase();
        
        let showNotice = true;
        
        // Type filter
        if (typeFilter !== 'all' && noticeType !== typeFilter) {
            showNotice = false;
        }
        
        // Year filter
        if (yearFilter !== 'all' && noticeYear !== yearFilter) {
            showNotice = false;
        }
        
        // Search filter
        if (searchTerm && !noticeTitle.includes(searchTerm) && !noticeExcerpt.includes(searchTerm)) {
            showNotice = false;
        }
        
        if (showNotice) {
            notice.style.display = 'block';
            visibleCount++;
        } else {
            notice.style.display = 'none';
        }
    });
    
    // Show/hide no results message
    if (visibleCount === 0) {
        noResults.style.display = 'block';
    } else {
        noResults.style.display = 'none';
    }
}

function sortNotices() {
    const sortBy = document.getElementById('sortBy').value;
    const container = document.getElementById('noticesContainer');
    
    const sortedNotices = [...noticesData].sort((a, b) => {
        switch (sortBy) {
            case 'date-desc':
                return new Date(b.getAttribute('data-date')) - new Date(a.getAttribute('data-date'));
            case 'date-asc':
                return new Date(a.getAttribute('data-date')) - new Date(b.getAttribute('data-date'));
            case 'title-asc':
                return a.querySelector('.notice-title').textContent.localeCompare(b.querySelector('.notice-title').textContent);
            case 'title-desc':
                return b.querySelector('.notice-title').textContent.localeCompare(a.querySelector('.notice-title').textContent);
            default:
                return 0;
        }
    });
    
    // Clear container and re-append sorted notices
    container.innerHTML = '';
    sortedNotices.forEach(notice => container.appendChild(notice));
}

function clearFilters() {
    document.getElementById('typeFilter').value = 'all';
    document.getElementById('yearFilter').value = 'all';
    document.getElementById('searchInput').value = '';
    filterNotices();
}

function searchNotices(searchTerm) {
    document.getElementById('searchInput').value = searchTerm;
    filterNotices();
}

function downloadPDF(noticeId) {
    // Simulate PDF download
    alert(`Downloading PDF for notice: ${noticeId}\n\nNote: In a real implementation, this would download the actual PDF file.`);
}

function viewDetails(noticeId) {
    // Simulate viewing notice details
    alert(`Viewing details for notice: ${noticeId}\n\nNote: In a real implementation, this would open a detailed view or modal.`);
}

function loadMoreNotices() {
    // Simulate loading more notices
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    loadMoreBtn.textContent = 'Loading...';
    loadMoreBtn.disabled = true;
    
    setTimeout(() => {
        alert('No more notices to load.\n\nNote: In a real implementation, this would load additional notices from the server.');
        loadMoreBtn.textContent = 'Load More Notices';
        loadMoreBtn.disabled = false;
    }, 1000);
}

// FAQ Page Functions
function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqData = Array.from(faqItems);
    
    // Set up category filters
    setupFAQFilters();
}

function setupFAQFilters() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Filter FAQs
            const category = btn.textContent.toLowerCase();
            filterFAQs(category === 'all questions' ? 'all' : category);
        });
    });
}

function filterFAQs(category) {
    faqData.forEach(faq => {
        const faqCategory = faq.getAttribute('data-category');
        
        if (category === 'all' || faqCategory === category) {
            faq.style.display = 'block';
        } else {
            faq.style.display = 'none';
        }
    });
}

function searchFAQs() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    let visibleCount = 0;
    
    faqData.forEach(faq => {
        const question = faq.querySelector('.faq-question h3').textContent.toLowerCase();
        const answer = faq.querySelector('.faq-answer').textContent.toLowerCase();
        
        if (!searchTerm || question.includes(searchTerm) || answer.includes(searchTerm)) {
            faq.style.display = 'block';
            visibleCount++;
        } else {
            faq.style.display = 'none';
        }
    });
    
    // Show message if no results
    if (searchTerm && visibleCount === 0) {
        showFAQSearchResults(0, searchTerm);
    } else if (searchTerm) {
        showFAQSearchResults(visibleCount, searchTerm);
    } else {
        clearFAQSearchResults();
    }
}

function showFAQSearchResults(count, term) {
    clearFAQSearchResults();
    
    const resultsDiv = document.createElement('div');
    resultsDiv.className = 'search-results faq-search-results';
    resultsDiv.style.cssText = `
        background: #dbeafe;
        border: 1px solid #2563eb;
        border-radius: 6px;
        padding: 15px;
        margin: 20px 0;
        text-align: center;
    `;
    
    if (count > 0) {
        resultsDiv.innerHTML = `<p><strong>${count}</strong> FAQs found matching "<strong>${term}</strong>"</p>`;
    } else {
        resultsDiv.innerHTML = `<p>No FAQs found matching "<strong>${term}</strong>"</p>`;
    }
    
    const faqContainer = document.getElementById('faqContainer');
    faqContainer.parentNode.insertBefore(resultsDiv, faqContainer);
}

function clearFAQSearchResults() {
    const existingResults = document.querySelector('.faq-search-results');
    if (existingResults) {
        existingResults.remove();
    }
}

function toggleFAQ(element) {
    const faqItem = element.parentElement;
    const isActive = faqItem.classList.contains('active');
    
    // Close all other FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Toggle current item
    if (!isActive) {
        faqItem.classList.add('active');
    }
}

// Guide Page Functions
function toggleAccordion(element) {
    const accordionItem = element.parentElement;
    const isActive = accordionItem.classList.contains('active');
    
    // Close all other accordion items
    document.querySelectorAll('.accordion-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Toggle current item
    if (!isActive) {
        accordionItem.classList.add('active');
    }
}

// Contact Page Functions
function startChat() {
    alert('Live chat feature coming soon!\n\nFor immediate assistance, please call our helpline: 1800-11-1234\n\nOr email us at: support@dbtportal.gov.in');
}

function submitContactForm(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'queryType', 'subject', 'message'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
        alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
    }
    
    if (!data.privacy) {
        alert('Please accept the privacy policy and terms of service.');
        return;
    }
    
    // Simulate form submission
    const submitBtn = event.target.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        alert('Thank you for your query!\n\nYour reference number is: REF' + Date.now() + '\n\nWe will respond within 24 hours to your registered email address.');
        
        // Reset form
        event.target.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

// Utility Functions
function updateLastUpdated() {
    const lastUpdatedElements = document.querySelectorAll('#lastUpdated');
    const currentDate = new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    lastUpdatedElements.forEach(element => {
        element.textContent = currentDate;
    });
}

    // Load saved font size
    loadFontSize();
    
    // Set up smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Add loading animation for external links
    const externalLinks = document.querySelectorAll('a[href^="http"]');
    externalLinks.forEach(link => {
        link.addEventListener('click', function() {
            // You could add a loading indicator here
        });
    });

// (Removed duplicate DOMContentLoaded handler to fix syntax error)
// (Removed duplicate DOMContentLoaded handler to fix syntax error)

// Add CSS for search highlights and collapsing header/navbar
const style = document.createElement('style');
style.textContent = `
    .search-highlight {
        background-color: #fbbf24;
        padding: 2px 4px;
        border-radius: 3px;
        font-weight: bold;
    }
    .font-btn.active {
        background-color: #374151;
        color: #f97316;
    }
    @media (max-width: 768px) {
        .search-results {
            margin: 10px 0;
            padding: 10px;
            font-size: 0.9rem;
        }
        .main-header,
        .main-nav {
            transition: transform 0.3s cubic-bezier(.4,0,.2,1), opacity 0.3s cubic-bezier(.4,0,.2,1);
            will-change: transform, opacity;
        }
        .main-header.hide-on-scroll,
        .main-nav.hide-on-scroll {
            transform: translateY(-100%);
            opacity: 0;
            pointer-events: none;
        }
        .main-header.show-on-scroll,
        .main-nav.show-on-scroll {
            transform: translateY(0);
            opacity: 1;
            pointer-events: auto;
        }
    }
`;
document.head.appendChild(style);

// Collapse header/navbar on scroll (mobile only)
let lastScrollY = window.scrollY;
let ticking = false;
let isMobile = () => window.innerWidth <= 768;

function handleMobileHeaderNavScroll() {
    if (!isMobile()) {
        document.querySelector('.main-header')?.classList.remove('hide-on-scroll', 'show-on-scroll');
        document.querySelector('.main-nav')?.classList.remove('hide-on-scroll', 'show-on-scroll');
        return;
    }
    const header = document.querySelector('.main-header');
    const nav = document.querySelector('.main-nav');
    if (!header || !nav) return;
    const currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollY && currentScrollY > 60) {
        // Scrolling down
        header.classList.add('hide-on-scroll');
        header.classList.remove('show-on-scroll');
        nav.classList.add('hide-on-scroll');
        nav.classList.remove('show-on-scroll');
    } else {
        // Scrolling up
        header.classList.remove('hide-on-scroll');
        header.classList.add('show-on-scroll');
        nav.classList.remove('hide-on-scroll');
        nav.classList.add('show-on-scroll');
    }
    lastScrollY = currentScrollY;
}

window.addEventListener('scroll', function() {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            handleMobileHeaderNavScroll();
            ticking = false;
        });
        ticking = true;
    }
});

window.addEventListener('resize', handleMobileHeaderNavScroll);
document.addEventListener('DOMContentLoaded', handleMobileHeaderNavScroll);