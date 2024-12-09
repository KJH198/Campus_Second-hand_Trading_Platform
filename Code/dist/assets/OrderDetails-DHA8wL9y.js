import{_ as ne,r as f,d as b,c as ie,o as ae,a as le,b as h,e,f as y,w as T,g as ce,h as K,t as _,F as Q,i as W,u as de,E as c,j as w,k as v,l as ue,m as X,n as I,p as _e,v as me,q as fe}from"./index-DNrpY0xb.js";const ve={setup(){const d=de(),r=fe(),E=f({}),t=f({}),j=f(""),R=f(!1),L=f(d.query.userAvatar||b);function M(o){o.stopPropagation(),R.value=!R.value}function C(o){o.target.closest(".user-profile")||(R.value=!1)}function J(){r.push({name:"UserProfile",query:{user_id:d.query.current_user_id,current_user_id:d.query.current_user_id,userAvatar:d.query.userAvatar,viewing_own_profile:"true"}})}function A(){console.log("查看通知")}function N(){console.log("查看消息")}function B(){console.log("联系我们")}const D=ie(()=>["已下单","已送达"].includes(t.value.order_state));function p(o){try{const n=atob(o),u=[];for(let l=0;l<n.length;l+=512){const m=n.slice(l,l+512),i=new Array(m.length);for(let x=0;x<m.length;x++)i[x]=m.charCodeAt(x);const O=new Uint8Array(i);u.push(O)}return new Blob(u,{type:"image/jpeg"})}catch(n){return console.error("Error converting base64 to Blob:",n),null}}async function P(){try{const o=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"get_order_detail"},body:JSON.stringify({goods_id:d.params.orderId,user_id:d.query.current_user_id})});if(!o.ok)throw new Error("获取订单详情失败");const n=await o.json();console.log(n),n.success&&(t.value=n.order_detail,console.log(t.value),E.value={...n.goods_detail,goods_pictures:n.goods_detail.goods_pictures.map(u=>{if(u&&typeof u=="string")try{return URL.createObjectURL(p(u))}catch(l){return console.error("Error converting picture:",l),b}return b})},j.value=n.goods_detail.seller_picture?URL.createObjectURL(p(n.goods_detail.seller_picture)):b)}catch(o){console.error("Error fetching order detail:",o),c.error("获取订单详情失败")}}async function U(){try{const o=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"confirm_delivery"},body:JSON.stringify({goods_id:d.params.orderId,user_id:d.query.current_user_id})});if(!o.ok)throw new Error("确认送达失败");(await o.json()).success&&(c.success("确认送达成功"),t.value.order_state="已送达")}catch(o){console.error("Error confirming delivery:",o),c.error("确认送达失败")}}async function s(){try{const o=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"request_refund"},body:JSON.stringify({goods_id:d.params.orderId,user_id:d.query.current_user_id})});if(!o.ok)throw new Error("申请退款失败");(await o.json()).success&&(c.success("退款申请已提交"),t.value.order_state="已退款")}catch(o){console.error("Error requesting refund:",o),c.error("申请退款失败")}}function a(o){return o||"未知状态"}function z(){r.push({name:"UserProfile",query:{user_id:E.value.seller_id,current_user_id:d.query.current_user_id,userAvatar:j.value,isOwner:!1,viewing_own_profile:"false"}})}const Y=f([]),q=f(""),g=f(new Map),S=f(null),k=f(""),V=f(0);async function G(){try{const o=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"comments"},body:JSON.stringify({goods_id:d.params.orderId,user_id:d.query.current_user_id})});if(!o.ok)throw new Error("Failed to fetch comments");const u=(await o.json()).map(l=>{const m={...l,level:1,deliver_picture:l.picture?URL.createObjectURL(p(l.picture)):b};return l.reply&&Array.isArray(l.reply)&&(m.reply=l.reply.map(i=>({...i,level:2,deliver_picture:i.picture?URL.createObjectURL(p(i.picture)):b}))),m});Y.value=u,console.log("评论列表：",Y.value)}catch(o){console.error("Error fetching comments:",o),c.error("获取评论失败")}}async function Z(){if(!q.value.trim()){c.warning("评论内容不能为空");return}if(!V.value){c.warning("请给出评分");return}try{const o=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"commit_comment"},body:JSON.stringify({goods_id:d.params.orderId,comment:q.value,deliver_id:d.query.current_user_id,order_grade:V.value})});if(!o.ok)throw new Error("Network response was not ok");(await o.json()).success?(c.success("评论发表成功！"),await G(),q.value="",V.value=0):c.error("评论发表失败，请重试")}catch(o){console.error("Error submitting comment:",o),c.error("评论发表失败，请稍后重试")}}function $(o){S.value===o.order_comment_id?(S.value=null,k.value=""):(S.value=o.order_comment_id,k.value="")}async function ee(o){if(!k.value.trim()){c.warning("回复内容不能为空");return}try{const n=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"commit_reply"},body:JSON.stringify({order_comment_id:o,comment:k.value,deliver_id:d.query.current_user_id})});if(!n.ok)throw new Error("Network response was not ok");(await n.json()).success?(c.success("回复成功"),k.value="",S.value=null,await G()):c.error("回复失败，请重试")}catch(n){console.error("Error submitting reply:",n),c.error("回复失败，请稍后重试")}}function oe(o){if(!o)return"暂无时间信息";try{const n=new Date(o),l=new Date-n;return l<6e4?"刚刚":l<36e5?`${Math.floor(l/6e4)}分钟前`:l<864e5?`${Math.floor(l/36e5)}小时前`:`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`}catch(n){return console.error("Error formatting time:",n),"时间格式错误"}}function F(o){return o.level===2}function H(o){return o.level===2?`reply_${o.secondary_order_comment_id}`:`comment_${o.order_comment_id}`}function te(o){const n=H(o);return g.value.get(n)||null}async function re(o){const n=H(o),u=F(o)?2:1,l=F(o)?o.secondary_order_comment_id:o.order_comment_id,m=g.value.get(n);if(m==="like"){try{const i=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"like"},body:JSON.stringify({like:!0,level:u,id:l,cancel:!0})});if(!i.ok)throw new Error("Network response was not ok");(await i.json()).success&&(o.helpful-=1,g.value.delete(n),c.success("已取消点赞"))}catch(i){console.error("Error handling like:",i),c.error("操作失败，请稍后重试")}return}if(m==="dislike"){c.warning("您已经点过踩了，如需点赞请先取消点踩");return}try{const i=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"like"},body:JSON.stringify({like:!0,level:u,id:l,cancel:!1})});if(!i.ok)throw new Error("Network response was not ok");(await i.json()).success&&(o.helpful+=1,g.value.set(n,"like"),c.success("点赞成功"))}catch(i){console.error("Error handling like:",i),c.error("操作失败，请稍后重试")}}async function se(o){const n=H(o),u=F(o)?2:1,l=F(o)?o.secondary_order_comment_id:o.order_comment_id,m=g.value.get(n);if(m==="dislike"){try{const i=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"like"},body:JSON.stringify({like:!1,level:u,id:l,cancel:!0})});if(!i.ok)throw new Error("Network response was not ok");(await i.json()).success&&(o.unhelpful-=1,g.value.delete(n),c.success("已取消点踩"))}catch(i){console.error("Error handling dislike:",i),c.error("操作失败，请稍后重试")}return}if(m==="like"){c.warning("您已经点过赞了，如需点踩请先取消点赞");return}try{const i=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"like"},body:JSON.stringify({like:!1,level:u,id:l,cancel:!1})});if(!i.ok)throw new Error("Network response was not ok");(await i.json()).success&&(o.unhelpful+=1,g.value.set(n,"dislike"),c.success("点踩成功"))}catch(i){console.error("Error handling dislike:",i),c.error("操作失败，请稍后重试")}}return ae(()=>{document.addEventListener("click",C),P(),G()}),le(()=>{document.removeEventListener("click",C)}),{goodsDetail:E,orderDetail:t,sellerPicture:j,canRequestRefund:D,confirmDelivery:U,requestRefund:s,getOrderStatusText:a,contactSeller:z,comments:Y,newComment:q,submitComment:Z,toggleReply:$,formatTime:oe,base64ToBlob:p,toggleDropdown:M,closeDropdown:C,viewProfile:J,viewNotifications:A,viewMessages:N,contactUs:B,userAvatar:L,commentActions:g,activeReplyId:S,replyContent:k,getCommentAction:te,handleLike:re,handleDislike:se,submitReply:ee,commentRating:V}}},he={class:"order-details-view"},pe={class:"header"},ge={class:"nav-container"},ye={class:"user-section"},we=["src"],ke={key:0,class:"dropdown-menu"},be={class:"good-details"},Ce={class:"good-info"},Se={class:"good-images"},Oe=["src","alt"],Te={class:"good-details-info"},Ee={class:"price"},je={class:"deal-time"},Re={class:"seller-info"},Ae=["src"],Ne={class:"order-actions"},De={class:"order-status"},Pe={class:"good-description"},Ue={class:"comments-section"},qe={class:"comment-input"},Ve={class:"rating-section"},Fe={class:"comments-list"},xe={class:"comment-main"},Ie=["src"],Le={class:"comment-content"},Me={class:"comment-header"},Je={class:"comment-user"},Be={class:"comment-rating"},ze={class:"comment-text"},Ye={class:"comment-footer"},Ge={class:"comment-time"},He={class:"comment-actions"},Ke=["onClick"],Qe=["onClick"],We={class:"count"},Xe=["onClick"],Ze={class:"count"},$e={key:0,class:"reply-input-container"},eo={class:"reply-actions"},oo=["onClick"],to=["onClick"],ro={key:1,class:"reply-list"},so=["src"],no={class:"comment-content"},io={class:"comment-user"},ao={class:"comment-text"},lo={class:"comment-footer"},co={class:"comment-time"},uo={class:"comment-actions"},_o=["onClick"],mo={class:"count"},fo=["onClick"],vo={class:"count"};function ho(d,r,E,t,j,R){var D,p,P,U;const L=w("Bell"),M=w("el-icon"),C=w("el-carousel-item"),J=w("el-carousel"),A=w("el-button"),N=w("el-rate"),B=w("el-input");return v(),h("div",he,[e("header",pe,[e("div",ge,[r[10]||(r[10]=e("div",{class:"welcome-text"},"欢迎使用二手交易平台",-1)),e("div",ye,[e("button",{class:"announcement-btn",onClick:r[0]||(r[0]=(...s)=>d.fetchAnnouncements&&d.fetchAnnouncements(...s))},[y(M,null,{default:T(()=>[y(L)]),_:1})]),e("div",{class:"user-profile",onClick:r[6]||(r[6]=ce(()=>{},["stop"]))},[e("img",{src:t.userAvatar,alt:"用户头像",class:"avatar",onClick:r[1]||(r[1]=(...s)=>t.toggleDropdown&&t.toggleDropdown(...s))},null,8,we),d.dropdownVisible?(v(),h("div",ke,[e("button",{onClick:r[2]||(r[2]=(...s)=>t.viewProfile&&t.viewProfile(...s))},"个人信息"),e("button",{onClick:r[3]||(r[3]=(...s)=>t.viewNotifications&&t.viewNotifications(...s))},"我的通知"),e("button",{onClick:r[4]||(r[4]=(...s)=>t.viewMessages&&t.viewMessages(...s))},"我的消息"),e("button",{onClick:r[5]||(r[5]=(...s)=>t.contactUs&&t.contactUs(...s))},"联系我们")])):K("",!0)])])])]),e("div",be,[e("div",Ce,[e("div",Se,[y(J,{height:"400px"},{default:T(()=>[(v(!0),h(Q,null,W(t.goodsDetail.goods_pictures,(s,a)=>(v(),ue(C,{key:a},{default:T(()=>[e("img",{src:s,alt:`商品图片${a+1}`,class:"carousel-image"},null,8,Oe)]),_:2},1024))),128))]),_:1})]),e("div",Te,[e("h1",null,_((D=t.goodsDetail)==null?void 0:D.goods_name),1),e("div",Ee,"¥"+_((p=t.goodsDetail)==null?void 0:p.goods_price),1),e("div",je,"下单时间："+_(t.formatTime((P=t.orderDetail)==null?void 0:P.deal_time)),1),e("div",Re,[e("img",{src:t.sellerPicture,alt:"卖家头像",class:"seller-avatar"},null,8,Ae),y(A,{type:"text",onClick:t.contactSeller},{default:T(()=>r[11]||(r[11]=[X("联系卖家")])),_:1},8,["onClick"])]),e("div",Ne,[e("div",De," 订单状态："+_(t.getOrderStatusText(t.orderDetail.order_state)),1)])])]),e("div",Pe,[r[12]||(r[12]=e("h2",null,"商品描述",-1)),e("p",null,_((U=t.goodsDetail)==null?void 0:U.goods_description),1)]),e("div",Ue,[r[19]||(r[19]=e("h2",null,"评价区",-1)),e("div",qe,[e("div",Ve,[r[13]||(r[13]=e("span",{class:"rating-label"},"评分：",-1)),y(N,{modelValue:t.commentRating,"onUpdate:modelValue":r[7]||(r[7]=s=>t.commentRating=s),colors:["#FF9900","#FF9900","#FF9900"],texts:["1星","2星","3星","4星","5星"],"show-text":""},null,8,["modelValue"])]),y(B,{modelValue:t.newComment,"onUpdate:modelValue":r[8]||(r[8]=s=>t.newComment=s),type:"textarea",rows:3,placeholder:"说说你的想法..."},null,8,["modelValue"]),y(A,{type:"primary",onClick:t.submitComment,disabled:!t.newComment.trim()||!t.commentRating},{default:T(()=>r[14]||(r[14]=[X(" 发表评论 ")])),_:1},8,["onClick","disabled"])]),e("div",Fe,[(v(!0),h(Q,null,W(t.comments,s=>(v(),h("div",{key:s.order_comment_id,class:"comment-item"},[e("div",xe,[e("img",{src:s.deliver_picture,alt:"用户头像",class:"comment-avatar"},null,8,Ie),e("div",Le,[e("div",Me,[e("div",Je,_(s.deliver_name),1),e("div",Be,[y(N,{modelValue:s.order_grade,"onUpdate:modelValue":a=>s.order_grade=a,disabled:"","show-score":"","text-color":"#ff9900",colors:["#FF9900","#FF9900","#FF9900"]},null,8,["modelValue","onUpdate:modelValue"])])]),e("div",ze,_(s.comment),1),e("div",Ye,[e("span",Ge,_(t.formatTime(s.comment_time)),1),e("div",He,[e("button",{class:"action-btn reply-btn",onClick:a=>t.toggleReply(s)},_(t.activeReplyId===s.order_comment_id?"取消回复":"回复"),9,Ke),e("button",{class:I(["action-btn like-btn",{active:t.getCommentAction(s)==="like"}]),onClick:a=>t.handleLike(s)},[r[15]||(r[15]=e("i",{class:"fas fa-thumbs-up thumb-icon"},null,-1)),e("span",We,_(s.helpful),1)],10,Qe),e("button",{class:I(["action-btn dislike-btn",{active:t.getCommentAction(s)==="dislike"}]),onClick:a=>t.handleDislike(s)},[r[16]||(r[16]=e("i",{class:"fas fa-thumbs-down thumb-icon"},null,-1)),e("span",Ze,_(s.unhelpful),1)],10,Xe)])])])]),t.activeReplyId===s.order_comment_id?(v(),h("div",$e,[_e(e("textarea",{"onUpdate:modelValue":r[9]||(r[9]=a=>t.replyContent=a),placeholder:"写下你的回复...",rows:"2",class:"reply-textarea"},null,512),[[me,t.replyContent]]),e("div",eo,[e("button",{class:"cancel-btn",onClick:a=>t.toggleReply(s)},"取消",8,oo),e("button",{class:"submit-btn",onClick:a=>t.submitReply(s.order_comment_id)},"发送",8,to)])])):K("",!0),s.reply&&s.reply.length>0?(v(),h("div",ro,[(v(!0),h(Q,null,W(s.reply,a=>(v(),h("div",{key:a.secondary_order_comment_id,class:"reply-item"},[e("img",{src:a.deliver_picture,alt:"用户头像",class:"comment-avatar"},null,8,so),e("div",no,[e("div",io,_(a.deliver_name),1),e("div",ao,_(a.comment),1),e("div",lo,[e("span",co,_(t.formatTime(a.comment_time)),1),e("div",uo,[e("button",{class:I(["action-btn like-btn",{active:t.getCommentAction(a)==="like"}]),onClick:z=>t.handleLike(a)},[r[17]||(r[17]=e("i",{class:"fas fa-thumbs-up thumb-icon"},null,-1)),e("span",mo,_(a.helpful),1)],10,_o),e("button",{class:I(["action-btn dislike-btn",{active:t.getCommentAction(a)==="dislike"}]),onClick:z=>t.handleDislike(a)},[r[18]||(r[18]=e("i",{class:"fas fa-thumbs-down thumb-icon"},null,-1)),e("span",vo,_(a.unhelpful),1)],10,fo)])])])]))),128))])):K("",!0)]))),128))])])])])}const go=ne(ve,[["render",ho],["__scopeId","data-v-6b741f7b"]]);export{go as default};
