// URL Viewer Functions
function loadWebsite() {
    const urlInput = document.getElementById('urlInput');
    const frame = document.getElementById('urlFrame');
    const errorMsg = document.getElementById('errorMsg');

    // Reset states
    errorMsg.style.display = 'none';
    frame.style.display = 'none';

    // Get and validate URL
    const userUrl = urlInput.value.trim();

    try {
        // Basic validation
        if (!userUrl) {
            throw new Error('Please enter a URL');
        }

        // Advanced validation using URL constructor
        new URL(userUrl); // This will throw error for invalid URLs

        // Show frame and load content
        frame.src = userUrl;
        frame.style.display = 'block';
    } catch (error) {
        errorMsg.textContent = error.message;
        errorMsg.style.display = 'block';
        urlInput.focus();
    }
}

function convertToJPG() {
    const frame = document.getElementById('urlFrame');
    const frame1 = document.getElementById('urlFrame1');

    // Use html2canvas to capture the content of the iframe
    html2canvas(frame.contentDocument.body).then(canvas => {
        // Convert canvas to JPG image
        const imgData = canvas.toDataURL('image/jpeg');

        // Create an image element and set its source to the JPG data
        const img = new Image();
        img.src = imgData;

        // Clear the content of the second iframe and append the image
        frame1.contentDocument.body.innerHTML = '';
        frame1.contentDocument.body.appendChild(img);

        // Show the second iframe
        frame1.style.display = 'block';
    });
}

// Allow Enter key to trigger the button
document.getElementById('urlInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        loadWebsite();
    }
});

// Chat Functions
let prompt = document.querySelector("#prompt");
let submitbtn = document.querySelector("#submit");
let chatContainer = document.querySelector(".chat-container");
let imagebtn = document.querySelector("#image");
let imageinput = document.querySelector("#image input");

const Api_Url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBacs-f252IdAP2qfK0Tja56BPI0jyZoeM";

let user = {
    message: null,
    files: []
};

async function generateResponse(aiChatBox) {
    let text = aiChatBox.querySelector(".ai-chat-area");

    let parts = [{ text: user.message }];
    if (user.files.length > 0) {
        user.files.forEach(file => {
            parts.push({ inline_data: file });
        });
    }

    let RequestOption = {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "contents": [{ "parts": parts }]
        })
    };

    try {
        let response = await fetch(Api_Url, RequestOption);
        let data = await response.json();
        let apiResponse = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
        text.innerHTML = apiResponse;
    } catch (error) {
        console.log(error);
    } finally {
        chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
        user.files = []; // Clear files after submission
    }
}

function createChatBox(html, classes) {
    let div = document.createElement("div");
    div.innerHTML = html;
    div.classList.add(classes);
    return div;
}

function handlechatResponse(userMessage) {
    user.message = userMessage;

    let html = `<img src="user.png" alt="" id="userImage" width="8%">
<div class="user-chat-area">
${user.message}
</div>`;
    prompt.value = "";

    let userChatBox = createChatBox(html, "user-chat-box");
    chatContainer.appendChild(userChatBox);

    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });

    setTimeout(() => {
        let html = `<img src="ai.png" alt="" id="aiImage" width="10%">
    <div class="ai-chat-area">
    <img src="loading.webp" alt="" class="load" width="50px">
    </div>`;
        let aiChatBox = createChatBox(html, "ai-chat-box");
        chatContainer.appendChild(aiChatBox);
        generateResponse(aiChatBox);
    }, 600);
}

prompt.addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
        handlechatResponse(prompt.value);
    }
});

submitbtn.addEventListener("click", () => {
    handlechatResponse(prompt.value);
});

imageinput.addEventListener("change", () => {
    const files = imageinput.files;
    if (!files.length) return;

    user.files = []; // Reset files array
    imagebtn.querySelectorAll("img.preview").forEach(img => img.remove()); // Clear previous previews

    Array.from(files).forEach(file => {
        let reader = new FileReader();
        reader.onload = (e) => {
            let base64string = e.target.result.split(",")[1];
            user.files.push({
                mime_type: file.type,
                data: base64string
            });

            let previewImg = document.createElement("img");
            previewImg.src = `data:${file.type};base64,${base64string}`;
            previewImg.classList.add("preview"); // Use the "preview" class for small images
            imagebtn.appendChild(previewImg); // Display the preview
        };
        reader.readAsDataURL(file);
    });
});

imagebtn.addEventListener("click", () => {
    imageinput.click();
});
