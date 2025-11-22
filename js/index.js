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

const finalTotal = document.querySelector(".js-finalTotal")
//取得購物車資料
function getCartData(){
    axios.get(`${baseUrl}api/livejs/v1/customer/${apiPath}/carts`)
         .then(function(res){
            cartsData = res.data.carts
            finalTotal.textContent = toThousands(res.data.finalTotal)
            renderCarts();
        })
        .catch(function(error){
            console.log("getCartData",error);
        })
    }

const shoppingCartList = document.querySelector(".shoppingCart-list")
//渲染購物車
function renderCarts(){
    let str = "";
    cartsData.forEach(function(item){
        str += `
        <tr>
            <td>
                <div class="cardItem-title">
                    <img src="${item.product.images}" alt="">
                    <p>${item.product.title}</p>
                </div>
            </td>
            <td>NT$${toThousands(item.product.price)}</td>
            <td>
            <button type="button" class="plusBtn" data-id=${item.id}>+</button>
            ${item.quantity}
            <button type="button" class="minusBtn" data-id=${item.id}>-</button>
            </td>
            <td>NT$${toThousands(item.product.price * item.quantity)}</td>
            <td class="discardBtn">
            <a href="#" class="material-icons delItemBtn" data-id=${item.id}>clear</a>
            </td>
        </tr>
        `
    })
    shoppingCartList.innerHTML = str;
}

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

//購物車內按鈕
shoppingCartList.addEventListener("click", function(e){
    e.preventDefault();
    let cartsId = e.target.getAttribute("data-id")
    if(cartsId === null){
        return
    }
    //新增購物車數量
    let plusNum = 0
    cartsData.forEach(item => {
        if(item.id === cartsId){
            plusNum = item.quantity +1
        }
    })

    let plusData = {
                "data": {
                    "id": cartsId,
                    "quantity": plusNum
                    }
                }

    if(e.target.classList.contains("plusBtn")){
        axios.patch(`${baseUrl}api/livejs/v1/customer/${apiPath}/carts`, plusData)
             .then(function(res){
              getCartData() 
             })
             .catch(function(error){
              console.log(error)
             })
            }
    
    //減少購物車數量
    let minusNum = 0
    cartsData.forEach(item => {
        if(item.id === cartsId){
            minusNum = item.quantity -1
        }
    })

    let minusData = {
                "data": {
                    "id": cartsId,
                    "quantity": minusNum
                    }
                }

    if(e.target.classList.contains("minusBtn")){
        axios.patch(`${baseUrl}api/livejs/v1/customer/${apiPath}/carts`, minusData)
             .then(function(res){
              getCartData() 
             })
             .catch(function(error){
              console.log(error)
             })
            }


    //刪除購物車商品        
    if(e.target.classList.contains("delItemBtn")){
        axios.delete(`${baseUrl}api/livejs/v1/customer/${apiPath}/carts/${cartsId}`)
             .then(function(res){
                getCartData()
                alert("成功刪除該筆購物車")
             })
             .catch(function(error){
                alert("刪除失敗！")
             })
    }
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
          .catch(function(error){
            alert("刪除失敗！")
         })
})

//送出訂單資訊
const orderInfo_form = document.querySelector(".orderInfo-form")
const orderInfo_btn = document.querySelector(".orderInfo-btn")
const customerName = document.querySelector("#customerName")
const customerPhone = document.querySelector("#customerPhone")
const customerEmail = document.querySelector("#customerEmail")
const customerAddress = document.querySelector("#customerAddress")
const customerTradeWay = document.querySelector("#tradeWay")

orderInfo_btn.addEventListener("click",function(e){
    e.preventDefault();

    if(!cartsData.length){
        alert("購物車內沒有東西唷！")
        return
    }
    
    customerName.nextElementSibling.style.display = "none"
    customerPhone.nextElementSibling.style.display = "none"
    customerEmail.nextElementSibling.style.display = "none"
    customerAddress.nextElementSibling.style.display = "none"

    const name = customerName.value.trim()
    const tel = customerPhone.value.trim()
    const email = customerEmail.value.trim()
    const address = customerAddress.value.trim()
    const payment = customerTradeWay.value.trim()
    
    let isError = false; 
    if (!name){
        customerName.nextElementSibling.style.display = "block"
        isError = true
    }
    if (!tel){
        customerPhone.nextElementSibling.style.display = "block"
        isError = true
    } else if( !/^09\d{8}$/.test(tel)){
        customerPhone.nextElementSibling.style.display = "block"
        customerPhone.nextElementSibling.textContent = "請輸入正確電話號碼"
    }

    if (!email){
        customerEmail.nextElementSibling.style.display = "block"
        isError = true
    } else if(!/^\S+@\S+\.\S+$/.test(email)){
        customerEmail.nextElementSibling.style.display = "block"
        customerEmail.nextElementSibling.textContent = "請輸入正確的電子信箱"
    }

    if (!address){
        customerAddress.nextElementSibling.style.display = "block"
        isError = true
    }

    if(!isError){
        axios.post(`${baseUrl}api/livejs/v1/customer/${apiPath}/orders`, {
            "data": {
                "user": {
                  name,
                  tel,
                  email,
                  address,
                  payment
                }
              }
        })
             .then(function(res){
                alert("訂單已新增成功")
                orderInfo_form.reset();
                getCartData();
             })
             .catch(function(error){
                console.log(error)
             })
    }})
    

//價格數字
function toThousands(num) {
    num = num.toString();
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(num))
        num = num.replace(pattern, "$1,$2");
    return num;
}



init();

