// Initialize meeting functionality
function initMeeting() {
    const videoArea = document.querySelector('.video-area');
    const controlsArea = document.querySelector('.controls-area');
    const chatArea = document.querySelector('.chat-area');
    const fullscreenBtn = document.getElementById('fullscreen-button');
    const collapseBtn = document.getElementById('collapse-button');
    const chatToggleBtn = document.getElementById('minimize-chat');

    initMediaControls();
    initChat();

    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', () => {
            videoArea.classList.toggle('fullscreen');
            fullscreenBtn.classList.toggle('active');
        });
    }

    if (collapseBtn) {
        collapseBtn.addEventListener('click', () => {
            controlsArea.classList.toggle('collapsed');
            collapseBtn.classList.toggle('active');
        });
    }

    if (chatToggleBtn) {
        chatToggleBtn.addEventListener('click', () => {
            chatArea.classList.toggle('collapsed');
        });
    }
}

// Initialize media controls
function initMediaControls() {
    const micBtn = document.getElementById('mic-button');
    const videoBtn = document.getElementById('video-button');
    const screenBtn = document.getElementById('screen-share-button');
    const leaveBtn = document.getElementById('leave-button');

    let localStream;

    // Request camera and mic access
    async function getMedia() {
        try {
            localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

            const localVideo = document.createElement("video");
            localVideo.id = "local-video";
            localVideo.srcObject = localStream;
            localVideo.autoplay = true;
            localVideo.playsInline = true;

            document.querySelector(".video-area").appendChild(localVideo);
        } catch (error) {
            console.error("Error accessing media devices:", error);
            alert("Failed to access camera and microphone. Please ensure you have granted the necessary permissions.");
        }
    }

    // Stop a media track completely
    function stopTrack(type) {
        if (!localStream) return;
        const tracks = type === 'mic' ? localStream.getAudioTracks() : localStream.getVideoTracks();
        tracks.forEach(track => {
            track.stop(); // Completely stop track
            localStream.removeTrack(track);
        });
    }

    // Toggle video and mic access
    async function toggleMedia(type, button) {
        const isActive = button.classList.contains('active');

        if (type === 'mic') {
            if (isActive) {
                stopTrack('mic');
            } else {
                try {
                    const newStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    newStream.getAudioTracks().forEach(track => localStream.addTrack(track));
                } catch (error) {
                    console.error("Error re-enabling microphone:", error);
                }
            }
        } else if (type === 'video') {
            if (isActive) {
                stopTrack('video');
                document.getElementById('local-video').style.display = 'none';
            } else {
                try {
                    const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
                    newStream.getVideoTracks().forEach(track => localStream.addTrack(track));
                    document.getElementById('local-video').style.display = 'block';
                } catch (error) {
                    console.error("Error re-enabling camera:", error);
                }
            }
        }

        button.classList.toggle('active', !isActive);
        button.classList.add('clicked');
        setTimeout(() => button.classList.remove('clicked'), 200);
    }

    if (micBtn) micBtn.addEventListener('click', () => toggleMedia('mic', micBtn));
    if (videoBtn) videoBtn.addEventListener('click', () => toggleMedia('video', videoBtn));

    if (screenBtn) {
        screenBtn.addEventListener('click', async () => {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                const screenTrack = screenStream.getVideoTracks()[0];

                const localVideo = document.getElementById("local-video");
                if (localVideo) {
                    localVideo.srcObject = screenStream;
                }

                screenTrack.onended = () => {
                    localVideo.srcObject = localStream;
                };
            } catch (error) {
                console.error("Error sharing screen:", error);
            }
        });
    }

    if (leaveBtn) {
        leaveBtn.addEventListener('click', () => {
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
            window.location.href = '/';
        });
    }

    getMedia();
}

// Handle chat functionality
function initChat() {
    const chatInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-button');
    const messagesList = document.getElementById('messages');

    if (sendBtn && chatInput) {
        sendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }

    function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            const li = document.createElement('li');
            li.textContent = message;
            messagesList.appendChild(li);
            chatInput.value = '';
            messagesList.scrollTop = messagesList.scrollHeight;
        }
    }
}

document.addEventListener('DOMContentLoaded', initMeeting);
