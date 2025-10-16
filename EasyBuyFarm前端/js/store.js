document.addEventListener("DOMContentLoaded", () => {
  fetch("http://localhost:8080/easybuyfarm/stores")
    .then(response => response.json())
    .then(data => {
      const container = document.querySelector(".store-buttons-wrapper");
      data.forEach(store => {
        const div = document.createElement("div");
        div.classList.add("store-buttons-List");
        div.innerHTML = `
          <img class="store-img" src="./images/${store.storeImg}" alt="${store.name}">
          <h3>${store.name}</h3>
          <p>${store.introduce}</p>
        `;
        div.addEventListener("click", () => {
          window.location.href = '/html/product/productlist.html?storeId=' + store.storeId;
        });
        container.appendChild(div);
      });
    })
    .catch(error => console.error("載入失敗:", error));
    
});

