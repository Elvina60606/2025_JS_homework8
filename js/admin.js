let orderData = []

const orderList = document.querySelector(".orderList")

function init(){
    getOrderData()
    
}

//取得訂單資料
function getOrderData(){
    axios.get(`${baseUrl}api/livejs/v1/admin/${apiPath}/orders`,{headers} )
         .then(function(res){
            orderData = res.data.orders
          //  console.log(orderData)

            let str = ""
            orderData.forEach(function(item){   
                //訂單時間字串
                let timeStamp = new Date (item.createdAt * 1000).toISOString().slice(0,10).replaceAll("-","/")
                let orderTime = `${timeStamp}`

                //訂單品項字串
                let productStr = ""
                item.products.forEach(function(productItem){
                productStr += `
                <p>${productItem.title} x ${productItem.quantity}</p>
                `
                })
                //訂單狀態
                let listStatus = ""
                if(item.paid === true){
                    listStatus = "已處理"
                } else if (item.paid === false){
                    listStatus = "未處理"
                }
                //整筆訂單內容
                str += `
                 <tr>
                        <td>${item.id}</td>
                        <td>
                          <p>${item.user.name}</p>
                          <p>${item.user.tel}</p>
                        </td>
                        <td>${item.user.address}</td>
                        <td>${item.user.email}</td>
                        <td>
                          ${productStr}
                        </td>
                        <td>${orderTime}</td>
                        <td>
                          <a href="#" class="orderStatus" data-id="${item.id}" data-status="${item.paid}">${listStatus}</a>
                        </td>
                        <td>
                          <input type="button" class="delSingleOrder-Btn" data-id="${item.id}" value="刪除">
                        </td>
                    </tr>
                `
            })
            orderList.innerHTML = str;
            renderC3();
         })
         .catch(function(error){
            console.log("getOrderData ERROR")
         })
}

//修改訂單資料
orderList.addEventListener("click", function(e){
    e.preventDefault();
    let targetClass = e.target.getAttribute("class")
    let orderId = e.target.getAttribute("data-id")
    let orderStatus = e.target.getAttribute("data-status")

    if(e.target.dataset === ""){
        return
    }

    //刪除單筆訂單
    function deleteOrderItem(){
        axios.delete(`${baseUrl}api/livejs/v1/admin/${apiPath}/orders/${orderId}`,{headers})
             .then(function(res){
                alert("成功刪除該筆訂單！")
                getOrderData()
             })
             .catch(function(error){
                console.log("沒有刪除")
             })
    }
    if(targetClass === "delSingleOrder-Btn"){
        deleteOrderItem()
    }

    //切換訂單付款狀態
    function changeOrderItem(){
        let newStatus;
        if (orderStatus === "true"){
            newStatus = false
        } else {
            newStatus = true
        }

        axios.put(`${baseUrl}api/livejs/v1/admin/${apiPath}/orders`,{
            "data": {
                    "id": orderId,
                    "paid": newStatus
                  }
            },{headers})
            .then(function(res){
                alert("成功變更訂單付款狀態")
                getOrderData()
            })
            .catch(function(error){
                console.log("訂單狀態未調整")
            })
    }
    if (targetClass === "orderStatus"){
        changeOrderItem()
    }

})

//刪除所有訂單
const discardAllBtn = document.querySelector(".discardAllBtn")
discardAllBtn.addEventListener("click", function(e){
    e.preventDefault();
    axios.delete(`${baseUrl}api/livejs/v1/admin/${apiPath}/orders`,{headers})
         .then(function(res){
            alert("已刪除所有訂單！")
            getOrderData();
         })
         .catch(function(error){
            console.log("尚未刪除全部訂單")
         })
})

init()

//C3 .js
function renderC3(){
    console.log(orderData)
    let total = {}

    orderData.forEach(function(item){
        item.products.forEach(function(productItem){
           if( total[productItem.category] === undefined){
            total[productItem.category] = productItem.price * productItem.quantity;
           } else { total[productItem.category] +=  productItem.price * productItem.quantity;
           }
        })
    })
    console.log(total)
    let chartData = Object.entries(total)
    console.log(chartData)
    chartData.sort(function(a,b){
        return b[1] - a[1]
    })

    let chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
        type: "pie",
        columns: chartData,
    },
});
}



