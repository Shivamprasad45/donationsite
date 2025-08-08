"use strict";(()=>{var e={};e.id=966,e.ids=[966],e.modules={11185:e=>{e.exports=require("mongoose")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},78893:e=>{e.exports=require("buffer")},84770:e=>{e.exports=require("crypto")},76162:e=>{e.exports=require("stream")},21764:e=>{e.exports=require("util")},16765:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>y,patchFetch:()=>f,requestAsyncStorage:()=>l,routeModule:()=>m,serverHooks:()=>h,staticGenerationAsyncStorage:()=>g});var n={};r.r(n),r.d(n,{GET:()=>c});var o=r(73278),i=r(45002),a=r(54877),s=r(71309),p=r(1035),d=r(35522),u=r(16910);async function c(e,{params:t}){try{await (0,p.Z)();let r=await (0,u.Ym)(e);if(!r)return s.NextResponse.json({error:"Authentication required"},{status:401});let n=await d.Z.findById(t.id).populate("donor","name email address").populate("charity","name registrationNumber location");if(!n)return s.NextResponse.json({error:"Donation not found"},{status:404});if("user"===r.role&&n.donor._id.toString()!==r.userId||"charity"===r.role&&n.charity._id.toString()!==r.charityId)return s.NextResponse.json({error:"Unauthorized"},{status:403});let o=`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Donation Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 40px; }
          .receipt-details { margin: 20px 0; }
          .amount { font-size: 24px; font-weight: bold; color: #2563eb; }
          .footer { margin-top: 40px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Donation Receipt</h1>
          <p>Receipt Number: ${n.receiptNumber}</p>
        </div>
        
        <div class="receipt-details">
          <h3>Donor Information:</h3>
          <p><strong>Name:</strong> ${n.donor.name}</p>
          <p><strong>Email:</strong> ${n.donor.email}</p>
          
          <h3>Charity Information:</h3>
          <p><strong>Name:</strong> ${n.charity.name}</p>
          <p><strong>Registration Number:</strong> ${n.charity.registrationNumber}</p>
          
          <h3>Donation Details:</h3>
          <p><strong>Amount:</strong> <span class="amount">${n.currency} ${n.amount}</span></p>
          <p><strong>Date:</strong> ${n.createdAt.toLocaleDateString()}</p>
          <p><strong>Payment Method:</strong> ${n.paymentMethod}</p>
          <p><strong>Transaction ID:</strong> ${n.transactionId}</p>
          ${n.message?`<p><strong>Message:</strong> ${n.message}</p>`:""}
          ${n.dedicatedTo?`<p><strong>Dedicated To:</strong> ${n.dedicatedTo}</p>`:""}
        </div>
        
        <div class="footer">
          <p>This receipt is for tax deduction purposes. Please keep it for your records.</p>
          <p>Thank you for your generous donation!</p>
        </div>
      </body>
      </html>
    `;return new s.NextResponse(o,{headers:{"Content-Type":"text/html","Content-Disposition":`attachment; filename="receipt-${n.receiptNumber}.html"`}})}catch(e){return console.error("Generate receipt error:",e),s.NextResponse.json({error:"Internal server error"},{status:500})}}let m=new o.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/donations/[id]/receipt/route",pathname:"/api/donations/[id]/receipt",filename:"route",bundlePath:"app/api/donations/[id]/receipt/route"},resolvedPagePath:"C:\\Users\\Shivam\\Desktop\\charity-donation-backend (1)\\app\\api\\donations\\[id]\\receipt\\route.ts",nextConfigOutput:"",userland:n}),{requestAsyncStorage:l,staticGenerationAsyncStorage:g,serverHooks:h}=m,y="/api/donations/[id]/receipt/route";function f(){return(0,a.patchFetch)({serverHooks:h,staticGenerationAsyncStorage:g})}},16910:(e,t,r)=>{r.d(t,{RA:()=>a,Ym:()=>s});var n=r(67390),o=r.n(n);let i=process.env.JWT_SECRET;if(!i)throw Error("Please define the JWT_SECRET environment variable");function a(e){return o().sign(e,i,{expiresIn:"7d"})}async function s(e){try{let t=function(e){let t=e.headers.get("authorization");return t&&t.startsWith("Bearer ")?t.substring(7):null}(e);if(!t)return null;return o().verify(t,i)}catch(e){return null}}},1035:(e,t,r)=>{r.d(t,{Z:()=>s});var n=r(11185),o=r.n(n);let i=process.env.MONGODB_URI;if(!i)throw Error("Please define the MONGODB_URI environment variable inside .env.local");let a=global.mongoose;a||(a=global.mongoose={conn:null,promise:null});let s=async function(){if(a.conn)return a.conn;a.promise||(a.promise=o().connect(i,{bufferCommands:!1}).then(e=>e));try{a.conn=await a.promise}catch(e){throw a.promise=null,e}return a.conn}},35522:(e,t,r)=>{r.d(t,{Z:()=>a});var n=r(11185),o=r.n(n);let i=new n.Schema({donor:{type:n.Schema.Types.ObjectId,ref:"User",required:[!0,"Donor is required"]},charity:{type:n.Schema.Types.ObjectId,ref:"Charity",required:[!0,"Charity is required"]},amount:{type:Number,required:[!0,"Amount is required"],min:[1,"Amount must be at least 1"]},currency:{type:String,required:[!0,"Currency is required"],enum:["USD","INR","EUR","GBP"],default:"USD"},paymentMethod:{type:String,required:[!0,"Payment method is required"],enum:["stripe","razorpay"]},paymentId:{type:String,required:[!0,"Payment ID is required"]},paymentStatus:{type:String,enum:["pending","completed","failed","refunded"],default:"pending"},transactionId:String,isAnonymous:{type:Boolean,default:!1},message:{type:String,maxlength:[500,"Message cannot exceed 500 characters"]},dedicatedTo:{type:String,maxlength:[100,"Dedication cannot exceed 100 characters"]},receiptUrl:String,receiptNumber:{type:String},taxDeductible:{type:Boolean,default:!0},refundReason:String,refundedAt:Date,metadata:{campaignId:String,source:String,utm:{source:String,medium:String,campaign:String}}},{timestamps:!0});i.pre("save",function(e){if(!this.receiptNumber){let e=Date.now().toString(),t=Math.random().toString(36).substring(2,8).toUpperCase();this.receiptNumber=`RCP-${e}-${t}`}e()});let a=o().models.Donation||o().model("Donation",i)}};var t=require("../../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),n=t.X(0,[379,833,390],()=>r(16765));module.exports=n})();