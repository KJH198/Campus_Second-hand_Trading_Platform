import{_ as V,r as p,c as A,o as F,a as f,b as s,d as v,w as k,t as c,e as j,f as E,F as q,g as D,E as u,h as g,i as _,j as w,n as b,u as z,k as Y}from"./index-DQUKCOXG.js";const G={setup(){const a=z(),o=Y(),C=p({}),r=p({}),y=p(""),N=A(()=>["ordered","delivered"].includes(r.value.order_state));async function T(){try{const e=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"get_order_detail"},body:JSON.stringify({order_id:a.params.orderId,current_user_id:a.query.current_user_id})});if(!e.ok)throw new Error("获取订单详情失败");const t=await e.json();t.success&&(r.value=t.order_detail,C.value=t.goods_detail,y.value=t.seller_picture?URL.createObjectURL(base64ToBlob(t.seller_picture)):defaultAvatar)}catch(e){console.error("Error fetching order detail:",e),u.error("获取订单详情失败")}}async function S(){try{const e=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"confirm_delivery"},body:JSON.stringify({order_id:a.params.orderId,current_user_id:a.query.current_user_id})});if(!e.ok)throw new Error("确认送达失败");(await e.json()).success&&(u.success("确认送达成功"),r.value.order_state="delivered")}catch(e){console.error("Error confirming delivery:",e),u.error("确认送达失败")}}async function m(){try{const e=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"request_refund"},body:JSON.stringify({order_id:a.params.orderId,current_user_id:a.query.current_user_id})});if(!e.ok)throw new Error("申请退款失败");(await e.json()).success&&(u.success("退款申请已提交"),r.value.order_state="refunding")}catch(e){console.error("Error requesting refund:",e),u.error("申请退款失败")}}function O(e){return{ordered:"已下单",delivered:"已送达",refunded:"已退款"}[e]||"未知状态"}function i(){o.push({name:"UserProfile",query:{user_id:r.value.seller_id,current_user_id:a.query.current_user_id,userAvatar:y.value}})}const d=p([]),h=p("");async function R(){try{const e=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"get_comments"},body:JSON.stringify({order_id:a.params.orderId,current_user_id:a.query.current_user_id})});if(!e.ok)throw new Error("获取评论失败");const t=await e.json();t.success&&(d.value=t.comments.map(n=>({...n,showReply:!1,replyContent:"",user_avatar:n.user_avatar?URL.createObjectURL(base64ToBlob(n.user_avatar)):defaultAvatar,replies:n.replies.map(l=>({...l,user_avatar:l.user_avatar?URL.createObjectURL(base64ToBlob(l.user_avatar)):defaultAvatar}))})))}catch(e){console.error("Error fetching comments:",e),u.error("获取评论失败")}}async function P(){if(h.value.trim())try{const e=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"add_comment"},body:JSON.stringify({order_id:a.params.orderId,current_user_id:a.query.current_user_id,content:h.value})});if(!e.ok)throw new Error("发表评论失败");(await e.json()).success&&(u.success("评论发表成功"),h.value="",R())}catch(e){console.error("Error submitting comment:",e),u.error("评论发表失败")}}function x(e){e.showReply=!e.showReply}async function I(e){if(e.replyContent.trim())try{const t=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"add_reply"},body:JSON.stringify({order_id:a.params.orderId,comment_id:e.id,current_user_id:a.query.current_user_id,content:e.replyContent})});if(!t.ok)throw new Error("回复评论失败");(await t.json()).success&&(u.success("回复成功"),e.replyContent="",e.showReply=!1,R())}catch(t){console.error("Error submitting reply:",t),u.error("回复失败")}}async function J(e){try{const t=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"like_comment"},body:JSON.stringify({order_id:a.params.orderId,comment_id:e.id,current_user_id:a.query.current_user_id})});if(!t.ok)throw new Error("点赞失败");const n=await t.json();n.success&&(e.liked=!e.liked,e.likes=n.likes,e.disliked&&(e.disliked=!1,e.dislikes=n.dislikes))}catch(t){console.error("Error liking comment:",t),u.error("点赞失败")}}async function U(e){try{const t=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"dislike_comment"},body:JSON.stringify({order_id:a.params.orderId,comment_id:e.id,current_user_id:a.query.current_user_id})});if(!t.ok)throw new Error("踩失败");const n=await t.json();n.success&&(e.disliked=!e.disliked,e.dislikes=n.dislikes,e.liked&&(e.liked=!1,e.likes=n.likes))}catch(t){console.error("Error disliking comment:",t),u.error("操作失败")}}function B(e){const t=new Date(e),l=new Date-t;return l<6e4?"刚刚":l<36e5?`${Math.floor(l/6e4)}分钟前`:l<864e5?`${Math.floor(l/36e5)}小时前`:`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`}async function L(e,t){try{const n=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"like_reply"},body:JSON.stringify({order_id:a.params.orderId,comment_id:e.id,reply_id:t.id,current_user_id:a.query.current_user_id})});if(!n.ok)throw new Error("点赞失败");const l=await n.json();l.success&&(t.liked=!t.liked,t.likes=l.likes,t.disliked&&(t.disliked=!1,t.dislikes=l.dislikes))}catch(n){console.error("Error liking reply:",n),u.error("点赞失败")}}async function M(e,t){try{const n=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"dislike_reply"},body:JSON.stringify({order_id:a.params.orderId,comment_id:e.id,reply_id:t.id,current_user_id:a.query.current_user_id})});if(!n.ok)throw new Error("踩失败");const l=await n.json();l.success&&(t.disliked=!t.disliked,t.dislikes=l.dislikes,t.liked&&(t.liked=!1,t.likes=l.likes))}catch(n){console.error("Error disliking reply:",n),u.error("操作失败")}}return F(async()=>{await T(),await R()}),{goodsDetail:C,orderDetail:r,sellerPicture:y,canRequestRefund:N,confirmDelivery:S,requestRefund:m,getOrderStatusText:O,contactSeller:i,comments:d,newComment:h,submitComment:P,toggleReply:x,submitReply:I,likeComment:J,dislikeComment:U,formatTime:B,likeReply:L,dislikeReply:M}}},H={class:"good-details"},K={class:"good-info"},Q={class:"good-images"},W=["src","alt"],X={class:"good-details-info"},Z={class:"price"},$={class:"deal-time"},ee={class:"seller-info"},te=["src"],se={class:"order-actions"},re={class:"order-status"},oe={class:"good-description"},ie={class:"comments-section"},ne={class:"comment-input"},ae={class:"comments-list"},de={class:"comment-main"},le=["src"],ce={class:"comment-content"},ue={class:"comment-user"},_e={class:"comment-text"},fe={class:"comment-footer"},me={class:"comment-time"},he={class:"comment-actions"},ke=["onClick"],pe=["onClick"],ye={class:"count"},ve=["onClick"],ge={class:"count"},we={key:0,class:"reply-list"},be=["src"],Ce={class:"comment-content"},Te={class:"comment-user"},Se={class:"comment-text"},Oe={class:"comment-footer"},Re={class:"comment-time"},je={class:"comment-actions"},Ee=["onClick"],qe={class:"count"},De=["onClick"],Ne={class:"count"};function Pe(a,o,C,r,y,N){const T=g("el-carousel-item"),S=g("el-carousel"),m=g("el-button"),O=g("el-input");return _(),f("div",H,[s("div",K,[s("div",Q,[v(S,{height:"400px"},{default:k(()=>[(_(!0),f(q,null,D(r.goodsDetail.pictures,(i,d)=>(_(),j(T,{key:d},{default:k(()=>[s("img",{src:i,alt:`商品图片${d+1}`,class:"carousel-image"},null,8,W)]),_:2},1024))),128))]),_:1})]),s("div",X,[s("h1",null,c(r.goodsDetail.goods_name),1),s("div",Z,"¥"+c(r.goodsDetail.goods_price),1),s("div",$,"下单时间："+c(r.formatTime(r.orderDetail.deal_time)),1),s("div",ee,[s("img",{src:r.sellerPicture,alt:"卖家头像",class:"seller-avatar"},null,8,te),v(m,{type:"text",onClick:r.contactSeller},{default:k(()=>o[1]||(o[1]=[w("联系卖家")])),_:1},8,["onClick"])]),s("div",se,[s("div",re," 订单状态："+c(r.getOrderStatusText(r.orderDetail.order_state)),1),r.orderDetail.order_state==="ordered"?(_(),j(m,{key:0,type:"primary",onClick:r.confirmDelivery},{default:k(()=>o[2]||(o[2]=[w(" 确认送达 ")])),_:1},8,["onClick"])):E("",!0),r.canRequestRefund?(_(),j(m,{key:1,type:"danger",onClick:r.requestRefund},{default:k(()=>o[3]||(o[3]=[w(" 申请退款 ")])),_:1},8,["onClick"])):E("",!0)])])]),s("div",oe,[o[4]||(o[4]=s("h2",null,"商品描述",-1)),s("p",null,c(r.goodsDetail.goods_description),1)]),s("div",ie,[o[10]||(o[10]=s("h2",null,"评价区",-1)),s("div",ne,[v(O,{modelValue:r.newComment,"onUpdate:modelValue":o[0]||(o[0]=i=>r.newComment=i),type:"textarea",rows:3,placeholder:"说说你的想法..."},null,8,["modelValue"]),v(m,{type:"primary",onClick:r.submitComment,disabled:!r.newComment.trim()},{default:k(()=>o[5]||(o[5]=[w(" 发表评论 ")])),_:1},8,["onClick","disabled"])]),s("div",ae,[(_(!0),f(q,null,D(r.comments,i=>(_(),f("div",{key:i.id,class:"comment-item"},[s("div",de,[s("img",{src:i.user_avatar,alt:"用户头像",class:"comment-avatar"},null,8,le),s("div",ce,[s("div",ue,c(i.username),1),s("div",_e,c(i.content),1),s("div",fe,[s("span",me,c(r.formatTime(i.create_time)),1),s("div",he,[s("button",{class:"action-btn reply-btn",onClick:d=>r.toggleReply(i)},c(i.showReply?"取消回复":"回复"),9,ke),s("button",{class:b(["action-btn like-btn",{active:i.liked}]),onClick:d=>r.likeComment(i)},[o[6]||(o[6]=s("i",{class:"fas fa-thumbs-up thumb-icon"},null,-1)),s("span",ye,c(i.likes),1)],10,pe),s("button",{class:b(["action-btn dislike-btn",{active:i.disliked}]),onClick:d=>r.dislikeComment(i)},[o[7]||(o[7]=s("i",{class:"fas fa-thumbs-down thumb-icon"},null,-1)),s("span",ge,c(i.dislikes),1)],10,ve)])])])]),i.replies&&i.replies.length>0?(_(),f("div",we,[(_(!0),f(q,null,D(i.replies,d=>(_(),f("div",{key:d.id,class:"reply-item"},[s("img",{src:d.user_avatar,alt:"用户头像",class:"comment-avatar"},null,8,be),s("div",Ce,[s("div",Te,c(d.username),1),s("div",Se,c(d.content),1),s("div",Oe,[s("span",Re,c(r.formatTime(d.create_time)),1),s("div",je,[s("button",{class:b(["action-btn like-btn",{active:d.liked}]),onClick:h=>r.likeReply(i,d)},[o[8]||(o[8]=s("i",{class:"fas fa-thumbs-up thumb-icon"},null,-1)),s("span",qe,c(d.likes),1)],10,Ee),s("button",{class:b(["action-btn dislike-btn",{active:d.disliked}]),onClick:h=>r.dislikeReply(i,d)},[o[9]||(o[9]=s("i",{class:"fas fa-thumbs-down thumb-icon"},null,-1)),s("span",Ne,c(d.dislikes),1)],10,De)])])])]))),128))])):E("",!0)]))),128))])])])}const Ie=V(G,[["render",Pe],["__scopeId","data-v-8d59acab"]]);export{Ie as default};
