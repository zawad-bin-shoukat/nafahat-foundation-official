export function authFeedback(error,lang='en'){
 const code=error?.code||'',message=error instanceof Error?error.message:'';
 const messages={
  email_not_confirmed:['প্রথমে আপনার ইমেইলের নিশ্চিতকরণ লিংক খুলুন। ইমেইল না পেলে আবার পাঠানোর অপশন ব্যবহার করুন।','Confirm your email before signing in. Use “Confirmation email missing?” to request another link.'],
  invalid_credentials:['ইমেইল বা পাসওয়ার্ড সঠিক নয়। আবার চেষ্টা করুন অথবা পাসওয়ার্ড পুনরুদ্ধার করুন।','The email or password is incorrect. Try again or reset your password.'],
  over_email_send_rate_limit:['ইমেইল পাঠানোর সীমা পূর্ণ হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।','The email sending limit has been reached. Please wait before trying again.'],
  over_request_rate_limit:['অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।','Too many attempts. Please wait before trying again.'],
  email_address_not_authorized:['ইমেইল পাঠানোর সেবা এখনো প্রস্তুত নয়। ফাউন্ডেশনের অ্যাডমিনের সাথে যোগাযোগ করুন।','Email delivery is not ready for this address. Please contact the foundation administrator.'],
  signup_disabled:['নতুন অ্যাকাউন্ট নিবন্ধন আপাতত বন্ধ আছে।','New account registration is currently closed.'],
  weak_password:['আরও শক্তিশালী পাসওয়ার্ড দিন, কমপক্ষে ১২ অক্ষরের।','Choose a stronger password of at least 12 characters.'],
  same_password:['আগের পাসওয়ার্ডের থেকে আলাদা একটি নতুন পাসওয়ার্ড দিন।','Choose a new password different from your previous password.'],
  otp_expired:['নিশ্চিতকরণ লিংক বা কোডটির মেয়াদ শেষ হয়েছে। নতুন লিংক বা কোড চাইুন।','This confirmation link or code has expired. Request a new one.'],
 };
 if(messages[code])return messages[code][lang==='bn'?0:1];
 if(/fetch|network|timeout|timed out/i.test(message))return lang==='bn'?'সংযোগে সমস্যা হয়েছে। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।':'There was a connection problem. Check your internet connection and try again.';
 return message||(lang==='bn'?'এই মুহূর্তে কাজটি সম্পন্ন হয়নি। আবার চেষ্টা করুন।':'Unable to complete authentication. Please try again.');
}
