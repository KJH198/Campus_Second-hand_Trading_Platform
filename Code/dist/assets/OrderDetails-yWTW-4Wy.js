import{_ as F,r as p,c as A,o as z,a as f,b as t,d as g,w as k,t as c,e as j,f as E,F as q,g as D,h as N,E as _,i as v,j as u,k as w,n as b,u as Y,l as G}from"./index-C56e5xo2.js";const H={setup(){const a=Y(),r=G(),C=p({}),o=p({}),y=p(""),P=A(()=>["已下单","已送达"].includes(o.value.order_state));async function T(){try{const e=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"get_order_detail"},body:JSON.stringify({goods_id:a.params.orderId,user_id:a.query.current_user_id})});if(!e.ok)throw new Error("获取订单详情失败");const s=await e.json();s.success&&(o.value=s.order_detail,C.value=s.goods_detail,y.value=s.goods_detail.seller_picture?URL.createObjectURL(base64ToBlob(s.goods_detail.seller_picture)):N)}catch(e){console.error("Error fetching order detail:",e),_.error("获取订单详情失败")}}async function S(){try{const e=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"confirm_delivery"},body:JSON.stringify({goods_id:a.params.orderId,user_id:a.query.current_user_id})});if(!e.ok)throw new Error("确认送达失败");(await e.json()).success&&(_.success("确认送达成功"),o.value.order_state="已送达")}catch(e){console.error("Error confirming delivery:",e),_.error("确认送达失败")}}async function m(){try{const e=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"request_refund"},body:JSON.stringify({goods_id:a.params.orderId,user_id:a.query.current_user_id})});if(!e.ok)throw new Error("申请退款失败");(await e.json()).success&&(_.success("退款申请已提交"),o.value.order_state="已退款")}catch(e){console.error("Error requesting refund:",e),_.error("申请退款失败")}}function O(e){return e||"未知状态"}function i(){r.push({name:"UserProfile",query:{user_id:o.value.seller_id,current_user_id:a.query.current_user_id,userAvatar:y.value,isOwner:!1,viewing_own_profile:"false"}})}const d=p([]),h=p("");async function R(){try{const e=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"get_comments"},body:JSON.stringify({goods_id:a.params.orderId,user_id:a.query.current_user_id})});if(!e.ok)throw new Error("获取评论失败");const s=await e.json();s.success&&(d.value=s.comments.map(n=>({...n,showReply:!1,replyContent:"",user_avatar:n.user_avatar?URL.createObjectURL(base64ToBlob(n.user_avatar)):N,replies:n.replies.map(l=>({...l,user_avatar:l.user_avatar?URL.createObjectURL(base64ToBlob(l.user_avatar)):N}))})))}catch(e){console.error("Error fetching comments:",e),_.error("获取评论失败")}}async function x(){if(h.value.trim())try{const e=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"add_comment"},body:JSON.stringify({goods_id:a.params.orderId,user_id:a.query.current_user_id,content:h.value})});if(!e.ok)throw new Error("发表评论失败");(await e.json()).success&&(_.success("评论发表成功"),h.value="",await R())}catch(e){console.error("Error submitting comment:",e),_.error("评论发表失败")}}function I(e){e.showReply=!e.showReply}async function J(e){if(e.replyContent.trim())try{const s=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"add_reply"},body:JSON.stringify({goods_id:a.params.orderId,comment_id:e.id,user_id:a.query.current_user_id,content:e.replyContent})});if(!s.ok)throw new Error("回复评论失败");(await s.json()).success&&(_.success("回复成功"),e.replyContent="",e.showReply=!1,await R())}catch(s){console.error("Error submitting reply:",s),_.error("回复失败")}}async function U(e){try{const s=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"like_comment"},body:JSON.stringify({goods_id:a.params.orderId,comment_id:e.id,user_id:a.query.current_user_id})});if(!s.ok)throw new Error("点赞失败");const n=await s.json();n.success&&(e.liked=!e.liked,e.likes=n.likes,e.disliked&&(e.disliked=!1,e.dislikes=n.dislikes))}catch(s){console.error("Error liking comment:",s),_.error("点赞失败")}}async function B(e){try{const s=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"dislike_comment"},body:JSON.stringify({goods_id:a.params.orderId,comment_id:e.id,user_id:a.query.current_user_id})});if(!s.ok)throw new Error("踩失败");const n=await s.json();n.success&&(e.disliked=!e.disliked,e.dislikes=n.dislikes,e.liked&&(e.liked=!1,e.likes=n.likes))}catch(s){console.error("Error disliking comment:",s),_.error("操作失败")}}function L(e){const s=new Date(e),l=new Date-s;return l<6e4?"刚刚":l<36e5?`${Math.floor(l/6e4)}分钟前`:l<864e5?`${Math.floor(l/36e5)}小时前`:`${s.getFullYear()}-${String(s.getMonth()+1).padStart(2,"0")}-${String(s.getDate()).padStart(2,"0")}`}async function V(e,s){try{const n=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"like_reply"},body:JSON.stringify({goods_id:a.params.orderId,comment_id:e.id,reply_id:s.id,user_id:a.query.current_user_id})});if(!n.ok)throw new Error("点赞失败");const l=await n.json();l.success&&(s.liked=!s.liked,s.likes=l.likes,s.disliked&&(s.disliked=!1,s.dislikes=l.dislikes))}catch(n){console.error("Error liking reply:",n),_.error("点赞失败")}}async function M(e,s){try{const n=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"dislike_reply"},body:JSON.stringify({goods_id:a.params.orderId,comment_id:e.id,reply_id:s.id,user_id:a.query.current_user_id})});if(!n.ok)throw new Error("踩失败");const l=await n.json();l.success&&(s.disliked=!s.disliked,s.dislikes=l.dislikes,s.liked&&(s.liked=!1,s.likes=l.likes))}catch(n){console.error("Error disliking reply:",n),_.error("操作失败")}}return z(async()=>{await T(),await R()}),{goodsDetail:C,orderDetail:o,sellerPicture:y,canRequestRefund:P,confirmDelivery:S,requestRefund:m,getOrderStatusText:O,contactSeller:i,comments:d,newComment:h,submitComment:x,toggleReply:I,submitReply:J,likeComment:U,dislikeComment:B,formatTime:L,likeReply:V,dislikeReply:M}}},K={class:"good-details"},Q={class:"good-info"},W={class:"good-images"},X=["src","alt"],Z={class:"good-details-info"},$={class:"price"},ee={class:"deal-time"},se={class:"seller-info"},te=["src"],oe={class:"order-actions"},re={class:"order-status"},ie={class:"good-description"},ne={class:"comments-section"},ae={class:"comment-input"},de={class:"comments-list"},le={class:"comment-main"},ce=["src"],_e={class:"comment-content"},ue={class:"comment-user"},fe={class:"comment-text"},me={class:"comment-footer"},he={class:"comment-time"},ke={class:"comment-actions"},pe=["onClick"],ye=["onClick"],ge={class:"count"},ve=["onClick"],we={class:"count"},be={key:0,class:"reply-list"},Ce=["src"],Te={class:"comment-content"},Se={class:"comment-user"},Oe={class:"comment-text"},Re={class:"comment-footer"},je={class:"comment-time"},Ee={class:"comment-actions"},qe=["onClick"],De={class:"count"},Ne=["onClick"],Pe={class:"count"};function xe(a,r,C,o,y,P){const T=v("el-carousel-item"),S=v("el-carousel"),m=v("el-button"),O=v("el-input");return u(),f("div",K,[t("div",Q,[t("div",W,[g(S,{height:"400px"},{default:k(()=>[(u(!0),f(q,null,D(o.goodsDetail.goods_pictures,(i,d)=>(u(),j(T,{key:d},{default:k(()=>[t("img",{src:i,alt:`商品图片${d+1}`,class:"carousel-image"},null,8,X)]),_:2},1024))),128))]),_:1})]),t("div",Z,[t("h1",null,c(o.goodsDetail.goods_name),1),t("div",$,"¥"+c(o.goodsDetail.goods_price),1),t("div",ee,"下单时间："+c(o.formatTime(o.orderDetail.deal_time)),1),t("div",se,[t("img",{src:o.sellerPicture,alt:"卖家头像",class:"seller-avatar"},null,8,te),g(m,{type:"text",onClick:o.contactSeller},{default:k(()=>r[1]||(r[1]=[w("联系卖家")])),_:1},8,["onClick"])]),t("div",oe,[t("div",re," 订单状态："+c(o.getOrderStatusText(o.orderDetail.order_state)),1),o.orderDetail.order_state==="已下单"?(u(),j(m,{key:0,type:"primary",onClick:o.confirmDelivery},{default:k(()=>r[2]||(r[2]=[w(" 确认送达 ")])),_:1},8,["onClick"])):E("",!0),o.canRequestRefund?(u(),j(m,{key:1,type:"danger",onClick:o.requestRefund},{default:k(()=>r[3]||(r[3]=[w(" 申请退款 ")])),_:1},8,["onClick"])):E("",!0)])])]),t("div",ie,[r[4]||(r[4]=t("h2",null,"商品描述",-1)),t("p",null,c(o.goodsDetail.goods_description),1)]),t("div",ne,[r[10]||(r[10]=t("h2",null,"评价区",-1)),t("div",ae,[g(O,{modelValue:o.newComment,"onUpdate:modelValue":r[0]||(r[0]=i=>o.newComment=i),type:"textarea",rows:3,placeholder:"说说你的想法..."},null,8,["modelValue"]),g(m,{type:"primary",onClick:o.submitComment,disabled:!o.newComment.trim()},{default:k(()=>r[5]||(r[5]=[w(" 发表评论 ")])),_:1},8,["onClick","disabled"])]),t("div",de,[(u(!0),f(q,null,D(o.comments,i=>(u(),f("div",{key:i.id,class:"comment-item"},[t("div",le,[t("img",{src:i.user_avatar,alt:"用户头像",class:"comment-avatar"},null,8,ce),t("div",_e,[t("div",ue,c(i.username),1),t("div",fe,c(i.content),1),t("div",me,[t("span",he,c(o.formatTime(i.create_time)),1),t("div",ke,[t("button",{class:"action-btn reply-btn",onClick:d=>o.toggleReply(i)},c(i.showReply?"取消回复":"回复"),9,pe),t("button",{class:b(["action-btn like-btn",{active:i.liked}]),onClick:d=>o.likeComment(i)},[r[6]||(r[6]=t("i",{class:"fas fa-thumbs-up thumb-icon"},null,-1)),t("span",ge,c(i.likes),1)],10,ye),t("button",{class:b(["action-btn dislike-btn",{active:i.disliked}]),onClick:d=>o.dislikeComment(i)},[r[7]||(r[7]=t("i",{class:"fas fa-thumbs-down thumb-icon"},null,-1)),t("span",we,c(i.dislikes),1)],10,ve)])])])]),i.replies&&i.replies.length>0?(u(),f("div",be,[(u(!0),f(q,null,D(i.replies,d=>(u(),f("div",{key:d.id,class:"reply-item"},[t("img",{src:d.user_avatar,alt:"用户头像",class:"comment-avatar"},null,8,Ce),t("div",Te,[t("div",Se,c(d.username),1),t("div",Oe,c(d.content),1),t("div",Re,[t("span",je,c(o.formatTime(d.create_time)),1),t("div",Ee,[t("button",{class:b(["action-btn like-btn",{active:d.liked}]),onClick:h=>o.likeReply(i,d)},[r[8]||(r[8]=t("i",{class:"fas fa-thumbs-up thumb-icon"},null,-1)),t("span",De,c(d.likes),1)],10,qe),t("button",{class:b(["action-btn dislike-btn",{active:d.disliked}]),onClick:h=>o.dislikeReply(i,d)},[r[9]||(r[9]=t("i",{class:"fas fa-thumbs-down thumb-icon"},null,-1)),t("span",Pe,c(d.dislikes),1)],10,Ne)])])])]))),128))])):E("",!0)]))),128))])])])}const Je=F(H,[["render",xe],["__scopeId","data-v-c9af38e2"]]);export{Je as default};
