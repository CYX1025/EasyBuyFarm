// 初始化參數
let stompClient = null;
let loginUserRole = window.CURRENT_USER_ROLE || "BUYER"; // 從後端動態設定
let loginUserId = window.CURRENT_USER_ID || "1"; // 從後端動態設定

const chatWindow = document.getElementById("chat-window");
const chatHeader = document.getElementById("chat-header");
const sendBtn = document.getElementById("send-btn");

// 點擊 header 縮小/展開
chatHeader.addEventListener("click", function () {
    chatWindow.classList.toggle("minimized");
});

// WebSocket 連線
function connect() {
    const socket = new SockJS("/ws-chat"); // 對應後端設定的 endpoint
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        sendBtn.disabled = false;
        console.log("Connected: " + frame);
        loadRecipients();

        // 訂閱自己的訊息通道
        stompClient.subscribe('/topic/messages/${loginUserId}', function (messageOutput) {
            showMessage(JSON.parse(messageOutput.body));
        });
    });
}

// 載入對象選單
function loadRecipients() {
    const roleToFetch = loginUserRole === "BUYER" ? "SELLER" : "BUYER";
    fetch('/chat/recipients?role=${roleToFetch}')
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById("recipient-select");
            select.innerHTML = "";
            data.forEach(recipient => {
                const option = document.createElement("option");
                option.value = recipient.memberId;
                option.text = recipient.memberName;
                select.appendChild(option);
            });
        });
}

// 發送訊息
function sendMessage() {
    const message = document.getElementById("chat-input").value;
    const recipientId = document.getElementById("recipient-select").value;
    if (!message || !recipientId) return;

    stompClient.send("/app/chat.sendMessage", {}, JSON.stringify({
        senderId: loginUserId,
        senderRole: loginUserRole,
        recipientId: recipientId,
        message: message
    }));

    document.getElementById("chat-input").value = "";
}

//顯示訊息
function showMessage(msg) {
    const chatContent = document.getElementById("chat-content");
    const div = document.createElement("div");

    // 假設目前登入者的ID與角色由前端全域變數保存
    const currentUserId = window.currentUserId;
    const currentUserRole = window.currentUserRole;

    // 判斷訊息是自己發的還是對方發的
    const isMine = msg.senderId === currentUserId && msg.senderRole === currentUserRole;

    // 根據角色決定顯示在左側或右側
    div.classList.add("chat-message");
    div.classList.add(isMine ? "mine" : "theirs");

    div.innerHTML = 
        '<div class="bubble">'+
            '<strong>${msg.senderName}：</strong> ${msg.message}'+
        +'</div>';

    chatContent.appendChild(div);
    chatContent.scrollTop = chatContent.scrollHeight;
}

//每3秒更新資訊
setInterval(() => {
    fetch('/chat/messages/${loginUserId}')
        .then(res => res.json())
        .then(messages => {
            const chatContent = document.getElementById("chat-content");
            chatContent.innerHTML = "";
            messages.forEach(msg => {
                const div = document.createElement("div");
                div.innerHTML = '<strong>[${msg.senderRole}] ${msg.senderName}:</strong> ${msg.message}';
                chatContent.appendChild(div);
            });
        });
}, 3000);

sendBtn.addEventListener("click", sendMessage);
connect();
