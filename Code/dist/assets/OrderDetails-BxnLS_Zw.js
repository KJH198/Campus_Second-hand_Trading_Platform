import{_ as de,r as k,d as b,c as ce,o as ue,a as _e,b as p,e as t,f as C,w as v,g as fe,h as j,t as _,i as H,F as K,j as Q,u as me,E as d,k as S,l as m,m as J,n as x,p as ke,v as pe,q as ye}from"./index-C0yCd1yE.js";const he={setup(){const l=me(),r=ye(),N=k({}),s=k({}),R=k(""),D=k(!1),M=k(l.query.userAvatar||b);function V(e){e.stopPropagation(),D.value=!D.value}function O(e){e.target.closest(".user-profile")||(D.value=!1)}function B(){r.push({name:"UserProfile",query:{user_id:l.query.current_user_id,current_user_id:l.query.current_user_id,userAvatar:l.query.userAvatar,viewing_own_profile:"true"}})}function g(){console.log("查看通知")}function F(){console.log("查看消息")}function q(){console.log("联系我们")}const A=ce(()=>["已下单","已送达"].includes(s.value.order_state));function y(e){try{const o=atob(e),i=[];for(let a=0;a<o.length;a+=512){const f=o.slice(a,a+512),c=new Array(f.length);for(let L=0;L<f.length;L++)c[L]=f.charCodeAt(L);const E=new Uint8Array(c);i.push(E)}return new Blob(i,{type:"image/jpeg"})}catch(o){return console.error("Error converting base64 to Blob:",o),null}}async function P(){try{const e=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"get_order_detail"},body:JSON.stringify({goods_id:l.params.orderId,user_id:l.query.current_user_id})});if(!e.ok)throw new Error("获取订单详情失败");const o=await e.json();console.log(o),o.success&&(s.value=o.order_detail,console.log(s.value),N.value={...o.goods_detail,goods_pictures:o.goods_detail.goods_pictures.map(i=>{if(i&&typeof i=="string")try{return URL.createObjectURL(y(i))}catch(a){return console.error("Error converting picture:",a),b}return b})},R.value=o.goods_detail.seller_picture?URL.createObjectURL(y(o.goods_detail.seller_picture)):b)}catch(e){console.error("Error fetching order detail:",e),d.error("获取订单详情失败")}}async function n(){try{const e=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"confirm_delivery"},body:JSON.stringify({goods_id:l.params.orderId,user_id:l.query.current_user_id})});if(!e.ok)throw new Error("确认送达失败");(await e.json()).success&&(d.success("确认送达成功"),s.value.order_state="已送达")}catch(e){console.error("Error confirming delivery:",e),d.error("确认送达失败")}}async function u(){try{const e=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"request_refund"},body:JSON.stringify({goods_id:l.params.orderId,user_id:l.query.current_user_id})});if(!e.ok)throw new Error("申请退款失败");(await e.json()).success&&(d.success("退款申请已提交"),s.value.order_state="已退款")}catch(e){console.error("Error requesting refund:",e),d.error("申请退款失败")}}function z(e){return e||"未知状态"}function X(){r.push({name:"UserProfile",query:{user_id:N.value.seller_id,current_user_id:l.query.current_user_id,userAvatar:R.value,isOwner:!1,viewing_own_profile:"false"}})}const W=k([]),I=k(""),h=k(new Map),T=k(null),w=k("");async function Y(){try{const e=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"comments"},body:JSON.stringify({goods_id:l.params.orderId,user_id:l.query.current_user_id})});if(!e.ok)throw new Error("Failed to fetch comments");const i=(await e.json()).map(a=>{const f={...a,level:1,deliver_picture:a.deliver_picture?URL.createObjectURL(y(a.deliver_picture)):b};return a.reply&&Array.isArray(a.reply)&&(f.reply=a.reply.map(c=>({...c,level:2,deliver_picture:c.deliver_picture?URL.createObjectURL(y(c.deliver_picture)):b}))),f});W.value=i}catch(e){console.error("Error fetching comments:",e),d.error("获取评论失败")}}async function Z(){if(!I.value.trim()){d.warning("评论内容不能为空");return}try{const e=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"commit_comment"},body:JSON.stringify({goods_id:l.params.orderId,comment:I.value,deliver_id:l.query.current_user_id})});if(!e.ok)throw new Error("Network response was not ok");(await e.json()).success?(d.success("评论发表成功！"),await Y(),I.value=""):d.error("评论发表失败，请重试")}catch(e){console.error("Error submitting comment:",e),d.error("评论发表失败，请稍后重试")}}function $(e){T.value===e.goods_comment_id?(T.value=null,w.value=""):(T.value=e.goods_comment_id,w.value="")}async function ee(e){if(!w.value.trim()){d.warning("回复内容不能为空");return}try{const o=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"commit_reply"},body:JSON.stringify({goods_comment_id:e,second_goods_comment:w.value,deliver_id:l.query.current_user_id})});if(!o.ok)throw new Error("Network response was not ok");(await o.json()).success?(d.success("回复成功"),w.value="",T.value=null,await Y()):d.error("回复失败，请重试")}catch(o){console.error("Error submitting reply:",o),d.error("回复失败，请稍后重试")}}async function oe(e){try{const o=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"like_comment"},body:JSON.stringify({goods_id:l.params.orderId,comment_id:e.id,user_id:l.query.current_user_id})});if(!o.ok)throw new Error("点赞失败");const i=await o.json();i.success&&(e.liked=!e.liked,e.likes=i.likes,e.disliked&&(e.disliked=!1,e.dislikes=i.dislikes))}catch(o){console.error("Error liking comment:",o),d.error("点赞失败")}}async function te(e){try{const o=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"dislike_comment"},body:JSON.stringify({goods_id:l.params.orderId,comment_id:e.id,user_id:l.query.current_user_id})});if(!o.ok)throw new Error("踩失败");const i=await o.json();i.success&&(e.disliked=!e.disliked,e.dislikes=i.dislikes,e.liked&&(e.liked=!1,e.likes=i.likes))}catch(o){console.error("Error disliking comment:",o),d.error("操作失败")}}function se(e){if(!e)return"暂无时间信息";try{const o=new Date(e),a=new Date-o;return a<6e4?"刚刚":a<36e5?`${Math.floor(a/6e4)}分钟前`:a<864e5?`${Math.floor(a/36e5)}小时前`:`${o.getFullYear()}-${String(o.getMonth()+1).padStart(2,"0")}-${String(o.getDate()).padStart(2,"0")}`}catch(o){return console.error("Error formatting time:",o),"时间格式错误"}}async function re(e,o){try{const i=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"like_reply"},body:JSON.stringify({goods_id:l.params.orderId,comment_id:e.id,reply_id:o.id,user_id:l.query.current_user_id})});if(!i.ok)throw new Error("点赞失败");const a=await i.json();a.success&&(o.liked=!o.liked,o.likes=a.likes,o.disliked&&(o.disliked=!1,o.dislikes=a.dislikes))}catch(i){console.error("Error liking reply:",i),d.error("点赞失败")}}async function ne(e,o){try{const i=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"dislike_reply"},body:JSON.stringify({goods_id:l.params.orderId,comment_id:e.id,reply_id:o.id,user_id:l.query.current_user_id})});if(!i.ok)throw new Error("踩失败");const a=await i.json();a.success&&(o.disliked=!o.disliked,o.dislikes=a.dislikes,o.liked&&(o.liked=!1,o.likes=a.likes))}catch(i){console.error("Error disliking reply:",i),d.error("操作失败")}}function U(e){return e.level===2}function G(e){return e.level===2?`reply_${e.second_goods_comment_id}`:`comment_${e.goods_comment_id}`}function ie(e){const o=G(e);return h.value.get(o)||null}async function ae(e){const o=G(e),i=U(e)?2:1,a=U(e)?e.second_goods_comment_id:e.goods_comment_id,f=h.value.get(o);if(f==="like"){try{const c=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"like"},body:JSON.stringify({like:!0,level:i,id:a,cancel:!0})});if(!c.ok)throw new Error("Network response was not ok");(await c.json()).success&&(e.helpful-=1,h.value.delete(o),d.success("已取消点赞"))}catch(c){console.error("Error handling like:",c),d.error("操作失败，请稍后重试")}return}if(f==="dislike"){d.warning("您已经点过踩了，如需点赞请先取消点踩");return}try{const c=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"like"},body:JSON.stringify({like:!0,level:i,id:a,cancel:!1})});if(!c.ok)throw new Error("Network response was not ok");(await c.json()).success&&(e.helpful+=1,h.value.set(o,"like"),d.success("点赞成功"))}catch(c){console.error("Error handling like:",c),d.error("操作失败，请稍后重试")}}async function le(e){const o=G(e),i=U(e)?2:1,a=U(e)?e.second_goods_comment_id:e.goods_comment_id,f=h.value.get(o);if(f==="dislike"){try{const c=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"like"},body:JSON.stringify({like:!1,level:i,id:a,cancel:!0})});if(!c.ok)throw new Error("Network response was not ok");(await c.json()).success&&(e.unhelpful-=1,h.value.delete(o),d.success("已取消点踩"))}catch(c){console.error("Error handling dislike:",c),d.error("操作失败，请稍后重试")}return}if(f==="like"){d.warning("您已经点过赞了，如需点踩请先取消点赞");return}try{const c=await fetch("/order_detail",{method:"POST",headers:{"Content-Type":"application/json",type:"like"},body:JSON.stringify({like:!1,level:i,id:a,cancel:!1})});if(!c.ok)throw new Error("Network response was not ok");(await c.json()).success&&(e.unhelpful+=1,h.value.set(o,"dislike"),d.success("点踩成功"))}catch(c){console.error("Error handling dislike:",c),d.error("操作失败，请稍后重试")}}return ue(()=>{document.addEventListener("click",O),P(),Y()}),_e(()=>{document.removeEventListener("click",O)}),{goodsDetail:N,orderDetail:s,sellerPicture:R,canRequestRefund:A,confirmDelivery:n,requestRefund:u,getOrderStatusText:z,contactSeller:X,comments:W,newComment:I,submitComment:Z,toggleReply:$,likeComment:oe,dislikeComment:te,formatTime:se,likeReply:re,dislikeReply:ne,base64ToBlob:y,toggleDropdown:V,closeDropdown:O,viewProfile:B,viewNotifications:g,viewMessages:F,contactUs:q,userAvatar:M,commentActions:h,activeReplyId:T,replyContent:w,getCommentAction:ie,handleLike:ae,handleDislike:le,submitReply:ee}}},ve={class:"order-details-view"},ge={class:"header"},we={class:"nav-container"},be={class:"user-section"},Ce=["src"],Se={key:0,class:"dropdown-menu"},Oe={class:"good-details"},Te={class:"good-info"},Ee={class:"good-images"},je=["src","alt"],Ne={class:"good-details-info"},Re={class:"price"},De={class:"deal-time"},qe={class:"seller-info"},Ae=["src"],Pe={class:"order-actions"},Ie={class:"order-status"},Ue={class:"good-description"},Le={class:"comments-section"},Je={class:"comment-input"},xe={class:"comments-list"},Me={class:"comment-main"},Ve=["src"],Be={class:"comment-content"},Fe={class:"comment-user"},ze={class:"comment-text"},Ye={class:"comment-footer"},Ge={class:"comment-time"},He={class:"comment-actions"},Ke=["onClick"],Qe=["onClick"],We={class:"count"},Xe=["onClick"],Ze={class:"count"},$e={key:0,class:"reply-input-container"},eo={class:"reply-actions"},oo=["onClick"],to=["onClick"],so={key:1,class:"reply-list"},ro=["src"],no={class:"comment-content"},io={class:"comment-user"},ao={class:"comment-text"},lo={class:"comment-footer"},co={class:"comment-time"},uo={class:"comment-actions"},_o=["onClick"],fo={class:"count"},mo=["onClick"],ko={class:"count"};function po(l,r,N,s,R,D){var q,A,y,P;const M=S("Bell"),V=S("el-icon"),O=S("el-carousel-item"),B=S("el-carousel"),g=S("el-button"),F=S("el-input");return m(),p("div",ve,[t("header",ge,[t("div",we,[r[9]||(r[9]=t("div",{class:"welcome-text"},"欢迎使用二手交易平台",-1)),t("div",be,[t("button",{class:"announcement-btn",onClick:r[0]||(r[0]=(...n)=>l.fetchAnnouncements&&l.fetchAnnouncements(...n))},[C(V,null,{default:v(()=>[C(M)]),_:1})]),t("div",{class:"user-profile",onClick:r[6]||(r[6]=fe(()=>{},["stop"]))},[t("img",{src:s.userAvatar,alt:"用户头像",class:"avatar",onClick:r[1]||(r[1]=(...n)=>s.toggleDropdown&&s.toggleDropdown(...n))},null,8,Ce),l.dropdownVisible?(m(),p("div",Se,[t("button",{onClick:r[2]||(r[2]=(...n)=>s.viewProfile&&s.viewProfile(...n))},"个人信息"),t("button",{onClick:r[3]||(r[3]=(...n)=>s.viewNotifications&&s.viewNotifications(...n))},"我的通知"),t("button",{onClick:r[4]||(r[4]=(...n)=>s.viewMessages&&s.viewMessages(...n))},"我的消息"),t("button",{onClick:r[5]||(r[5]=(...n)=>s.contactUs&&s.contactUs(...n))},"联系我们")])):j("",!0)])])])]),t("div",Oe,[t("div",Te,[t("div",Ee,[C(B,{height:"400px"},{default:v(()=>[(m(!0),p(K,null,Q(s.goodsDetail.goods_pictures,(n,u)=>(m(),H(O,{key:u},{default:v(()=>[t("img",{src:n,alt:`商品图片${u+1}`,class:"carousel-image"},null,8,je)]),_:2},1024))),128))]),_:1})]),t("div",Ne,[t("h1",null,_((q=s.goodsDetail)==null?void 0:q.goods_name),1),t("div",Re,"¥"+_((A=s.goodsDetail)==null?void 0:A.goods_price),1),t("div",De,"下单时间："+_(s.formatTime((y=s.orderDetail)==null?void 0:y.deal_time)),1),t("div",qe,[t("img",{src:s.sellerPicture,alt:"卖家头像",class:"seller-avatar"},null,8,Ae),C(g,{type:"text",onClick:s.contactSeller},{default:v(()=>r[10]||(r[10]=[J("联系卖家")])),_:1},8,["onClick"])]),t("div",Pe,[t("div",Ie," 订单状态："+_(s.getOrderStatusText(s.orderDetail.order_state)),1),s.orderDetail.order_state==="已下单"?(m(),H(g,{key:0,type:"primary",onClick:s.confirmDelivery},{default:v(()=>r[11]||(r[11]=[J(" 确认送达 ")])),_:1},8,["onClick"])):j("",!0),s.canRequestRefund?(m(),H(g,{key:1,type:"danger",onClick:s.requestRefund},{default:v(()=>r[12]||(r[12]=[J(" 申请退款 ")])),_:1},8,["onClick"])):j("",!0)])])]),t("div",Ue,[r[13]||(r[13]=t("h2",null,"商品描述",-1)),t("p",null,_((P=s.goodsDetail)==null?void 0:P.goods_description),1)]),t("div",Le,[r[19]||(r[19]=t("h2",null,"评价区",-1)),t("div",Je,[C(F,{modelValue:s.newComment,"onUpdate:modelValue":r[7]||(r[7]=n=>s.newComment=n),type:"textarea",rows:3,placeholder:"说说你的想法..."},null,8,["modelValue"]),C(g,{type:"primary",onClick:s.submitComment,disabled:!s.newComment.trim()},{default:v(()=>r[14]||(r[14]=[J(" 发表评论 ")])),_:1},8,["onClick","disabled"])]),t("div",xe,[(m(!0),p(K,null,Q(s.comments,n=>(m(),p("div",{key:n.goods_comment_id,class:"comment-item"},[t("div",Me,[t("img",{src:n.deliver_picture,alt:"用户头像",class:"comment-avatar"},null,8,Ve),t("div",Be,[t("div",Fe,_(n.deliver_name),1),t("div",ze,_(n.comment),1),t("div",Ye,[t("span",Ge,_(s.formatTime(n.comment_time)),1),t("div",He,[t("button",{class:"action-btn reply-btn",onClick:u=>s.toggleReply(n)},_(s.activeReplyId===n.goods_comment_id?"取消回复":"回复"),9,Ke),t("button",{class:x(["action-btn like-btn",{active:s.getCommentAction(n)==="like"}]),onClick:u=>s.handleLike(n)},[r[15]||(r[15]=t("i",{class:"fas fa-thumbs-up thumb-icon"},null,-1)),t("span",We,_(n.helpful),1)],10,Qe),t("button",{class:x(["action-btn dislike-btn",{active:s.getCommentAction(n)==="dislike"}]),onClick:u=>s.handleDislike(n)},[r[16]||(r[16]=t("i",{class:"fas fa-thumbs-down thumb-icon"},null,-1)),t("span",Ze,_(n.unhelpful),1)],10,Xe)])])])]),s.activeReplyId===n.goods_comment_id?(m(),p("div",$e,[ke(t("textarea",{"onUpdate:modelValue":r[8]||(r[8]=u=>s.replyContent=u),placeholder:"写下你的回复...",rows:"2",class:"reply-textarea"},null,512),[[pe,s.replyContent]]),t("div",eo,[t("button",{class:"cancel-btn",onClick:u=>s.toggleReply(n)},"取消",8,oo),t("button",{class:"submit-btn",onClick:u=>s.submitReply(n.goods_comment_id)},"发送",8,to)])])):j("",!0),n.reply&&n.reply.length>0?(m(),p("div",so,[(m(!0),p(K,null,Q(n.reply,u=>(m(),p("div",{key:u.second_goods_comment_id,class:"reply-item"},[t("img",{src:u.deliver_picture,alt:"用户头像",class:"comment-avatar"},null,8,ro),t("div",no,[t("div",io,_(u.deliver_name),1),t("div",ao,_(u.comment),1),t("div",lo,[t("span",co,_(s.formatTime(u.comment_time)),1),t("div",uo,[t("button",{class:x(["action-btn like-btn",{active:s.getCommentAction(u)==="like"}]),onClick:z=>s.handleLike(u)},[r[17]||(r[17]=t("i",{class:"fas fa-thumbs-up thumb-icon"},null,-1)),t("span",fo,_(u.helpful),1)],10,_o),t("button",{class:x(["action-btn dislike-btn",{active:s.getCommentAction(u)==="dislike"}]),onClick:z=>s.handleDislike(u)},[r[18]||(r[18]=t("i",{class:"fas fa-thumbs-down thumb-icon"},null,-1)),t("span",ko,_(u.unhelpful),1)],10,mo)])])])]))),128))])):j("",!0)]))),128))])])])])}const ho=de(he,[["render",po],["__scopeId","data-v-4abda593"]]);export{ho as default};
