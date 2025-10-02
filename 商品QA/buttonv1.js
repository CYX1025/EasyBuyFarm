//<div id="faq-root"></div>  <---放在網頁上面的呼叫方式

function createAccordionFromJson(data, containerId) {
  const root = document.getElementById(containerId);

  Object.keys(data[0]).forEach(section => {
    const sectionData = data[0][section];

    // 建立每個分類區塊
    const sectionContainer = document.createElement("div");
    sectionContainer.className = "faq-section";

    const sectionTitle = document.createElement("h2");
    sectionTitle.textContent = getSectionName(section); // optional：翻譯區塊名稱
    sectionContainer.appendChild(sectionTitle);

    // 統一成陣列格式處理（單一物件也能處理）
    const items = Array.isArray(sectionData) ? sectionData : [sectionData];

    items.forEach((item, index) => {
      const accordionItem = document.createElement("div");
      accordionItem.className = "accordion-item";

      const button = document.createElement("button");
      button.className = "accordion-button";
      button.innerHTML = `${item.title}<span class="accordion-icon">⯆</span>`;
      button.onclick = () => toggleAccordion(button);

      const content = document.createElement("div");
      content.className = "accordion-description";

      const descriptions = Array.isArray(item.description) ? item.description : [item.description];
      content.innerHTML = descriptions.map(line => `<p>${line}</p>`).join("");

      accordionItem.appendChild(button);
      accordionItem.appendChild(content);
      sectionContainer.appendChild(accordionItem);
    });

    root.appendChild(sectionContainer);
  });
}

function toggleAccordion(button) {
  const item = button.parentElement;
  const content = item.querySelector(".accordion-description");
  const isOpen = content.classList.contains("open");

  // 全部關閉
  document.querySelectorAll(".accordion-description").forEach(desc => {
    desc.classList.remove("open");
    desc.style.maxHeight = null;
  });
  document.querySelectorAll(".accordion-icon").forEach(icon => {
    icon.textContent = "⯆";
  });

  // 開啟目前
  if (!isOpen) {
    content.classList.add("open");
    content.style.maxHeight = content.scrollHeight + "px";
    button.querySelector(".accordion-icon").textContent = "⯅";
  }
}

// 可選：翻譯分類名
function getSectionName(key) {
  const map = {
    member: "會員相關",
    shop: "購物流程",
    payment: "付款方式",
    order: "訂單問題",
    returns_refunds: "退換貨問題",
    message: "聯絡與備註"
  };
  return map[key] || key;
}

// 初始化
document.addEventListener("DOMContentLoaded", () => {
  fetch("./productQA.json")
    .then(res => res.json())
    .then(data => {
      createAccordionFromJson(data, "faq-root");
    })
    .catch(err => console.error("讀取 JSON 發生錯誤", err));
});
