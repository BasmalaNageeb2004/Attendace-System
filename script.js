async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const response = await fetch('https://67db7fd71fd9e43fe474beb2.mockapi.io/teachers');
    const teachers = await response.json();

    
    const teacher = teachers.find(t => t.email === email && t.password === password);

    if (teacher) {
        localStorage.setItem('teacherLoggedIn', 'true');
        window.location.href = "dashboard.html";
    } else {
        document.getElementById('error-msg').innerText = "Invalid credentials!";
    }
}


document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("qr-reader")) {
        async function onScanSuccess(decodedText) {
            const fp = await FingerprintJS.load();
            const result = await fp.get();
            const deviceFingerprint = result.visitorId; // Unique ID for the device

            fetch('https://67db7fd71fd9e43fe474beb2.mockapi.io/lectures')
                .then(response => response.json())
                .then(lectures => {
                    const lecture = lectures.find(l => l.qrCode.trim() === decodedText.trim());

                    if (lecture) {
                        const studentName = document.getElementById('std_name').value.trim();
                        const LinkEle= document.createElement("a");
                        LinkEle.href=lecture.quizLink;
                        LinkEle.innerHTML="Go to quiz"
                        document.body.appendChild(LinkEle)

                        if (!studentName) {
                            alert("Please enter your name!");
                            return;
                        }

                        // Check if this device has already recorded attendance
                        if (lecture.attendedStudents.some(s => s.device === deviceFingerprint)) {
                            alert("You have already recorded attendance from this device!");
                            return;
                        }

                        // Add student with fingerprint
                        fetch(`https://67db7fd71fd9e43fe474beb2.mockapi.io/lectures/${lecture.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                                attendedStudents: [...lecture.attendedStudents, { name: studentName, device: deviceFingerprint }] 
                            })
                        }).then(() => {
                            alert("Attendance Recorded!");
                        });
                    } else {
                        alert("Invalid QR Code!");
                    }
                })
                .catch(error => console.error("Error fetching lectures:", error));
        }

        new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 }).render(onScanSuccess);
    }
});


