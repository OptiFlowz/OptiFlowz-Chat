import "https://cdn.socket.io/4.7.2/socket.io.min.js";

const socket = io('https://e029-2a06-63c0-a01-6800-6df9-301e-b6de-df44.ngrok-free.app', {
    transports: ['websocket'],
});

let optiflowzChat = document.createElement("div");
optiflowzChat.classList.add("optiflowz-chat-wrapper");
optiflowzChat.id = "optiflowz-chat";
optiflowzChat.innerHTML = `
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/OptiFlowz/OptiFlowz-Chat@1.0.1/style.css">
<button id="openChat">
            <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 3c5.5 0 10 3.58 10 8s-4.5 8-10 8c-1.24 0-2.43-.18-3.53-.5C5.55 21 2 21 2 21c2.33-2.33 2.7-3.9 2.75-4.5C3.05 15.07 2 13.13 2 11c0-4.42 4.5-8 10-8"></path></svg>
            <svg viewBox="0 0 24 24"><path fill="currentColor" d="M7.41 8.58L12 13.17l4.59-4.59L18 10l-6 6l-6-6z"></path></svg>
        </button>
        <div class="chatWrapper">
            <div class="chatHeader">
                <a href="https://optiflowz.com/">
                    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M58 30C59.1046 30 60.0069 30.8965 59.9334 31.9986C59.5842 37.2289 57.8693 42.2893 54.9441 46.6671C51.6476 51.6006 46.9623 55.4458 41.4805 57.7164C35.9987 59.987 29.9667 60.5811 24.1473 59.4236C18.3279 58.266 12.9824 55.4088 8.7868 51.2132C4.59122 47.0176 1.734 41.6721 0.576442 35.8527C-0.581115 30.0333 0.0129851 24.0013 2.28361 18.5195C4.55424 13.0377 8.39942 8.35235 13.3329 5.05591C17.7107 2.13073 22.7711 0.41581 28.0014 0.0666338C29.1035 -0.00694375 30 0.895431 30 2V12.9615C30 14.0661 29.1007 14.9478 28.0058 15.0943C25.7388 15.3976 23.5615 16.2155 21.6451 17.496C19.172 19.1484 17.2445 21.4971 16.1062 24.245C14.968 26.9929 14.6702 30.0167 15.2505 32.9339C15.8307 35.851 17.263 38.5306 19.3662 40.6338C21.4694 42.737 24.149 44.1693 27.0661 44.7495C29.9833 45.3298 33.0071 45.032 35.755 43.8938C38.5029 42.7555 40.8516 40.828 42.504 38.3549C43.7845 36.4385 44.6024 34.2612 44.9057 31.9942C45.0522 30.8993 45.9339 30 47.0385 30H58Z" fill="#748BFB"/>
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M53 0H35.75C34.6454 0 33.75 0.895431 33.75 2V13.9221C33.75 14.8347 34.3735 15.6184 35.2288 15.9365C39.3068 17.4533 42.5467 20.6932 44.0635 24.7712C44.3816 25.6265 45.1653 26.25 46.0779 26.25H58C59.1046 26.25 60 25.3546 60 24.25V7C60 3.13401 56.866 0 53 0Z" fill="#414756"/>
                    </svg>
                </a>
                <h1>Zdravo!<span>👋</span></h1>
                <p>Tu smo da vam pomognemo 24/7</p>
            </div>
            <div class="chatConvoWrapper">
                <div class="chatConvo" id="chatConvo">
                    <p class="botMessage">
                        Zdravo! Kako mogu da vam pomognem danas?
                    </p>
                    <!-- <p class="botWriting botWritingStep botMessage">
                        Zakazivanje sastanka
                        <paprika>
                            <span></span>
                            <span></span>
                            <span></span>
                        </paprika>
                    </p> -->
                </div>
            </div>
            <div class="chatInput">
                <textarea name="message" id="messageInput" placeholder="Unesite vaše pitanje..."></textarea>
                <button id="sendMessage">
                    <svg data-v-2a7fb1c3="" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="m2 21l21-9L2 3v7l15 2l-15 2z"></path></svg>
                </button>
            </div>
        </div>
`;
document.body.appendChild(optiflowzChat);

