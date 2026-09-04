let allData = [];
let currentSubject = null;

const subjectNav = document.getElementById('subject-nav');
const videoGrid = document.getElementById('video-grid');
const currentSubjectTitle = document.getElementById('current-subject-title');
const searchInput = document.getElementById('search-input');
const modal = document.getElementById('video-modal');
const iframe = document.getElementById('video-iframe');
const closeModal = document.getElementById('close-modal');
const modalTitle = document.getElementById('modal-video-title');
const modalActions = document.getElementById('modal-actions');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const sidebar = document.querySelector('.sidebar');

function init() {
    try {
        if (!window.batchData) {
            throw new Error('Data not found. Make sure data.js is loaded.');
        }
        
        allData = window.batchData.subjects || [];
        
        // Remove empty subjects
        allData = allData.filter(sub => sub.videos && sub.videos.length > 0);
        
        renderSubjects();
        
        if (allData.length > 0) {
            selectSubject(allData[0]);
        } else {
            videoGrid.innerHTML = '<div class="empty-state">No subjects found.</div>';
        }
    } catch (error) {
        console.error('Error loading data:', error);
        videoGrid.innerHTML = `
            <div class="empty-state">
                <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
                <h2>Failed to load data.</h2>
                <p style="margin-top: 12px; font-size: 14px;">Error: ${error.message}</p>
            </div>
        `;
    }
}

function renderSubjects() {
    subjectNav.innerHTML = '';
    
    allData.forEach(subject => {
        const div = document.createElement('div');
        div.className = 'subject-item';
        div.innerHTML = `
            <span class="name">${subject.subject_name}</span>
            <span class="count">${subject.videos.length}</span>
        `;
        
        div.addEventListener('click', () => {
            selectSubject(subject);
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }
        });
        
        subject.element = div;
        subjectNav.appendChild(div);
    });
}

function selectSubject(subject) {
    if (currentSubject && currentSubject.element) {
        currentSubject.element.classList.remove('active');
    }
    currentSubject = subject;
    currentSubject.element.classList.add('active');
    
    currentSubjectTitle.textContent = subject.subject_name;
    searchInput.value = ''; // Clear search
    renderVideos(subject.videos);
}

function renderVideos(videos) {
    videoGrid.innerHTML = '';
    
    if (videos.length === 0) {
        videoGrid.innerHTML = `
            <div class="empty-state">
                <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
                <h2>No videos found.</h2>
            </div>
        `;
        return;
    }
    
    videos.forEach(video => {
        const card = document.createElement('div');
        card.className = 'video-card';
        
        // Ensure secure URLs
        const thumbnailUrl = video.thumbnail || 'https://via.placeholder.com/640x360?text=No+Thumbnail';
        const notesUrl = video.notes && video.notes.length > 0 ? video.notes[0].url : null;
        
        card.innerHTML = `
            <div class="thumbnail-container">
                <img src="${thumbnailUrl}" alt="Thumbnail" loading="lazy">
                <div class="play-overlay">
                    <div class="play-icon"></div>
                </div>
            </div>
            <div class="video-info">
                <div class="video-title" title="${video.title}">${video.title}</div>
                <div class="video-meta">${video.published_date || 'Unknown Date'}</div>
                <div class="actions">
                    ${notesUrl ? `<a href="${notesUrl}" target="_blank" class="btn btn-primary" onclick="event.stopPropagation()">View Notes</a>` : ''}
                </div>
            </div>
        `;
        
        card.querySelector('.thumbnail-container').addEventListener('click', () => {
            openVideo(video);
        });
        
        videoGrid.appendChild(card);
    });
}

function openVideo(video) {
    let videoUrl = video.hd_video_url || video.video_url;
    
    // Fix for YouTube Error 153 when running locally via file://
    if (videoUrl.includes('youtube.com/embed/')) {
        try {
            const urlObj = new URL(videoUrl);
            urlObj.searchParams.set('origin', 'http://localhost');
            urlObj.searchParams.set('rel', '0');
            videoUrl = urlObj.toString();
        } catch (e) {
            // fallback if URL parsing fails
            videoUrl += (videoUrl.includes('?') ? '&' : '?') + 'origin=http://localhost&rel=0';
        }
    }
    
    iframe.src = videoUrl;
    modalTitle.textContent = video.title;
    
    modalActions.innerHTML = '';
    if (video.notes && video.notes.length > 0) {
        const btn = document.createElement('a');
        btn.href = video.notes[0].url;
        btn.target = '_blank';
        btn.className = 'btn btn-primary';
        btn.textContent = 'Open Notes PDF';
        modalActions.appendChild(btn);
    }
    
    modal.classList.add('active');
}

function closeVideo() {
    modal.classList.remove('active');
    setTimeout(() => {
        iframe.src = '';
    }, 300);
}

// Event Listeners
closeModal.addEventListener('click', closeVideo);

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeVideo();
    }
});

searchInput.addEventListener('input', (e) => {
    if (!currentSubject) return;
    const query = e.target.value.toLowerCase();
    
    const filtered = currentSubject.videos.filter(v => 
        v.title.toLowerCase().includes(query)
    );
    
    renderVideos(filtered);
});

mobileMenuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
});

// Start app
init();
