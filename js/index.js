let ProductsData = [];
let cartsData = [];

function init(){
    getProductdata();
    getCartData()
}
//取得產品資料
function getProductdata(){
    axios.get(`${baseUrl}api/livejs/v1/customer/${apiPath}/products`)
         .then(function(res){
            ProductsData = res.data.products
            //console.log(ProductsData);
            renderProduct()
        })
        .catch(function(error){
            console.log("getProductdata",error);
        })
    }

//重組渲染產品HTML文字
function combineProductHTMLStr(item){
    return `
        <li class="productCard">
            <h4 class="productType">新品</h4>
            <img src="${item.images}" alt="">
            <a href="#" class="addCardBtn" data-num="${item.id}">加入購物車</a>
            <h3>${item.title}</h3>
            <del class="originPrice">NT$${toThousands(item.origin_price)}</del>
            <p class="nowPrice">NT$${toThousands(item.price)}</p>
            </li>
        `
}

//渲染產品
const productWrap = document.querySelector(".productWrap")
function renderProduct(){
    let str = "";
    ProductsData.forEach(function(item){
        str += combineProductHTMLStr(item)
    })
    productWrap.innerHTML = str;
}

//取得購物車資料
function getCartData(){
    axios.get(`${baseUrl}api/livejs/v1/customer/${apiPath}/carts`)
         .then(function(res){
            cartsData = res.data.carts
           // console.log(cartsData);
            renderCarts();
            document.querySelector(".js-finalTotal").textContent = toThousands(res.data.finalTotal)
        })
        .catch(function(error){
            console.log("getCartData",error);
        })
    }

const shoppingCart_list = document.querySelector(".shoppingCart-list")
//渲染購物車
function renderCarts(){
    let str = "";
    cartsData.forEach(function(item){
        str += `
        <tr>
            <td>
                <div class="cardItem-title">
                    <img src="${item.product.image}" alt="">
                    <p>${item.product.title}</p>
                </div>
            </td>
            <td>NT$${toThousands(item.product.price)}</td>
            <td>${item.quantity}</td>
            <td>NT$${toThousands(item.product.price * item.quantity)}</td>
            <td class="discardBtn">
            <a href="#" class="material-icons" data-id=${item.id}>clear</a>
            </td>
        </tr>
        `
    })
    shoppingCart_list.innerHTML = str;
}

/////////////////////////////////////////
//下拉商品種類篩選
const productSelect = document.querySelector(".productSelect")
productSelect.addEventListener("change", function(e){
    const category = e.target.value
    if(category === "全部"){
        renderProduct()
        return;
    } 
    let str = "";
    ProductsData.forEach(function(item){
        if(item.category === category){
        str += combineProductHTMLStr(item)
        }
    })
    productWrap.innerHTML = str;
})

//加入購物車
productWrap.addEventListener("click", function(e){
    e.preventDefault();
    let addCardBtn = e.target.getAttribute("class")
    if(addCardBtn !== "addCardBtn"){
        return
    }
    let productId = e.target.dataset.num
    let numCheck = 1;

    cartsData.forEach(function(item){
        if(item.product.id === productId){
            numCheck = item.quantity += 1;
            console.log("你點擊到購物車")
        }
    })
    let data = 
        {
          "data": {
            "productId": productId,
            "quantity": numCheck
          }
        }
    axios.post(`${baseUrl}api/livejs/v1/customer/${apiPath}/carts`, data)
         .then(function(res){
          getCartData()
          alert("成功加入購物車！")
         })
         .catch(function(error){
            console.log("新增購物車error",error)
         }) 
})

//刪除購物車按鈕
shoppingCart_list.addEventListener("click", function(e){
    e.preventDefault();
    let cartsId = e.target.getAttribute("data-id")
    if(cartsId == null){
        return
    }

    axios.delete(`${baseUrl}api/livejs/v1/customer/${apiPath}/carts/${cartsId}`)
         .then(function(res){
            getCartData()
            alert("成功刪除該筆購物車")
         })
})

//刪除購物車所有商品
const discardAllBtn = document.querySelector(".discardAllBtn")
discardAllBtn.addEventListener("click", function(e){
    e.preventDefault();
    axios.delete(`${baseUrl}api/livejs/v1/customer/${apiPath}/carts`)
         .then(function(res){
            getCartData()
            alert("成功刪除全部購物車～")
         })
})

//送出訂單資訊
const orderInfo_form = document.querySelector(".orderInfo-form")
const orderInfo_btn = document.querySelector(".orderInfo-btn")


orderInfo_btn.addEventListener("click",function(e){
    e.preventDefault();
    const customerName = document.querySelector("#customerName").value
    const customerPhone = document.querySelector("#customerPhone").value
    const customerEmail = document.querySelector("#customerEmail").value
    const customerAddress = document.querySelector("#customerAddress").value
    const customerTradeWay = document.querySelector("#tradeWay").value

    if(customerName == "" || customerPhone == "" || customerEmail == "" || customerAddress == "" ||customerTradeWay == ""){
        alert("訂單資訊請填寫完整")
        return;
    }
    axios.post(`${baseUrl}api/livejs/v1/customer/${apiPath}/orders`, {
        "data": {
            "user": {
              "name": customerName,
              "tel": customerPhone,
              "email": customerEmail,
              "address": customerAddress,
              "payment": customerTradeWay
            }
          }
    })
         .then(function(res){
            alert("訂單已新增成功")
            orderInfo_form.reset();
            getCartData();
         })
})

function toThousands(num) {
    num = num.toString();
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(num))
        num = num.replace(pattern, "$1,$2");
    return num;
}



init();

