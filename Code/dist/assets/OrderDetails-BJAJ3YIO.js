import{_ as se,b as ne,p as ie,r as f,d as b,c as ae,o as le,a as ce,e as h,f as e,w as de,g as K,h as y,i as V,t as _,F as Q,j as W,u as ue,E as c,k as w,l as v,m as _e,n as me,q as F,s as fe,v as ve,x as he}from"./index-CO6cX0Um.js";const pe={components:{Bell:ne,Phone:ie},setup(){const d=ue(),r=he(),T=f({}),t=f({}),E=f(""),j=f(!1),I=f(d.query.userAvatar||b);function L(o){o.stopPropagation(),j.value=!j.value}function C(o){o.target.closest(".user-profile")||(j.value=!1)}function M(){r.push({name:"UserProfile",query:{user_id:d.query.current_user_id,current_user_id:d.query.current_user_id,userAvatar:d.query.userAvatar,viewing_own_profile:"true"}})}function R(){console.log("查看通知")}function J(){console.log("查看消息")}function B(){console.log("联系我们")}const N=ae(()=>["已下单","已送达"].includes(t.value.order_state));function p(o){try{const n=atob(o),u=[];for(let l=0;l<n.length;l+=512){const m=n.slice(l,l+512),i=new Array(m.length);for(let x=0;x<m.length;x++)i[x]=m.charCodeAt(x);const O=new Uint8Array(i);u.push(O)}return new Blob(u,{type:"image/jpeg"})}catch(n){return console.error("Error converting base64 to Blob:",n),null}}async function P(){try{const o=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"get_order_detail"},body:JSON.stringify({goods_id:d.params.orderId,user_id:d.query.current_user_id})});if(!o.ok)throw new Error("获取订单详情失败");const n=await o.json();console.log(n),n.success&&(t.value=n.order_detail,console.log(t.value),T.value={...n.goods_detail,goods_pictures:n.goods_detail.goods_pictures.map(u=>{if(u&&typeof u=="string")try{return URL.createObjectURL(p(u))}catch(l){return console.error("Error converting picture:",l),b}return b})},E.value=n.goods_detail.seller_picture?URL.createObjectURL(p(n.goods_detail.seller_picture)):b)}catch(o){console.error("Error fetching order detail:",o),c.error("获取订单详情失败")}}async function A(){try{const o=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"confirm_delivery"},body:JSON.stringify({goods_id:d.params.orderId,user_id:d.query.current_user_id})});if(!o.ok)throw new Error("确认送达失败");(await o.json()).success&&(c.success("确认送达成功"),t.value.order_state="已送达")}catch(o){console.error("Error confirming delivery:",o),c.error("确认送达失败")}}async function s(){try{const o=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"request_refund"},body:JSON.stringify({goods_id:d.params.orderId,user_id:d.query.current_user_id})});if(!o.ok)throw new Error("申请退款失败");(await o.json()).success&&(c.success("退款申请已提交"),t.value.order_state="已退款")}catch(o){console.error("Error requesting refund:",o),c.error("申请退款失败")}}function a(o){return o||"未知状态"}function z(){r.push({name:"UserProfile",query:{user_id:T.value.seller_id,current_user_id:d.query.current_user_id,userAvatar:E.value,isOwner:!1,viewing_own_profile:"false"}})}const Y=f([]),D=f(""),g=f(new Map),S=f(null),k=f(""),U=f(0);async function G(){try{const o=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"comments"},body:JSON.stringify({goods_id:d.params.orderId,user_id:d.query.current_user_id})});if(!o.ok)throw new Error("Failed to fetch comments");const u=(await o.json()).map(l=>{const m={...l,level:1,deliver_picture:l.picture?URL.createObjectURL(p(l.picture)):b};return l.reply&&Array.isArray(l.reply)&&(m.reply=l.reply.map(i=>({...i,level:2,deliver_picture:i.picture?URL.createObjectURL(p(i.picture)):b}))),m});Y.value=u,console.log("评论列表：",Y.value)}catch(o){console.error("Error fetching comments:",o),c.error("获取评论失败")}}async function X(){if(!D.value.trim()){c.warning("评论内容不能为空");return}if(!U.value){c.warning("请给出评分");return}try{const o=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"commit_comment"},body:JSON.stringify({goods_id:d.params.orderId,comment:D.value,deliver_id:d.query.current_user_id,order_grade:U.value})});if(!o.ok)throw new Error("Network response was not ok");(await o.json()).success?(c.success("评论发表成功！"),await G(),D.value="",U.value=0):c.error("评论发表失败，请重试")}catch(o){console.error("Error submitting comment:",o),c.error("评论发表失败，请稍后重试")}}function Z(o){S.value===o.order_comment_id?(S.value=null,k.value=""):(S.value=o.order_comment_id,k.value="")}async function $(o){if(!k.value.trim()){c.warning("回复内容不能为空");return}try{const n=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"commit_reply"},body:JSON.stringify({order_comment_id:o,comment:k.value,deliver_id:d.query.current_user_id})});if(!n.ok)throw new Error("Network response was not ok");(await n.json()).success?(c.success("回复成功"),k.value="",S.value=null,await G()):c.error("回复失败，请重试")}catch(n){console.error("Error submitting reply:",n),c.error("回复失败，请稍后重试")}}function ee(o){if(!o)return"暂无时间信息";try{const n=new Date(o),l=new Date-n;return l<6e4?"刚刚":l<36e5?`${Math.floor(l/6e4)}分钟前`:l<864e5?`${Math.floor(l/36e5)}小时前`:`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`}catch(n){return console.error("Error formatting time:",n),"时间格式错误"}}function q(o){return o.level===2}function H(o){return o.level===2?`reply_${o.secondary_order_comment_id}`:`comment_${o.order_comment_id}`}function oe(o){const n=H(o);return g.value.get(n)||null}async function te(o){const n=H(o),u=q(o)?2:1,l=q(o)?o.secondary_order_comment_id:o.order_comment_id,m=g.value.get(n);if(m==="like"){try{const i=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"like"},body:JSON.stringify({like:!0,level:u,id:l,cancel:!0})});if(!i.ok)throw new Error("Network response was not ok");(await i.json()).success&&(o.helpful-=1,g.value.delete(n),c.success("已取消点赞"))}catch(i){console.error("Error handling like:",i),c.error("操作失败，请稍后重试")}return}if(m==="dislike"){c.warning("您已经点过踩了，如需点赞请先取消点踩");return}try{const i=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"like"},body:JSON.stringify({like:!0,level:u,id:l,cancel:!1})});if(!i.ok)throw new Error("Network response was not ok");(await i.json()).success&&(o.helpful+=1,g.value.set(n,"like"),c.success("点赞成功"))}catch(i){console.error("Error handling like:",i),c.error("操作失败，请稍后重试")}}async function re(o){const n=H(o),u=q(o)?2:1,l=q(o)?o.secondary_order_comment_id:o.order_comment_id,m=g.value.get(n);if(m==="dislike"){try{const i=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"like"},body:JSON.stringify({like:!1,level:u,id:l,cancel:!0})});if(!i.ok)throw new Error("Network response was not ok");(await i.json()).success&&(o.unhelpful-=1,g.value.delete(n),c.success("已取消点踩"))}catch(i){console.error("Error handling dislike:",i),c.error("操作失败，请稍后重试")}return}if(m==="like"){c.warning("您已经点过赞了，如需点踩请先取消点赞");return}try{const i=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"like"},body:JSON.stringify({like:!1,level:u,id:l,cancel:!1})});if(!i.ok)throw new Error("Network response was not ok");(await i.json()).success&&(o.unhelpful+=1,g.value.set(n,"dislike"),c.success("点踩成功"))}catch(i){console.error("Error handling dislike:",i),c.error("操作失败，请稍后重试")}}return le(()=>{document.addEventListener("click",C),P(),G()}),ce(()=>{document.removeEventListener("click",C)}),{goodsDetail:T,orderDetail:t,sellerPicture:E,canRequestRefund:N,confirmDelivery:A,requestRefund:s,getOrderStatusText:a,contactSeller:z,comments:Y,newComment:D,submitComment:X,toggleReply:Z,formatTime:ee,base64ToBlob:p,toggleDropdown:L,closeDropdown:C,viewProfile:M,viewNotifications:R,viewMessages:J,contactUs:B,userAvatar:I,commentActions:g,activeReplyId:S,replyContent:k,getCommentAction:oe,handleLike:te,handleDislike:re,submitReply:$,commentRating:U}}},ge={class:"order-details-view"},ye={class:"header"},we={class:"nav-container"},ke={class:"user-section"},be={key:0,class:"dropdown-menu"},Ce={class:"good-details"},Se={class:"good-info"},Oe={class:"good-images"},Te=["src","alt"],Ee={class:"good-details-info"},je={class:"price"},Re={class:"deal-time"},Ne={class:"seller-info"},Pe=["src"],Ae={class:"order-actions"},De={class:"order-status"},Ue={class:"good-description"},qe={class:"comments-section"},xe={class:"comment-input"},Ve={class:"rating-section"},Fe={class:"comments-list"},Ie={class:"comment-main"},Le=["src"],Me={class:"comment-content"},Je={class:"comment-header"},Be={class:"comment-user"},ze={class:"comment-rating"},Ye={class:"comment-text"},Ge={class:"comment-footer"},He={class:"comment-time"},Ke={class:"comment-actions"},Qe=["onClick"],We=["onClick"],Xe={class:"count"},Ze=["onClick"],$e={class:"count"},eo={key:0,class:"reply-input-container"},oo={class:"reply-actions"},to=["onClick"],ro=["onClick"],so={key:1,class:"reply-list"},no=["src"],io={class:"comment-content"},ao={class:"comment-user"},lo={class:"comment-text"},co={class:"comment-footer"},uo={class:"comment-time"},_o={class:"comment-actions"},mo=["onClick"],fo={class:"count"},vo=["onClick"],ho={class:"count"};function po(d,r,T,t,E,j){var N,p,P,A;const I=w("el-carousel-item"),L=w("el-carousel"),C=w("Phone"),M=w("el-icon"),R=w("el-rate"),J=w("el-input"),B=w("el-button");return v(),h("div",ge,[e("header",ye,[e("div",we,[r[9]||(r[9]=e("div",{class:"welcome-text"},"欢迎使用二手交易平台",-1)),e("div",ke,[e("div",{class:"user-profile",onClick:r[4]||(r[4]=de(()=>{},["stop"]))},[d.dropdownVisible?(v(),h("div",be,[e("button",{onClick:r[0]||(r[0]=(...s)=>t.viewProfile&&t.viewProfile(...s))},"个人信息"),e("button",{onClick:r[1]||(r[1]=(...s)=>t.viewNotifications&&t.viewNotifications(...s))},"我的通知"),e("button",{onClick:r[2]||(r[2]=(...s)=>t.viewMessages&&t.viewMessages(...s))},"我的消息"),e("button",{onClick:r[3]||(r[3]=(...s)=>t.contactUs&&t.contactUs(...s))},"联系我们")])):K("",!0)])])])]),e("div",Ce,[e("div",Se,[e("div",Oe,[y(L,{height:"400px"},{default:V(()=>[(v(!0),h(Q,null,W(t.goodsDetail.goods_pictures,(s,a)=>(v(),_e(I,{key:a},{default:V(()=>[e("img",{src:s,alt:`商品图片${a+1}`,class:"carousel-image"},null,8,Te)]),_:2},1024))),128))]),_:1})]),e("div",Ee,[e("h1",null,_((N=t.goodsDetail)==null?void 0:N.goods_name),1),e("div",je,"¥"+_((p=t.goodsDetail)==null?void 0:p.goods_price),1),e("div",Re,"下单时间："+_(t.formatTime((P=t.orderDetail)==null?void 0:P.deal_time)),1),e("div",Ne,[e("img",{src:t.sellerPicture,alt:"卖家头像",class:"seller-avatar"},null,8,Pe),e("button",{class:"contact-btn",onClick:r[5]||(r[5]=(...s)=>t.contactSeller&&t.contactSeller(...s))},[y(M,null,{default:V(()=>[y(C)]),_:1}),r[10]||(r[10]=e("span",null,"联系卖家",-1))])]),e("div",Ae,[e("div",De," 订单状态："+_(t.getOrderStatusText(t.orderDetail.order_state)),1)])])]),e("div",Ue,[r[11]||(r[11]=e("h2",null,"商品描述",-1)),e("p",null,_((A=t.goodsDetail)==null?void 0:A.goods_description),1)]),e("div",qe,[r[18]||(r[18]=e("h2",null,"评价区",-1)),e("div",xe,[e("div",Ve,[r[12]||(r[12]=e("span",{class:"rating-label"},"评分：",-1)),y(R,{modelValue:t.commentRating,"onUpdate:modelValue":r[6]||(r[6]=s=>t.commentRating=s),colors:["#FF9900","#FF9900","#FF9900"],texts:["1星","2星","3星","4星","5星"],"show-text":""},null,8,["modelValue"])]),y(J,{modelValue:t.newComment,"onUpdate:modelValue":r[7]||(r[7]=s=>t.newComment=s),type:"textarea",rows:3,placeholder:"说说你的想法..."},null,8,["modelValue"]),y(B,{type:"primary",onClick:t.submitComment,disabled:!t.newComment.trim()||!t.commentRating},{default:V(()=>r[13]||(r[13]=[me(" 发表评论 ")])),_:1},8,["onClick","disabled"])]),e("div",Fe,[(v(!0),h(Q,null,W(t.comments,s=>(v(),h("div",{key:s.order_comment_id,class:"comment-item"},[e("div",Ie,[e("img",{src:s.deliver_picture,alt:"用户头像",class:"comment-avatar"},null,8,Le),e("div",Me,[e("div",Je,[e("div",Be,_(s.deliver_name),1),e("div",ze,[y(R,{modelValue:s.order_grade,"onUpdate:modelValue":a=>s.order_grade=a,disabled:"","show-score":"","text-color":"#ff9900",colors:["#FF9900","#FF9900","#FF9900"]},null,8,["modelValue","onUpdate:modelValue"])])]),e("div",Ye,_(s.comment),1),e("div",Ge,[e("span",He,_(t.formatTime(s.comment_time)),1),e("div",Ke,[e("button",{class:"action-btn reply-btn",onClick:a=>t.toggleReply(s)},_(t.activeReplyId===s.order_comment_id?"取消回复":"回复"),9,Qe),e("button",{class:F(["action-btn like-btn",{active:t.getCommentAction(s)==="like"}]),onClick:a=>t.handleLike(s)},[r[14]||(r[14]=e("i",{class:"fas fa-thumbs-up thumb-icon"},null,-1)),e("span",Xe,_(s.helpful),1)],10,We),e("button",{class:F(["action-btn dislike-btn",{active:t.getCommentAction(s)==="dislike"}]),onClick:a=>t.handleDislike(s)},[r[15]||(r[15]=e("i",{class:"fas fa-thumbs-down thumb-icon"},null,-1)),e("span",$e,_(s.unhelpful),1)],10,Ze)])])])]),t.activeReplyId===s.order_comment_id?(v(),h("div",eo,[fe(e("textarea",{"onUpdate:modelValue":r[8]||(r[8]=a=>t.replyContent=a),placeholder:"写下你的回复...",rows:"2",class:"reply-textarea"},null,512),[[ve,t.replyContent]]),e("div",oo,[e("button",{class:"cancel-btn",onClick:a=>t.toggleReply(s)},"取消",8,to),e("button",{class:"submit-btn",onClick:a=>t.submitReply(s.order_comment_id)},"发送",8,ro)])])):K("",!0),s.reply&&s.reply.length>0?(v(),h("div",so,[(v(!0),h(Q,null,W(s.reply,a=>(v(),h("div",{key:a.secondary_order_comment_id,class:"reply-item"},[e("img",{src:a.deliver_picture,alt:"用户头像",class:"comment-avatar"},null,8,no),e("div",io,[e("div",ao,_(a.deliver_name),1),e("div",lo,_(a.comment),1),e("div",co,[e("span",uo,_(t.formatTime(a.comment_time)),1),e("div",_o,[e("button",{class:F(["action-btn like-btn",{active:t.getCommentAction(a)==="like"}]),onClick:z=>t.handleLike(a)},[r[16]||(r[16]=e("i",{class:"fas fa-thumbs-up thumb-icon"},null,-1)),e("span",fo,_(a.helpful),1)],10,mo),e("button",{class:F(["action-btn dislike-btn",{active:t.getCommentAction(a)==="dislike"}]),onClick:z=>t.handleDislike(a)},[r[17]||(r[17]=e("i",{class:"fas fa-thumbs-down thumb-icon"},null,-1)),e("span",ho,_(a.unhelpful),1)],10,vo)])])])]))),128))])):K("",!0)]))),128))])])])])}const yo=se(pe,[["render",po],["__scopeId","data-v-20dc9889"]]);export{yo as default};
