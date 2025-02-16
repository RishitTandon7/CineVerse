const joinButton = document.getElementById('join-button');
const createButton = document.getElementById('create-button');
const meetingCodeInput = document.getElementById('meeting-code');

joinButton.addEventListener('click', () => {
    const meetingCode = meetingCodeInput.value;
    if (meetingCode.trim() !== "") {
        window.location.href = `meeting.html?code=${meetingCode}`; // Redirect to meeting with code
    } else {
        alert("Please enter a meeting code.");
    }
});

createButton.addEventListener('click', () => {
  // Generate a unique meeting code (you'll need to implement this logic)
  const meetingCode = generateMeetingCode(); // Placeholder function
  window.location.href = `meeting.html?code=${meetingCode}`; // Redirect to meeting with code
});

function generateMeetingCode() {
    // Implement your logic to generate a unique code.
    // Example (basic, not truly unique):
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}