socket.on('receive_message', (data) => {
    getMessageFromBot(data);
    // console.log(data);
});

socket.on('workflow_step', (data) => {
    // console.log(data);
});

const chat = document.getElementById("optiflowz-chat");;
const messageInput = document.getElementById("messageInput");
const sendMessageButton = document.getElementById("sendMessage");
const chatConvo = document.getElementById("chatConvo");
const openChatButton = document.getElementById("openChat");
let isOptiFlowzChatOpen = false, isWaitingForMessage = false;
let lastBotSentMessage = null;

messageInput.addEventListener('keyup', () => {
    const textToSend = messageInput.value.trim();
    if(textToSend != "" && !isWaitingForMessage){
        sendMessageButton.classList.add("clickable");
    }else{
        sendMessageButton.classList.remove("clickable");
    }
})

messageInput.addEventListener('focusin', () => {
    document.addEventListener('keyup', submitMessage);
})

messageInput.addEventListener('focusout', () => {
    document.removeEventListener('keyup', submitMessage);
})

function submitMessage(e){
    if(e.keyCode === 13){
        sendMessageToBot();
    }
}

sendMessageButton.addEventListener('click', () => {
    sendMessageToBot();
})

function sendMessageToBot(){

    if(isWaitingForMessage){
        return;
    }

    const textToSend = messageInput.value.trim();
    if(textToSend != ""){
        let newUserText = document.createElement("p");
        newUserText.innerHTML = textToSend;
        newUserText.classList.add("userMessage");
        chatConvo.appendChild(newUserText);
        chatConvo.parentElement.scrollTop =  chatConvo.parentElement.scrollHeight;

        messageInput.value = "";
        sendMessageButton.classList.remove("clickable");

        // console.log(textToSend);
        socket.emit('send_message', textToSend);
        isWaitingForMessage = true;

        setTimeout(() => {
            newUserText = document.createElement("p");
            lastBotSentMessage = newUserText;
            newUserText.innerHTML = `<paprika><span></span><span></span><span></span></paprika>`;
            newUserText.classList.add("botMessage");
            newUserText.classList.add("botWriting");
            chatConvo.appendChild(newUserText);
            chatConvo.parentElement.scrollTop =  chatConvo.parentElement.scrollHeight;
        }, 300);
    }
}

function getMessageFromBot(data){
    isWaitingForMessage = false;
    chatConvo.removeChild(lastBotSentMessage);
    let newUserText = document.createElement("p");
    newUserText.innerHTML = data;
    newUserText.classList.add("botMessage");
    chatConvo.appendChild(newUserText);
    chatConvo.parentElement.scrollTop =  chatConvo.parentElement.scrollHeight;
}

openChatButton.addEventListener("mousedown", () => {
    openChatButton.classList.add("buttonDown");
})
openChatButton.addEventListener("touchstart", () => {
    openChatButton.classList.add("buttonDown");
})

openChatButton.addEventListener("mouseup", () => {
    openChatButton.classList.remove("buttonDown");
})
openChatButton.addEventListener("touchend", () => {
    openChatButton.classList.remove("buttonDown");
})

openChatButton.addEventListener("mouseleave", () => {
    openChatButton.classList.remove("buttonDown");
})
openChatButton.addEventListener("touchcancel", () => {
    openChatButton.classList.remove("buttonDown");
})

openChatButton.addEventListener("click", () => {
    if(isOptiFlowzChatOpen){
        chat.classList.remove("chat-open");
    }else{
        chat.classList.add("chat-open");
    }
    isOptiFlowzChatOpen = !isOptiFlowzChatOpen;
})